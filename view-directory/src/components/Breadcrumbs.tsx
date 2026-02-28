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
        <div className="breadcrumbs" style={{ padding: '8px', display: 'flex', gap: '8px', alignItems: 'center', minHeight: '36px', overflowX: 'auto' }}>
            <span
                style={{ color: '#666', cursor: 'pointer' }}
                onClick={handleRootClick}
                role="button"
                tabIndex={0}
            >
                root
            </span>
            {path.map((node, index) => (
                <React.Fragment key={node.id}>
                    <span style={{ color: '#999' }}>/</span>
                    <span
                        style={{
                            fontWeight: node.id === activeNodeId ? 'bold' : 'normal',
                            cursor: 'pointer'
                        }}
                        onClick={() => handleNodeClick(node, index)}
                        role="button"
                        tabIndex={0}
                    >
                        {node.name}
                    </span>
                </React.Fragment>
            ))}
        </div>
    );
};
