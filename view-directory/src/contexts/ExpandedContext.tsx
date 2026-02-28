import React, { createContext, useContext, useState, useCallback } from 'react';

interface ExpandedContextType {
    expandedIds: Set<string>;
    toggleExpanded: (id: string, forceStatus?: boolean) => void;
    setExpandedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const ExpandedContext = createContext<ExpandedContextType | undefined>(undefined);

export const ExpandedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const toggleExpanded = useCallback((id: string, forceStatus?: boolean) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (forceStatus === true) {
                next.add(id);
            } else if (forceStatus === false) {
                next.delete(id);
            } else {
                if (next.has(id)) next.delete(id);
                else next.add(id);
            }
            return next;
        });
    }, []);

    return (
        <ExpandedContext.Provider value={{ expandedIds, toggleExpanded, setExpandedIds }}>
            {children}
        </ExpandedContext.Provider>
    );
};

export const useExpanded = () => {
    const context = useContext(ExpandedContext);
    if (context === undefined) {
        throw new Error('useExpanded must be used within an ExpandedProvider');
    }
    return context;
};
