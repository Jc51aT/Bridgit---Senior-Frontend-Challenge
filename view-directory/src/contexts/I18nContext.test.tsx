import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { I18nProvider, useTranslation } from './I18nContext';

describe('I18nContext', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <I18nProvider>{children}</I18nProvider>
    );

    it('defaults to English', () => {
        const { result } = renderHook(() => useTranslation(), { wrapper });
        expect(result.current.language).toBe('en');
    });

    it('t() returns English translations by default', () => {
        const { result } = renderHook(() => useTranslation(), { wrapper });
        expect(result.current.t('appTitle')).toBe('File Explorer');
        expect(result.current.t('loading')).toBe('Loading...');
        expect(result.current.t('emptyFolder')).toBe('(Empty folder)');
    });

    it('setLanguage switches to French', () => {
        const { result } = renderHook(() => useTranslation(), { wrapper });
        act(() => result.current.setLanguage('fr'));
        expect(result.current.language).toBe('fr');
        expect(result.current.t('appTitle')).toBe('Explorateur de fichiers');
        expect(result.current.t('loading')).toBe('Chargement...');
    });

    it('can switch back to English', () => {
        const { result } = renderHook(() => useTranslation(), { wrapper });
        act(() => result.current.setLanguage('fr'));
        act(() => result.current.setLanguage('en'));
        expect(result.current.language).toBe('en');
        expect(result.current.t('appTitle')).toBe('File Explorer');
    });

    it('all translation keys return non-empty strings', () => {
        const { result } = renderHook(() => useTranslation(), { wrapper });
        const keys = [
            'appTitle', 'root', 'selectFileOrFolder', 'loading', 'errorLoading',
            'emptyFolder', 'folderLabel', 'fileLabel', 'searchPlaceholder',
            'noResults', 'searchResultsCount', 'sortBy', 'sortName', 'sortType',
            'sortAsc', 'sortDesc', 'contextMenuRename', 'contextMenuDelete',
            'contextMenuNewFile', 'contextMenuRenameLabel', 'contextMenuNewFilePrompt',
            'contextMenuSelect', 'contextMenuDeselect', 'itemSelected', 'itemsSelected',
            'deleteSelected', 'selectAll', 'clearSelection',
        ] as const;

        for (const key of keys) {
            expect(result.current.t(key)).toBeTruthy();
        }
    });

    it('throws when used outside provider', () => {
        expect(() => {
            renderHook(() => useTranslation());
        }).toThrow('useTranslation must be used within an I18nProvider');
    });
});
