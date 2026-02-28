import React, { useState } from 'react';
import { NormalizedFileNode } from '../types';
import { FileList } from './FileList';
import { useFileSystem } from '../context/FileSystemContext';

export const Directory: React.FC<{ node: NormalizedFileNode }> = ({ node }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { fetchChildren } = useFileSystem();

    const handleToggle = () => {
        if (!isOpen && (!node.childrenIds || node.childrenIds.length === 0)) {
            // Fetch children if we don't have them yet and we're opening
            fetchChildren(node.id);
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className="directory">
            <div
                className="directory-header"
                onClick={handleToggle}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px 0', userSelect: 'none' }}
            >
                <span style={{ marginRight: '8px', fontSize: '1.2em' }}>{isOpen ? '📂' : '📁'}</span>
                <span>{node.name}</span>
            </div>

            {isOpen && node.childrenIds && (
                <div className="directory-contents" style={{ paddingLeft: '24px', borderLeft: '1px solid #eee', marginLeft: '12px' }}>
                    <FileList nodeIds={node.childrenIds} />
                </div>
            )}
        </div>
    );
};
