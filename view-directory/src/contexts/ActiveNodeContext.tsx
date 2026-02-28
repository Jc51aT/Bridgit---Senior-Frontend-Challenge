import React, { createContext, useContext, useState } from 'react';

interface ActiveNodeContextType {
    activeNodeId: string | null;
    setActiveNodeId: (id: string | null) => void;
}

const ActiveNodeContext = createContext<ActiveNodeContextType | undefined>(undefined);

export const ActiveNodeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

    return (
        <ActiveNodeContext.Provider value={{ activeNodeId, setActiveNodeId }}>
            {children}
        </ActiveNodeContext.Provider>
    );
};

export const useActiveNode = () => {
    const context = useContext(ActiveNodeContext);
    if (context === undefined) {
        throw new Error('useActiveNode must be used within an ActiveNodeProvider');
    }
    return context;
};
