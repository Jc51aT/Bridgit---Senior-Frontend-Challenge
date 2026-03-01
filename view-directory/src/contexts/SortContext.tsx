import React, { createContext, useContext, useState, ReactNode } from 'react';

export type SortField = 'name' | 'type';
export type SortDirection = 'asc' | 'desc';

interface SortContextType {
    sortField: SortField;
    sortDirection: SortDirection;
    setSortField: (field: SortField) => void;
    setSortDirection: (direction: SortDirection) => void;
}

const SortContext = createContext<SortContextType | undefined>(undefined);

export const SortProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    return (
        <SortContext.Provider value={{ sortField, sortDirection, setSortField, setSortDirection }}>
            {children}
        </SortContext.Provider>
    );
};

export const useSortContext = () => {
    const context = useContext(SortContext);
    if (context === undefined) {
        throw new Error('useSortContext must be used within a SortProvider');
    }
    return context;
};
