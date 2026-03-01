import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RawFileNode } from '../types';

interface MenuPosition {
    x: number;
    y: number;
}

interface ContextMenuState {
    node: RawFileNode;
    position: MenuPosition;
}

interface ContextMenuContextType {
    menuState: ContextMenuState | null;
    openMenu: (node: RawFileNode, x: number, y: number) => void;
    closeMenu: () => void;
}

const ContextMenuContext = createContext<ContextMenuContextType | undefined>(undefined);

export const ContextMenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [menuState, setMenuState] = useState<ContextMenuState | null>(null);

    const openMenu = (node: RawFileNode, x: number, y: number) => {
        setMenuState({ node, position: { x, y } });
    };

    const closeMenu = () => {
        setMenuState(null);
    };

    return (
        <ContextMenuContext.Provider value={{ menuState, openMenu, closeMenu }}>
            {children}
        </ContextMenuContext.Provider>
    );
};

export const useContextMenu = () => {
    const context = useContext(ContextMenuContext);
    if (!context) {
        throw new Error('useContextMenu must be used within a ContextMenuProvider');
    }
    return context;
};
