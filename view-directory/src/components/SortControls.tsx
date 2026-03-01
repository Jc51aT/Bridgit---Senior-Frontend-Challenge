import React from 'react';
import { useSortContext, SortField } from '../contexts/SortContext';
import { useTranslation } from '../contexts/I18nContext';

export const SortControls: React.FC = () => {
    const { sortField, sortDirection, setSortField, setSortDirection } = useSortContext();
    const { t } = useTranslation();

    const toggleDirection = () => {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    };

    return (
        <div className="sort-controls" role="toolbar" aria-label={t('sortBy')}>
            <label className="sort-label" htmlFor="sort-field-select">
                {t('sortBy')}
            </label>
            <select
                id="sort-field-select"
                className="sort-select"
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
            >
                <option value="name">{t('sortName')}</option>
                <option value="type">{t('sortType')}</option>
            </select>
            <button
                className="sort-direction-btn"
                onClick={toggleDirection}
                aria-label={sortDirection === 'asc' ? t('sortAsc') : t('sortDesc')}
                title={sortDirection === 'asc' ? t('sortAsc') : t('sortDesc')}
            >
                {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
        </div>
    );
};
