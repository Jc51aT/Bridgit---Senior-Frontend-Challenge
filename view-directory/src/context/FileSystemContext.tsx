import React, { createContext, useContext, useState } from 'react';
import { NormalizedFileNode, FileSystemState } from '../types';

interface FileSystemActionContextType {
    state: FileSystemState;
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

    const fetchChildren = async (directoryId: string) => {
        // Implement fetching logic here
        console.log('fetchChildren', directoryId);
    };

    const toggleSelection = (id: string) => {
        console.log('toggleSelection', id);
    }

    return (
        <FileSystemContext.Provider value={{ state, fetchChildren, toggleSelection }}>
            {children}
        </FileSystemContext.Provider>
    );
};
