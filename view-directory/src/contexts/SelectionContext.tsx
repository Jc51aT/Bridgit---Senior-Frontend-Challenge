import React, { createContext, useContext, useState, useCallback } from 'react';

interface SelectionContextType {
    selectedIds: Set<string>;
    lastClickedId: string | null;
    isMultiSelectMode: boolean;
    toggleSelected: (id: string) => void;
    selectRange: (id: string, siblingIds: string[]) => void;
    selectAll: (ids: string[]) => void;
    clearSelection: () => void;
    setLastClickedId: (id: string | null) => void;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export const SelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [lastClickedId, setLastClickedId] = useState<string | null>(null);

    const isMultiSelectMode = selectedIds.size > 0;

    const toggleSelected = useCallback((id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
        setLastClickedId(id);
    }, []);

    /**
     * Selects all items between `lastClickedId` and `id` in the ordered `siblingIds` list.
     * If there is no anchor, it just selects the clicked item.
     */
    const selectRange = useCallback((id: string, siblingIds: string[]) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            // Use functional form to capture latest lastClickedId at call time
            const anchorId = lastClickedId;
            if (!anchorId || !siblingIds.includes(anchorId) || !siblingIds.includes(id)) {
                next.add(id);
            } else {
                const anchorIndex = siblingIds.indexOf(anchorId);
                const targetIndex = siblingIds.indexOf(id);
                const [start, end] = anchorIndex < targetIndex
                    ? [anchorIndex, targetIndex]
                    : [targetIndex, anchorIndex];
                for (let i = start; i <= end; i++) {
                    next.add(siblingIds[i]);
                }
            }
            return next;
        });
        setLastClickedId(id);
    }, [lastClickedId]);

    const selectAll = useCallback((ids: string[]) => {
        setSelectedIds(new Set(ids));
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
        setLastClickedId(null);
    }, []);

    return (
        <SelectionContext.Provider
            value={{
                selectedIds,
                lastClickedId,
                isMultiSelectMode,
                toggleSelected,
                selectRange,
                selectAll,
                clearSelection,
                setLastClickedId,
            }}
        >
            {children}
        </SelectionContext.Provider>
    );
};

export const useSelection = () => {
    const context = useContext(SelectionContext);
    if (!context) {
        throw new Error('useSelection must be used within a SelectionProvider');
    }
    return context;
};
