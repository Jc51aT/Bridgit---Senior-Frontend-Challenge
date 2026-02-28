import { useQuery } from '@tanstack/react-query';
import { RawFileNode } from '../types';

export function useDirectory(parentId: string) {
    return useQuery({
        queryKey: ['directory', parentId],
        queryFn: async (): Promise<RawFileNode[]> => {
            const res = await fetch(`http://localhost:3001/files?parentId=${parentId}`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
}
