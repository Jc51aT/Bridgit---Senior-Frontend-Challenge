import React from 'react';
import { FileNode } from '../types';
import { HighlightMatch } from './SearchBar';
import { handleTreeKeyDown } from '../utils/keyboardNav';
import { useActiveNode } from '../contexts/ActiveNodeContext';
import { useSearchContext } from '../contexts/SearchContext';
import { useSelection } from '../contexts/SelectionContext';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from '../contexts/I18nContext';
import { useContextMenu } from '../contexts/ContextMenuContext';

interface FileProps {
    node: FileNode;
    siblingIds: string[];
}

export const File: React.FC<FileProps> = ({ node, siblingIds }) => {
    const { setActiveNodeId, activeNodeId } = useActiveNode();
    const { searchQuery } = useSearchContext();
    const { t } = useTranslation();
    const { openMenu } = useContextMenu();
    const { selectedIds, isMultiSelectMode, toggleSelected, selectRange, clearSelection, setLastClickedId } = useSelection();

    const isSelected = selectedIds.has(node.id);
    const isActive = activeNodeId === node.id;

    const handleClick = (e: React.MouseEvent) => {
        if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            toggleSelected(node.id);
        } else if (e.shiftKey) {
            e.preventDefault();
            selectRange(node.id, siblingIds);
        } else {
            // Plain click: clear multi-select, set single active
            if (isMultiSelectMode) {
                clearSelection();
            }
            setLastClickedId(node.id);
            setActiveNodeId(node.id);
        }
    };

    const handleFocus = () => {
        setActiveNodeId(node.id);
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        openMenu(node, e.clientX, e.clientY);
    };

    const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
        id: node.id,
        data: { parentId: node.parentId, type: 'file' }
    });

    const bgColor = isSelected
        ? 'var(--bg-selected)'
        : isActive
            ? 'var(--bg-active)'
            : 'transparent';

    const textColor = isSelected || isActive ? 'var(--text-primary)' : 'var(--text-secondary)';

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`file${isSelected ? ' node--selected' : ''}`}
            role="treeitem"
            tabIndex={0}
            aria-label={`${t('fileLabel')}${node.name}`}
            aria-selected={isSelected}
            onClick={handleClick}
            onFocus={handleFocus}
            onContextMenu={handleContextMenu}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick(e as unknown as React.MouseEvent);
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
                opacity: isDragging ? 0.4 : 1,
                transform: CSS.Translate.toString(transform),
                backgroundColor: bgColor,
                color: textColor,
                transition: 'all 0.15s ease',
                borderLeft: isSelected ? '3px solid var(--accent-color)' : '3px solid transparent',
            }}
            onMouseEnter={(e) => {
                if (!isSelected && !isActive) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            }}
            onMouseLeave={(e) => {
                if (!isSelected && !isActive) e.currentTarget.style.backgroundColor = 'transparent';
            }}
        >
            {/* Checkbox indicator — visible in multi-select mode */}
            {isMultiSelectMode && (
                <span
                    className={`selection-checkbox${isSelected ? ' selection-checkbox--checked' : ''}`}
                    aria-hidden="true"
                />
            )}
            <span
                style={{
                    marginRight: '12px',
                    fontSize: '1.2em',
                    filter: isActive ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' : 'none'
                }}
            >
                📄
            </span>
            <span style={{ fontWeight: isActive || isSelected ? '500' : '400' }}>
                <HighlightMatch text={node.name} query={searchQuery} />
            </span>
        </div>
    );
};
