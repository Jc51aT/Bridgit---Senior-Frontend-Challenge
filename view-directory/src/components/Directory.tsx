import React from 'react';
import { DirectoryNode, RawFileNode } from '../types';
import { FileList } from './FileList';
import { HighlightMatch } from './SearchBar';
import { useQueryClient } from '@tanstack/react-query';
import { handleTreeKeyDown } from '../utils/keyboardNav';
import { useActiveNode } from '../contexts/ActiveNodeContext';
import { useExpanded } from '../contexts/ExpandedContext';
import { useSearchContext } from '../contexts/SearchContext';
import { useSelection } from '../contexts/SelectionContext';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from '../contexts/I18nContext';
import { useContextMenu } from '../contexts/ContextMenuContext';

interface DirectoryProps {
    node: DirectoryNode;
    siblingIds: string[];
}

export const Directory: React.FC<DirectoryProps> = ({ node, siblingIds }) => {
    const { expandedIds, toggleExpanded } = useExpanded();
    const isOpen = expandedIds.has(node.id);
    const queryClient = useQueryClient();
    const { setActiveNodeId, activeNodeId } = useActiveNode();
    const { searchQuery } = useSearchContext();
    const { t } = useTranslation();
    const { openMenu } = useContextMenu();
    const { selectedIds, isMultiSelectMode, toggleSelected, selectRange, clearSelection, setLastClickedId } = useSelection();

    const isSelected = selectedIds.has(node.id);
    const isActive = activeNodeId === node.id;

    const handleMouseEnter = () => {
        if (!isOpen) {
            queryClient.prefetchQuery({
                queryKey: ['directory', node.id],
                queryFn: async (): Promise<RawFileNode[]> => {
                    const res = await fetch(`http://localhost:3001/files?parentId=${node.id}`);
                    if (!res.ok) throw new Error("Network error");
                    return res.json();
                },
                staleTime: 1000 * 60 * 5,
            });
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            toggleSelected(node.id);
        } else if (e.shiftKey) {
            e.preventDefault();
            selectRange(node.id, siblingIds);
        } else {
            if (isMultiSelectMode) {
                clearSelection();
            }
            setLastClickedId(node.id);
            toggleExpanded(node.id);
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

    const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
        id: node.id,
        data: { type: 'directory' }
    });

    const { attributes, listeners, setNodeRef: setDraggableNodeRef, isDragging, transform } = useDraggable({
        id: node.id,
        data: { parentId: node.parentId, type: 'directory' }
    });

    const setMergedRef = (element: HTMLElement | null) => {
        setDroppableNodeRef(element);
        setDraggableNodeRef(element);
    };

    const dragOverStyle = isOver ? { backgroundColor: 'var(--accent-color)', color: 'white', borderRadius: 'var(--radius-md)' } : {};

    const bgColor = isSelected
        ? 'var(--bg-selected)'
        : isActive
            ? 'var(--bg-active)'
            : 'transparent';

    return (
        <div className="directory" style={{ margin: '2px 0' }}>
            <div
                ref={setMergedRef}
                {...listeners}
                {...attributes}
                className={`directory-header${isSelected ? ' node--selected' : ''}`}
                role="treeitem"
                tabIndex={0}
                aria-expanded={isOpen}
                aria-selected={isSelected}
                aria-label={`${t('folderLabel')}${node.name}`}
                onClick={handleClick}
                onFocus={handleFocus}
                onContextMenu={handleContextMenu}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleClick(e as unknown as React.MouseEvent);
                    } else {
                        handleTreeKeyDown(e as React.KeyboardEvent<HTMLElement>, {
                            isOpen,
                            toggle: () => {
                                toggleExpanded(node.id);
                                setActiveNodeId(node.id);
                            },
                            isDir: true,
                        });
                    }
                }}
                onMouseEnter={handleMouseEnter}
                style={{
                    cursor: 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    userSelect: 'none',
                    opacity: isDragging ? 0.4 : 1,
                    transform: CSS.Translate.toString(transform),
                    backgroundColor: bgColor,
                    color: isSelected || isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease',
                    fontWeight: isOpen || isActive || isSelected ? '600' : '500',
                    borderLeft: isSelected ? '3px solid var(--accent-color)' : '3px solid transparent',
                    ...dragOverStyle
                }}
                onMouseOver={(e) => {
                    if (!isSelected && !isActive && !isOver) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }}
                onMouseOut={(e) => {
                    if (!isSelected && !isActive && !isOver) e.currentTarget.style.backgroundColor = isSelected ? 'var(--bg-selected)' : 'transparent';
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
                        transition: 'transform 0.2s ease',
                        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                        display: 'inline-block',
                        filter: isActive ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' : 'none'
                    }}
                >
                    {isOpen ? '📂' : '📁'}
                </span>
                <span><HighlightMatch text={node.name} query={searchQuery} /></span>
            </div>

            {isOpen && (
                <div
                    className="directory-contents"
                    style={{
                        paddingLeft: '16px',
                        borderLeft: '2px solid var(--border-color)',
                        marginLeft: '18px',
                        marginTop: '4px'
                    }}
                >
                    <FileList parentId={node.id} />
                </div>
            )}
        </div>
    );
};
