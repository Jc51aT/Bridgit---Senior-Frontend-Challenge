import React, { useCallback } from 'react';
import { useSelection } from '../contexts/SelectionContext';
import { useQueryClient } from '@tanstack/react-query';
import { RawFileNode } from '../types';
import { useTranslation } from '../contexts/I18nContext';

interface SelectionToolbarProps {
    allRootIds: string[];
}

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({ allRootIds }) => {
    const { selectedIds, clearSelection, selectAll } = useSelection();
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    const count = selectedIds.size;

    const handleBatchDelete = useCallback(async () => {
        const idsToDelete = Array.from(selectedIds);
        clearSelection();

        // Optimistic update: remove from all cached directories
        queryClient.setQueriesData<RawFileNode[]>({ queryKey: ['directory'] }, (old) => {
            if (!old) return old;
            return old.filter(n => !idsToDelete.includes(n.id));
        });

        // Fire all deletes in parallel
        await Promise.allSettled(
            idsToDelete.map(id =>
                fetch(`http://localhost:3001/files/${id}`, { method: 'DELETE' })
            )
        );

        // Invalidate all directory queries to stay in sync
        queryClient.invalidateQueries({ queryKey: ['directory'] });
    }, [selectedIds, clearSelection, queryClient]);

    const handleSelectAll = useCallback(() => {
        selectAll(allRootIds);
    }, [selectAll, allRootIds]);

    if (count === 0) return null;

    return (
        <div className="selection-toolbar" role="toolbar" aria-label="Batch actions">
            <div className="selection-toolbar-inner">
                <div className="selection-toolbar-left">
                    <span className="selection-count-badge">{count}</span>
                    <span className="selection-count-label">
                        {count === 1 ? t('itemSelected') : t('itemsSelected')}
                    </span>
                </div>
                <div className="selection-toolbar-actions">
                    <button
                        className="toolbar-btn toolbar-btn--ghost"
                        onClick={handleSelectAll}
                        title={t('selectAll')}
                    >
                        ☑ {t('selectAll')}
                    </button>
                    <button
                        className="toolbar-btn toolbar-btn--danger"
                        onClick={handleBatchDelete}
                        title={t('deleteSelected')}
                        aria-label={`${t('deleteSelected')} ${count} items`}
                    >
                        🗑 {t('deleteSelected')}
                    </button>
                    <button
                        className="toolbar-btn toolbar-btn--icon"
                        onClick={clearSelection}
                        title={t('clearSelection')}
                        aria-label={t('clearSelection')}
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
};
