import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ActiveNodeProvider, useActiveNode } from './ActiveNodeContext';

describe('ActiveNodeContext', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ActiveNodeProvider>{children}</ActiveNodeProvider>
    );

    it('initializes with null activeNodeId', () => {
        const { result } = renderHook(() => useActiveNode(), { wrapper });
        expect(result.current.activeNodeId).toBeNull();
    });

    it('updates activeNodeId via setActiveNodeId', () => {
        const { result } = renderHook(() => useActiveNode(), { wrapper });
        act(() => result.current.setActiveNodeId('node-1'));
        expect(result.current.activeNodeId).toBe('node-1');
    });

    it('can reset activeNodeId to null', () => {
        const { result } = renderHook(() => useActiveNode(), { wrapper });
        act(() => result.current.setActiveNodeId('node-1'));
        act(() => result.current.setActiveNodeId(null));
        expect(result.current.activeNodeId).toBeNull();
    });

    it('throws when used outside provider', () => {
        expect(() => {
            renderHook(() => useActiveNode());
        }).toThrow('useActiveNode must be used within an ActiveNodeProvider');
    });
});
