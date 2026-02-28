import React, { useState, useRef, useEffect } from 'react';
import { NormalizedFileNode } from '../types';
import { FileList } from './FileList';
import { useFileSystem } from '../context/FileSystemContext';

export const Directory: React.FC<{ node: NormalizedFileNode }> = ({ node }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { fetchChildren } = useFileSystem();

    const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Cleanup timers and fetch requests on unmount
    useEffect(() => {
        return () => {
            if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };
    }, []);

    const handleMouseEnter = () => {
        // Only trigger prefetch if the directory is closed and not already fetched/fetching
        if (!isOpen && !node.isLoaded && !node.isLoading) {
            hoverTimerRef.current = setTimeout(() => {
                abortControllerRef.current = new AbortController();
                fetchChildren(node.id, abortControllerRef.current.signal);
            }, 100); // 100ms hover delay
        }
    };

    const handleMouseLeave = () => {
        // Clear the timeout to prevent "drive-by" prefetch requests
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }

        // If a request is in-flight because of hovering, cancel it when mouse leaves.
        // Once a user explicitly clicks to open the folder, we unset abortControllerRef
        // so moving the mouse away doesn't cancel the explicitly requested expansion.
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    };

    const handleToggle = () => {
        if (!isOpen && !node.isLoaded && !node.isLoading) {
            // Unset the abort controller here so that when the user explicitly clicks 
            // the node, subsequent mouse movement doesn't cancel their explicit request
            abortControllerRef.current = null;
            fetchChildren(node.id);
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className="directory">
            <div
                className="directory-header"
                onClick={handleToggle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px 0', userSelect: 'none' }}
            >
                <span style={{ marginRight: '8px', fontSize: '1.2em' }}>{isOpen ? '📂' : '📁'}</span>
                <span>{node.name}</span>
            </div>

            {isOpen && node.isLoading && (
                <div style={{ paddingLeft: '36px', color: '#888', fontStyle: 'italic', fontSize: '0.9em' }}>
                    ⏳ Loading...
                </div>
            )}

            {isOpen && !node.isLoading && node.childrenIds && (
                <div className="directory-contents" style={{ paddingLeft: '24px', borderLeft: '1px solid #eee', marginLeft: '12px' }}>
                    <FileList nodeIds={node.childrenIds} />
                </div>
            )}
        </div>
    );
};
