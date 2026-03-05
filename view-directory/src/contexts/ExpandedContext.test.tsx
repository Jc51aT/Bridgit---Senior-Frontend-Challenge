import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ExpandedProvider, useExpanded } from './ExpandedContext';

describe('ExpandedContext', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ExpandedProvider>{children}</ExpandedProvider>
    );

    it('initializes with an empty set', () => {
        const { result } = renderHook(() => useExpanded(), { wrapper });
        expect(result.current.expandedIds.size).toBe(0);
    });

    it('toggleExpanded adds an id', () => {
        const { result } = renderHook(() => useExpanded(), { wrapper });
        act(() => result.current.toggleExpanded('dir-1'));
        expect(result.current.expandedIds.has('dir-1')).toBe(true);
    });

    it('toggleExpanded removes an existing id', () => {
        const { result } = renderHook(() => useExpanded(), { wrapper });
        act(() => result.current.toggleExpanded('dir-1'));
        act(() => result.current.toggleExpanded('dir-1'));
        expect(result.current.expandedIds.has('dir-1')).toBe(false);
    });

    it('toggleExpanded with forceStatus=true always adds', () => {
        const { result } = renderHook(() => useExpanded(), { wrapper });
        act(() => result.current.toggleExpanded('dir-1', true));
        expect(result.current.expandedIds.has('dir-1')).toBe(true);
        // Calling again with true should still have it
        act(() => result.current.toggleExpanded('dir-1', true));
        expect(result.current.expandedIds.has('dir-1')).toBe(true);
    });

    it('toggleExpanded with forceStatus=false always removes', () => {
        const { result } = renderHook(() => useExpanded(), { wrapper });
        act(() => result.current.toggleExpanded('dir-1', true));
        act(() => result.current.toggleExpanded('dir-1', false));
        expect(result.current.expandedIds.has('dir-1')).toBe(false);
    });

    it('expandMultiple adds multiple ids at once', () => {
        const { result } = renderHook(() => useExpanded(), { wrapper });
        act(() => result.current.expandMultiple(['dir-1', 'dir-2', 'dir-3']));
        expect(result.current.expandedIds.size).toBe(3);
        expect(result.current.expandedIds.has('dir-1')).toBe(true);
        expect(result.current.expandedIds.has('dir-2')).toBe(true);
        expect(result.current.expandedIds.has('dir-3')).toBe(true);
    });

    it('expandMultiple does not remove existing ids', () => {
        const { result } = renderHook(() => useExpanded(), { wrapper });
        act(() => result.current.toggleExpanded('dir-0'));
        act(() => result.current.expandMultiple(['dir-1']));
        expect(result.current.expandedIds.has('dir-0')).toBe(true);
        expect(result.current.expandedIds.has('dir-1')).toBe(true);
    });

    it('throws when used outside provider', () => {
        expect(() => {
            renderHook(() => useExpanded());
        }).toThrow('useExpanded must be used within an ExpandedProvider');
    });
});
