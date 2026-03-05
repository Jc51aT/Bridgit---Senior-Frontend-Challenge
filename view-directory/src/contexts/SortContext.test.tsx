import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SortProvider, useSortContext } from './SortContext';

describe('SortContext', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SortProvider>{children}</SortProvider>
    );

    it('initializes with name/asc defaults', () => {
        const { result } = renderHook(() => useSortContext(), { wrapper });
        expect(result.current.sortField).toBe('name');
        expect(result.current.sortDirection).toBe('asc');
    });

    it('setSortField updates the field', () => {
        const { result } = renderHook(() => useSortContext(), { wrapper });
        act(() => result.current.setSortField('type'));
        expect(result.current.sortField).toBe('type');
    });

    it('setSortDirection updates the direction', () => {
        const { result } = renderHook(() => useSortContext(), { wrapper });
        act(() => result.current.setSortDirection('desc'));
        expect(result.current.sortDirection).toBe('desc');
    });

    it('throws when used outside provider', () => {
        expect(() => {
            renderHook(() => useSortContext());
        }).toThrow('useSortContext must be used within a SortProvider');
    });
});
