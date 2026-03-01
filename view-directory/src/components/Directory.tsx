import React from 'react';
import { DirectoryNode, RawFileNode } from '../types';
import { FileList } from './FileList';
import { HighlightMatch } from './SearchBar';
import { useQueryClient } from '@tanstack/react-query';
import { handleTreeKeyDown } from '../utils/keyboardNav';
import { useActiveNode } from '../contexts/ActiveNodeContext';
import { useExpanded } from '../contexts/ExpandedContext';
import { useSearchContext } from '../contexts/SearchContext';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from '../contexts/I18nContext';

export const Directory: React.FC<{ node: DirectoryNode }> = ({ node }) => {
    const { expandedIds, toggleExpanded } = useExpanded();
    const isOpen = expandedIds.has(node.id);
    const queryClient = useQueryClient();
    const { setActiveNodeId, activeNodeId } = useActiveNode();
    const { searchQuery } = useSearchContext();
    const { t } = useTranslation();

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
        toggleExpanded(node.id);
        setActiveNodeId(node.id);
    };

    const handleFocus = () => {
        setActiveNodeId(node.id);
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

    const isActive = activeNodeId === node.id;
    const dragOverStyle = isOver ? { backgroundColor: 'var(--accent-color)', color: 'white', borderRadius: 'var(--radius-md)' } : {};

    return (
        <div className="directory" style={{ margin: '2px 0' }}>
            <div
                ref={setMergedRef}
                {...listeners}
                {...attributes}
                className="directory-header"
                role="treeitem"
                tabIndex={0}
                aria-expanded={isOpen}
                aria-label={`${t('folderLabel')}${node.name}`}
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
                style={{
                    cursor: 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    userSelect: 'none',
                    opacity: isDragging ? 0.5 : 1,
                    transform: CSS.Translate.toString(transform),
                    backgroundColor: isActive ? 'var(--bg-active)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease',
                    fontWeight: isOpen || isActive ? '600' : '500',
                    ...dragOverStyle
                }}
                onMouseOver={(e) => {
                    if (!isActive && !isOver) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }}
                onMouseOut={(e) => {
                    if (!isActive && !isOver) e.currentTarget.style.backgroundColor = 'transparent';
                }}
            >
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
