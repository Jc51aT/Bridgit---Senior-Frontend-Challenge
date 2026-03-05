import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ContextMenuProvider, useContextMenu } from './ContextMenuContext';
import { RawFileNode } from '../types';

const mockFileNode: RawFileNode = {
    id: 'file-1',
    name: 'test.txt',
    type: 'file',
    parentId: 'root',
};

const mockDirNode: RawFileNode = {
    id: 'dir-1',
    name: 'docs',
    type: 'directory',
    parentId: 'root',
};

describe('ContextMenuContext', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ContextMenuProvider>{children}</ContextMenuProvider>
    );

    it('initializes with null menuState', () => {
        const { result } = renderHook(() => useContextMenu(), { wrapper });
        expect(result.current.menuState).toBeNull();
    });

    it('openMenu sets the node and position', () => {
        const { result } = renderHook(() => useContextMenu(), { wrapper });
        act(() => result.current.openMenu(mockFileNode, 100, 200));
        expect(result.current.menuState).toEqual({
            node: mockFileNode,
            position: { x: 100, y: 200 },
        });
    });

    it('closeMenu resets to null', () => {
        const { result } = renderHook(() => useContextMenu(), { wrapper });
        act(() => result.current.openMenu(mockDirNode, 50, 75));
        act(() => result.current.closeMenu());
        expect(result.current.menuState).toBeNull();
    });

    it('openMenu can update to a different node', () => {
        const { result } = renderHook(() => useContextMenu(), { wrapper });
        act(() => result.current.openMenu(mockFileNode, 10, 20));
        act(() => result.current.openMenu(mockDirNode, 30, 40));
        expect(result.current.menuState?.node.id).toBe('dir-1');
        expect(result.current.menuState?.position).toEqual({ x: 30, y: 40 });
    });

    it('throws when used outside provider', () => {
        expect(() => {
            renderHook(() => useContextMenu());
        }).toThrow('useContextMenu must be used within a ContextMenuProvider');
    });
});
