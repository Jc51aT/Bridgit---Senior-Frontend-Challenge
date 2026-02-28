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
            <div style={{ paddingLeft: '24px', color: '#888', fontStyle: 'italic', fontSize: '0.9em' }}>
                ⏳ Loading...
            </div>
        );
    }

    if (isError) {
        return (
            <div style={{ paddingLeft: '24px', color: 'red', fontSize: '0.9em' }}>
                ⚠️ Error loading folder: {(error as Error).message}
            </div>
        );
    }

    if (!nodes || nodes.length === 0) {
        return (
            <div style={{ paddingLeft: '24px', color: '#888', fontStyle: 'italic', fontSize: '0.9em' }}>
                (Empty folder)
            </div>
        );
    }

    return (
        <div
            ref={parentRef}
            style={{
                maxHeight: parentId === 'root' ? '80vh' : '400px',
                overflowY: 'auto',
                contain: 'strict'
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

