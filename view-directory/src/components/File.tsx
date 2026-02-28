import React from 'react';
import { NormalizedFileNode } from '../types';
import { useFileSystem } from '../context/FileSystemContext';

export const File: React.FC<{ node: NormalizedFileNode }> = ({ node }) => {
    const { toggleSelection } = useFileSystem();

    return (
        <div
            className="file"
            role="button"
            tabIndex={0}
            aria-label={`File: ${node.name}`}
            onClick={() => toggleSelection(node.id)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleSelection(node.id);
                }
            }}
            style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px 0',
                userSelect: 'none'
            }}
        >
            <span style={{ marginRight: '8px', fontSize: '1.2em' }}>📄</span>
            <span>{node.name}</span>
        </div>
    );
};
