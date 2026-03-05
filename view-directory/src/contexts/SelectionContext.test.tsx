import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SelectionProvider, useSelection } from './SelectionContext';

describe('SelectionContext', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SelectionProvider>{children}</SelectionProvider>
    );

    it('initializes with empty selection', () => {
        const { result } = renderHook(() => useSelection(), { wrapper });
        expect(result.current.selectedIds.size).toBe(0);
        expect(result.current.isMultiSelectMode).toBe(false);
        expect(result.current.lastClickedId).toBeNull();
    });

    it('toggleSelected adds an id and enables multi-select mode', () => {
        const { result } = renderHook(() => useSelection(), { wrapper });
        act(() => result.current.toggleSelected('file-1'));
        expect(result.current.selectedIds.has('file-1')).toBe(true);
        expect(result.current.isMultiSelectMode).toBe(true);
        expect(result.current.lastClickedId).toBe('file-1');
    });

    it('toggleSelected removes an existing id', () => {
        const { result } = renderHook(() => useSelection(), { wrapper });
        act(() => result.current.toggleSelected('file-1'));
        act(() => result.current.toggleSelected('file-1'));
        expect(result.current.selectedIds.has('file-1')).toBe(false);
    });

    it('selectRange selects items between anchor and target', () => {
        const { result } = renderHook(() => useSelection(), { wrapper });
        const siblings = ['a', 'b', 'c', 'd', 'e'];

        // First click sets anchor
        act(() => result.current.toggleSelected('b'));
        // Range select from b to d
        act(() => result.current.selectRange('d', siblings));
        expect(result.current.selectedIds.has('b')).toBe(true);
        expect(result.current.selectedIds.has('c')).toBe(true);
        expect(result.current.selectedIds.has('d')).toBe(true);
        expect(result.current.selectedIds.has('a')).toBe(false);
        expect(result.current.selectedIds.has('e')).toBe(false);
    });

    it('selectRange with no anchor just selects the clicked id', () => {
        const { result } = renderHook(() => useSelection(), { wrapper });
        const siblings = ['a', 'b', 'c'];
        act(() => result.current.selectRange('b', siblings));
        expect(result.current.selectedIds.has('b')).toBe(true);
    });

    it('selectAll selects all given ids', () => {
        const { result } = renderHook(() => useSelection(), { wrapper });
        act(() => result.current.selectAll(['a', 'b', 'c']));
        expect(result.current.selectedIds.size).toBe(3);
    });

    it('clearSelection resets everything', () => {
        const { result } = renderHook(() => useSelection(), { wrapper });
        act(() => result.current.toggleSelected('file-1'));
        act(() => result.current.clearSelection());
        expect(result.current.selectedIds.size).toBe(0);
        expect(result.current.lastClickedId).toBeNull();
        expect(result.current.isMultiSelectMode).toBe(false);
    });

    it('throws when used outside provider', () => {
        expect(() => {
            renderHook(() => useSelection());
        }).toThrow('useSelection must be used within a SelectionProvider');
    });
});
