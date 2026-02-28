import React, { useRef } from 'react';
import { useDirectory } from '../hooks/useDirectory';
import { Directory } from './Directory';
import { File } from './File';
import { useVirtualizer } from '@tanstack/react-virtual';

export const FileList: React.FC<{ parentId: string }> = ({ parentId }) => {
    const { data: nodes, isLoading, isError, error } = useDirectory(parentId);
    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: nodes?.length ?? 0,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 32,
        overscan: 5,
    });

    if (isLoading) {
        return (
            <div style={{ padding: '12px 24px', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9em' }}>
                <span style={{ marginRight: '8px' }}>⏳</span> Loading...
            </div>
        );
    }

    if (isError) {
        return (
            <div style={{ padding: '12px 24px', color: '#ef4444', fontSize: '0.9em', backgroundColor: '#fef2f2', borderRadius: 'var(--radius-sm)', margin: '8px 0' }}>
                <span style={{ marginRight: '8px' }}>⚠️</span> Error loading folder: {(error as Error).message}
            </div>
        );
    }

    if (!nodes || nodes.length === 0) {
        return (
            <div style={{ padding: '12px 24px', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9em' }}>
                (Empty folder)
            </div>
        );
    }

    return (
        <div
            ref={parentRef}
            style={{
                height: parentId === 'root' ? '80vh' : '400px',
                overflowY: 'auto'
            }}
        >
            <div
                className="file-list"
                role={parentId === 'root' ? 'tree' : 'group'}
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative'
                }}
            >
                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                    const node = nodes[virtualItem.index];
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
                                ? <Directory node={node} />
                                : <File node={node} />
                            }
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

