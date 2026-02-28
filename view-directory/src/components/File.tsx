import React from 'react';
import { FileNode } from '../types';
import { handleTreeKeyDown } from '../utils/keyboardNav';
import { useActiveNode } from '../contexts/ActiveNodeContext';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export const File: React.FC<{ node: FileNode }> = ({ node }) => {
    const { setActiveNodeId, activeNodeId } = useActiveNode();

    const handleToggleSelection = () => {
        setActiveNodeId(node.id);
    };

    const handleFocus = () => {
        setActiveNodeId(node.id);
    };

    const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
        id: node.id,
        data: { parentId: node.parentId, type: 'file' }
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
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
                cursor: 'grab',
                display: 'flex',
                alignItems: 'center',
                padding: '4px 0',
                userSelect: 'none',
                opacity: isDragging ? 0.5 : 1,
                transform: CSS.Translate.toString(transform),
            }}
        >
            <span style={{ marginRight: '8px', fontSize: '1.2em' }}>📄</span>
            <span>{node.name}</span>
        </div>
    );
};
