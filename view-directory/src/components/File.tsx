import React from 'react';
import { FileNode } from '../types';
import { handleTreeKeyDown } from '../utils/keyboardNav';
import { useActiveNode } from '../contexts/ActiveNodeContext';

export const File: React.FC<{ node: FileNode }> = ({ node }) => {
    const { setActiveNodeId, activeNodeId } = useActiveNode();

    const handleToggleSelection = () => {
        setActiveNodeId(node.id);
    };

    const handleFocus = () => {
        setActiveNodeId(node.id);
    };

    return (
        <div
            className="file"
            role="treeitem"
            tabIndex={0}
            aria-label={`File: ${node.name}`}
            onClick={handleToggleSelection}
            onFocus={handleFocus}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggleSelection();
                } else {
                    handleTreeKeyDown(e as React.KeyboardEvent<HTMLElement>);
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
