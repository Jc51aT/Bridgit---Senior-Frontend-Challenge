import React, { useState } from 'react';
import { DirectoryNode, RawFileNode } from '../types';
import { FileList } from './FileList';
import { useQueryClient } from '@tanstack/react-query';
import { handleTreeKeyDown } from '../utils/keyboardNav';
import { useActiveNode } from '../contexts/ActiveNodeContext';

export const Directory: React.FC<{ node: DirectoryNode }> = ({ node }) => {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();
    const { setActiveNodeId, activeNodeId } = useActiveNode();

    const handleMouseEnter = () => {
        if (!isOpen) {
            // Prefetch on hover just like before, but leveraging React Query cache
            queryClient.prefetchQuery({
                queryKey: ['directory', node.id],
                queryFn: async (): Promise<RawFileNode[]> => {
                    const res = await fetch(`http://localhost:3001/files?parentId=${node.id}`);
                    if (!res.ok) throw new Error("Network error");
                    return res.json();
                },
                staleTime: 1000 * 60 * 5, // 5 minutes
            });
        }
    };

    const handleToggle = () => {
        setIsOpen(!isOpen);
        setActiveNodeId(node.id);
    };

    const handleFocus = () => {
        setActiveNodeId(node.id);
    };

    return (
        <div className="directory">
            <div
                className="directory-header"
                role="treeitem"
                tabIndex={0}
                aria-expanded={isOpen}
                aria-label={`Folder: ${node.name}`}
                onClick={handleToggle}
                onFocus={handleFocus}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleToggle();
                    } else {
                        handleTreeKeyDown(e as React.KeyboardEvent<HTMLElement>, {
                            isOpen,
                            toggle: handleToggle,
                            isDir: true,
                        });
                    }
                }}
                onMouseEnter={handleMouseEnter}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px 0', userSelect: 'none' }}
            >
                <span style={{ marginRight: '8px', fontSize: '1.2em' }}>{isOpen ? '📂' : '📁'}</span>
                <span>{node.name}</span>
            </div>

            {isOpen && (
                <div className="directory-contents" style={{ paddingLeft: '24px', borderLeft: '1px solid #eee', marginLeft: '12px' }}>
                    <FileList parentId={node.id} />
                </div>
            )}
        </div>
    );
};
