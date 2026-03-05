import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SearchProvider, useSearchContext } from './SearchContext';

describe('SearchContext', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SearchProvider>{children}</SearchProvider>
    );

    it('initializes with an empty search query', () => {
        const { result } = renderHook(() => useSearchContext(), { wrapper });
        expect(result.current.searchQuery).toBe('');
    });

    it('setSearchQuery updates the query', () => {
        const { result } = renderHook(() => useSearchContext(), { wrapper });
        act(() => result.current.setSearchQuery('hello'));
        expect(result.current.searchQuery).toBe('hello');
    });

    it('can clear the query', () => {
        const { result } = renderHook(() => useSearchContext(), { wrapper });
        act(() => result.current.setSearchQuery('test'));
        act(() => result.current.setSearchQuery(''));
        expect(result.current.searchQuery).toBe('');
    });

    it('throws when used outside provider', () => {
        expect(() => {
            renderHook(() => useSearchContext());
        }).toThrow('useSearchContext must be used within a SearchProvider');
    });
});
