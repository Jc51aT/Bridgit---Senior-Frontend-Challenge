import React, { createContext, useContext, useState, useEffect } from 'react';
import { NormalizedFileNode, FileSystemState } from '../types';
import { normalizeFileSystemData } from '../utils';

interface FileSystemActionContextType {
    state: FileSystemState;
    loading: boolean;
    error: string | null;
    fetchChildren: (directoryId: string) => Promise<void>;
    toggleSelection: (id: string) => void;
    // renameItem: (id: string, newName: string) => void;
    // deleteItem: (id: string) => void;
}

const FileSystemContext = createContext<FileSystemActionContextType | undefined>(undefined);

export const useFileSystem = () => {
    const context = useContext(FileSystemContext);
    if (!context) {
        throw new Error('useFileSystem must be used within a FileSystemProvider');
    }
    return context;
};

export const FileSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<FileSystemState>({ nodes: {}, rootIds: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetching only root files initially
                const response = await fetch('http://localhost:3001/files?parentId=root');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const rawData = await response.json();

                // Normalize and store the initial root files
                const normalizedData = normalizeFileSystemData(rawData);
                setState(normalizedData);
            } catch (err: any) {
                console.error("Failed to fetch initial file system data", err);
                setError(err.message || "Failed to connect to JSON server.");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const fetchChildren = async (directoryId: string) => {
        // Optimistically set loading state for this directory
        setState((prevState) => {
            const dirNode = prevState.nodes[directoryId];
            if (!dirNode) return prevState;

            return {
                ...prevState,
                nodes: {
                    ...prevState.nodes,
                    [directoryId]: { ...dirNode, isLoading: true }
                }
            };
        });

        try {
            const response = await fetch(`http://localhost:3001/files?parentId=${directoryId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const rawData = await response.json();

            setState((prevState) => normalizeFileSystemData(rawData, prevState, directoryId));
        } catch (err: any) {
            console.error(`Failed to fetch children for directory ${directoryId}`, err);
            setState((prevState) => {
                const dirNode = prevState.nodes[directoryId];
                if (!dirNode) return prevState;

                return {
                    ...prevState,
                    nodes: {
                        ...prevState.nodes,
                        [directoryId]: { ...dirNode, isLoading: false }
                    }
                };
            });
        }
    };

    const toggleSelection = (id: string) => {
        console.log('toggleSelection', id);
    }

    return (
        <FileSystemContext.Provider value={{ state, loading, error, fetchChildren, toggleSelection }}>
            {children}
        </FileSystemContext.Provider>
    );
};
