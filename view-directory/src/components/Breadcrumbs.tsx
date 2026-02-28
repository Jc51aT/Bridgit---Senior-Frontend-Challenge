import React, { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useActiveNode } from '../contexts/ActiveNodeContext';
import { useExpanded } from '../contexts/ExpandedContext';
import { RawFileNode } from '../types';

export const Breadcrumbs: React.FC = () => {
    const { activeNodeId, setActiveNodeId } = useActiveNode();
    const { toggleExpanded, setExpandedIds } = useExpanded();
    const queryClient = useQueryClient();

    const path = useMemo(() => {
        if (!activeNodeId) return [];

        // Get all currently cached directory entries
        const allQueries = queryClient.getQueriesData<RawFileNode[]>({ queryKey: ['directory'] });
        const allNodes = allQueries.flatMap(([, data]) => data || []);

        const nodeMap = new Map<string, RawFileNode>();
        for (const node of allNodes) {
            nodeMap.set(node.id, node);
        }

        const currentPath: RawFileNode[] = [];
        let currId: string | null = activeNodeId;

        // Prevent infinite loops just in case
        const seen = new Set<string>();

        while (currId && currId !== 'root') {
            if (seen.has(currId)) break;
            seen.add(currId);

            const node = nodeMap.get(currId);
            if (!node) {
                // Node might not be in cache if we reached it somehow without loading parents
                // but since we navigated there, it should be.
                break;
            }
            currentPath.unshift(node);
            currId = node.parentId;
        }

        return currentPath;
    }, [activeNodeId, queryClient]);

    if (!activeNodeId) {
        return <div className="breadcrumbs" style={{ padding: '8px', minHeight: '36px' }}>Select a file or folder</div>;
    }

    const handleRootClick = () => {
        setActiveNodeId(null);
        // Optional: clear all expansions when going to root, or just those in the current path
        setExpandedIds(prev => {
            const next = new Set(prev);
            path.forEach(n => next.delete(n.id));
            return next;
        });
    };

    const handleNodeClick = (node: RawFileNode, index: number) => {
        setActiveNodeId(node.id);
        toggleExpanded(node.id, true); // Ensure the clicked node is open

        // Close all directories that are deeper in this specific path
        const nodesToClose = path.slice(index + 1);
        setExpandedIds(prev => {
            const next = new Set(prev);
            nodesToClose.forEach(n => next.delete(n.id));
            return next;
        });
    };

    return (
        <div
            className="breadcrumbs"
            style={{
                padding: '12px 16px',
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                minHeight: '44px',
                overflowX: 'auto',
                backgroundColor: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                fontSize: '0.95em',
            }}
        >
            <span
                className="breadcrumb-item"
                style={{
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'all 0.2s',
                    fontWeight: activeNodeId === null ? '600' : '500',
                    backgroundColor: activeNodeId === null ? 'var(--bg-active)' : 'transparent',
                }}
                onClick={handleRootClick}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = activeNodeId === null ? 'var(--bg-active)' : 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = activeNodeId === null ? 'var(--bg-active)' : 'transparent'}
                role="button"
                tabIndex={0}
            >
                Root
            </span>
            {path.map((node, index) => {
                const isActive = node.id === activeNodeId;
                return (
                    <React.Fragment key={node.id}>
                        <span style={{ color: 'var(--border-color)', userSelect: 'none' }}>/</span>
                        <span
                            className="breadcrumb-item"
                            style={{
                                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                fontWeight: isActive ? '600' : '500',
                                cursor: 'pointer',
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-sm)',
                                transition: 'all 0.2s',
                                backgroundColor: isActive ? 'var(--bg-active)' : 'transparent',
                            }}
                            onClick={() => handleNodeClick(node, index)}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isActive ? 'var(--bg-active)' : 'var(--bg-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isActive ? 'var(--bg-active)' : 'transparent'}
                            role="button"
                            tabIndex={0}
                        >
                            {node.name}
                        </span>
                    </React.Fragment>
                );
            })}
        </div>
    );
};
