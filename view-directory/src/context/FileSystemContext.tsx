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
                // Fetching from json-server port defined in package.json
                const response = await fetch('http://localhost:3001/files');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const rawData = await response.json();

                // The tree is fully nested, so we normalize it locally
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
        // Implement fetching logic here if lazy loading is needed in the future
        console.log('fetchChildren', directoryId);
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
