import { FetchFilesResponse, FileSystemState, NormalizedFileNode, RawFileNode } from './types';

/**
 * Recursively normalizes a nested tree of files into a flat dictionary
 * optimized for O(1) lookups and updates in React state.
 */
export function normalizeFileSystemData(rawData: FetchFilesResponse): FileSystemState {
    const nodes: Record<string, NormalizedFileNode> = {};
    const rootIds: string[] = [];

    // Helper function for DFS traversal
    function traverseAndNormalize(node: RawFileNode, parentId: string | null) {
        const normalizedNode: NormalizedFileNode = {
            id: node.id,
            name: node.name,
            type: node.type,
            parentId,
        };

        if (node.type === 'file') {
            normalizedNode.content = node.content;
        }

        if (node.type === 'directory') {
            normalizedNode.childrenIds = [];
            if (node.children && node.children.length > 0) {
                node.children.forEach((child) => {
                    normalizedNode.childrenIds?.push(child.id);
                    traverseAndNormalize(child, node.id);
                });
            }
        }

        nodes[node.id] = normalizedNode;
    }

    // Kick off traversal for all root-level items
    rawData.forEach((rootNode) => {
        rootIds.push(rootNode.id);
        traverseAndNormalize(rootNode, null);
    });

    return {
        nodes,
        rootIds,
    };
}
