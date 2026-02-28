import { useState, useEffect, useCallback } from 'react';
import { FetchFilesResponse, FileSystemState } from '../types';
import { normalizeFileSystemData } from '../utils';

// Simulate fetching data from the backend
const fetchFiles = async (): Promise<FetchFilesResponse> => {
    // Try fetching from public/db.json which json-server/vite can serve
    // In a real app this would be a real API endpoint
    try {
        const response = await fetch('/db.json');
        const data = await response.json();
        return data.files;
    } catch (error) {
        console.error("Failed to fetch files", error);
        // Return empty state on failure, or could mock data here
        return [];
    }
};

export function useFileSystem() {
    const [fileSystem, setFileSystem] = useState<FileSystemState>({
        nodes: {},
        rootIds: [],
    });

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Load and normalize data on mount
    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const rawData = await fetchFiles();
                if (isMounted) {
                    const normalizedState = normalizeFileSystemData(rawData);
                    setFileSystem(normalizedState);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err.message || 'An unknown error occurred');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    // Update a specific node without mutating the entire state tree heavily
    const updateNode = useCallback((nodeId: string, updates: Partial<FileSystemState['nodes'][string]>) => {
        setFileSystem((prevState) => ({
            ...prevState,
            nodes: {
                ...prevState.nodes,
                [nodeId]: {
                    ...prevState.nodes[nodeId],
                    ...updates,
                },
            },
        }));
    }, []);

    return {
        fileSystem,
        isLoading,
        error,
        updateNode,
    };
}
