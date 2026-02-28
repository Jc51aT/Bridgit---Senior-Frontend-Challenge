import { FetchFilesResponse, FileSystemState, NormalizedFileNode, RawFileNode } from './types';

/**
 * Merges newly fetched flat array of files into the existing file system state.
 * Optimized for O(1) lookups and updates in React state.
 */
export function normalizeFileSystemData(
    rawData: FetchFilesResponse,
    existingState?: FileSystemState,
    parentIdToUpdate?: string
): FileSystemState {
    const nodes: Record<string, NormalizedFileNode> = { ...(existingState?.nodes || {}) };
    const rootIds: string[] = existingState ? [...existingState.rootIds] : [];

    // The fetched data is already flat
    rawData.forEach((node) => {
        const normalizedNode: NormalizedFileNode = {
            id: node.id,
            name: node.name,
            type: node.type,
            parentId: node.parentId,
            isLoading: false,
            isLoaded: false,
        };

        if (node.type === 'file') {
            normalizedNode.content = node.content;
        }

        if (node.type === 'directory') {
            normalizedNode.childrenIds = [];
        }

        nodes[node.id] = normalizedNode;

        if (node.parentId === 'root') {
            if (!rootIds.includes(node.id)) {
                rootIds.push(node.id);
            }
        }
    });

    // If we're fetching children for a specific parent, update its childrenIds and status
    if (parentIdToUpdate && nodes[parentIdToUpdate]) {
        nodes[parentIdToUpdate] = {
            ...nodes[parentIdToUpdate],
            childrenIds: rawData.map(node => node.id),
            isLoading: false,
            isLoaded: true,
        };
    }

    return {
        nodes,
        rootIds,
    };
}
