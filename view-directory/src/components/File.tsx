import React from 'react';
import { RawFileNode } from '../types';

export const File: React.FC<{ node: RawFileNode }> = ({ node }) => {
    const handleToggleSelection = () => {
        console.log('toggleSelection', node.id);
    };

    return (
        <div
            className="file"
            role="treeitem"
            tabIndex={0}
            aria-label={`File: ${node.name}`}
            onClick={handleToggleSelection}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggleSelection();
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
