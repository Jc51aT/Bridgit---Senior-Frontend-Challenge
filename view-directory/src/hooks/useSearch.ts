import { useQuery } from '@tanstack/react-query';
import { RawFileNode } from '../types';

const MAX_RESULTS = 20;

export function useSearch(debouncedTerm: string) {
    const trimmed = debouncedTerm.trim().toLowerCase();
    const enabled = trimmed.length >= 2;

    const query = useQuery({
        queryKey: ['search', 'allFiles'],
        queryFn: async (): Promise<RawFileNode[]> => {
            const res = await fetch('http://localhost:3001/files');
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        },
        staleTime: 1000 * 60 * 10, // Cache all files for 10 minutes
        enabled,
    });

    const allNodes = query.data ?? [];

    // Build a map for ancestor lookups
    const nodeMap = new Map<string, RawFileNode>();
    for (const node of allNodes) {
        nodeMap.set(node.id, node);
    }

    // Filter by name match
    const results = enabled
        ? allNodes
            .filter((node) => node.name.toLowerCase().includes(trimmed))
            .slice(0, MAX_RESULTS)
        : [];

    return {
        results,
        nodeMap,
        isLoading: enabled && query.isLoading,
        isError: query.isError,
    };
}
