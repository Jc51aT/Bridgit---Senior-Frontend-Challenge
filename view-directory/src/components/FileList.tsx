import React, { useRef, useMemo } from 'react';
import { useDirectory } from '../hooks/useDirectory';
import { Directory } from './Directory';
import { File } from './File';
import { SkeletonList } from './SkeletonList';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useTranslation } from '../contexts/I18nContext';
import { useSortContext } from '../contexts/SortContext';
import { useSelection } from '../contexts/SelectionContext';

export const FileList: React.FC<{ parentId: string }> = ({ parentId }) => {
    const { data: nodes, isLoading, isError, error } = useDirectory(parentId);
    const parentRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();
    const { sortField, sortDirection } = useSortContext();
    const { clearSelection } = useSelection();

    const sortedNodes = useMemo(() => {
        if (!nodes) return [];
        return [...nodes].sort((a, b) => {
            // Directories always come first
            if (a.type !== b.type) {
                return a.type === 'directory' ? -1 : 1;
            }
            let cmp: number;
            if (sortField === 'name') {
                cmp = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
            } else {
                cmp = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
            }
            return sortDirection === 'asc' ? cmp : -cmp;
        });
    }, [nodes, sortField, sortDirection]);

    // Ordered IDs for shift-click range selection
    const siblingIds = useMemo(() => sortedNodes.map(n => n.id), [sortedNodes]);

    const rowVirtualizer = useVirtualizer({
        count: sortedNodes.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 32,
        overscan: 5,
    });

    if (isLoading) {
        return <SkeletonList />;
    }

    if (isError) {
        return (
            <div style={{ padding: '12px 24px', color: '#ef4444', fontSize: '0.9em', backgroundColor: '#fef2f2', borderRadius: 'var(--radius-sm)', margin: '8px 0' }}>
                <span style={{ marginRight: '8px' }}>⚠️</span> {t('errorLoading')}{(error as Error).message}
            </div>
        );
    }

    if (!nodes || nodes.length === 0) {
        return (
            <div style={{ padding: '12px 24px', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9em' }}>
                {t('emptyFolder')}
            </div>
        );
    }

    const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Only clear if clicking directly on the container (not a child)
        if (e.target === e.currentTarget) {
            clearSelection();
        }
    };

    return (
        <div
            ref={parentRef}
            style={{
                height: parentId === 'root' ? '80vh' : '400px',
                overflowY: 'auto'
            }}
            onClick={handleBackgroundClick}
        >
            <div
                className="file-list"
                role={parentId === 'root' ? 'tree' : 'group'}
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative'
                }}
                onClick={handleBackgroundClick}
            >
                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                    const node = sortedNodes[virtualItem.index];
                    return (
                        <div
                            key={node.id}
                            data-index={virtualItem.index}
                            ref={rowVirtualizer.measureElement}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                transform: `translateY(${virtualItem.start}px)`,
                            }}
                        >
                            {node.type === 'directory'
                                ? <Directory node={node} siblingIds={siblingIds} />
                                : <File node={node} siblingIds={siblingIds} />
                            }
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
