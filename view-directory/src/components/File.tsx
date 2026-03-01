import React from 'react';
import { FileNode } from '../types';
import { HighlightMatch } from './SearchBar';
import { handleTreeKeyDown } from '../utils/keyboardNav';
import { useActiveNode } from '../contexts/ActiveNodeContext';
import { useSearchContext } from '../contexts/SearchContext';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from '../contexts/I18nContext';

export const File: React.FC<{ node: FileNode }> = ({ node }) => {
    const { setActiveNodeId, activeNodeId } = useActiveNode();
    const { searchQuery } = useSearchContext();
    const { t } = useTranslation();

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

    const isActive = activeNodeId === node.id;

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className="file"
            role="treeitem"
            tabIndex={0}
            aria-label={`${t('fileLabel')}${node.name}`}
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
                padding: '8px 12px',
                margin: '2px 0',
                borderRadius: 'var(--radius-md)',
                userSelect: 'none',
                opacity: isDragging ? 0.5 : 1,
                transform: CSS.Translate.toString(transform),
                backgroundColor: isActive ? 'var(--bg-active)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            }}
            onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
            }}
        >
            <span
                style={{
                    marginRight: '12px',
                    fontSize: '1.2em',
                    filter: isActive ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' : 'none'
                }}
            >
                📄
            </span>
            <span style={{ fontWeight: isActive ? '500' : '400' }}><HighlightMatch text={node.name} query={searchQuery} /></span>
        </div>
    );
};
