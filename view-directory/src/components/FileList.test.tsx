import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { FileList } from './FileList';
import { renderWithProviders } from '../test/test-utils';

// Mock useDirectory to control loading/error/data states
const mockUseDirectory = vi.fn();
vi.mock('../hooks/useDirectory', () => ({
    useDirectory: (...args: unknown[]) => mockUseDirectory(...args),
}));

// Mock dnd-kit
vi.mock('@dnd-kit/core', () => ({
    useDraggable: () => ({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        isDragging: false,
        transform: null,
    }),
    useDroppable: () => ({
        setNodeRef: vi.fn(),
        isOver: false,
    }),
}));

vi.mock('@dnd-kit/utilities', () => ({
    CSS: {
        Translate: { toString: () => undefined },
    },
}));

// Mock react-virtual to render items plainly for testing
vi.mock('@tanstack/react-virtual', () => ({
    useVirtualizer: ({ count }: { count: number }) => ({
        getVirtualItems: () =>
            Array.from({ length: count }, (_, i) => ({
                index: i,
                start: i * 32,
                size: 32,
                key: i,
            })),
        getTotalSize: () => count * 32,
        measureElement: vi.fn(),
    }),
}));

describe('FileList', () => {
    it('shows skeleton when loading', () => {
        mockUseDirectory.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            error: null,
        });
        const { container } = renderWithProviders(<FileList parentId="root" />);
        expect(container.querySelector('.skeleton-row')).toBeInTheDocument();
    });

    it('shows error message on error', () => {
        mockUseDirectory.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            error: new Error('Network fail'),
        });
        renderWithProviders(<FileList parentId="root" />);
        expect(screen.getByText(/Error loading folder/)).toBeInTheDocument();
        expect(screen.getByText(/Network fail/)).toBeInTheDocument();
    });

    it('shows empty folder message when no nodes', () => {
        mockUseDirectory.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: null,
        });
        renderWithProviders(<FileList parentId="root" />);
        expect(screen.getByText('(Empty folder)')).toBeInTheDocument();
    });

    it('renders files and directories', () => {
        mockUseDirectory.mockReturnValue({
            data: [
                { id: 'dir-1', name: 'Documents', type: 'directory', parentId: 'root' },
                { id: 'file-1', name: 'readme.md', type: 'file', parentId: 'root' },
            ],
            isLoading: false,
            isError: false,
            error: null,
        });
        renderWithProviders(<FileList parentId="root" />);
        expect(screen.getByText('Documents')).toBeInTheDocument();
        expect(screen.getByText('readme.md')).toBeInTheDocument();
    });

    it('sorts directories before files', () => {
        mockUseDirectory.mockReturnValue({
            data: [
                { id: 'file-1', name: 'alpha.txt', type: 'file', parentId: 'root' },
                { id: 'dir-1', name: 'beta', type: 'directory', parentId: 'root' },
            ],
            isLoading: false,
            isError: false,
            error: null,
        });
        renderWithProviders(<FileList parentId="root" />);
        const items = screen.getAllByRole('treeitem');
        // Directory should come first
        expect(items[0]).toHaveAttribute('aria-label', 'Folder: beta');
        expect(items[1]).toHaveAttribute('aria-label', 'File: alpha.txt');
    });

    it('renders tree role for root', () => {
        mockUseDirectory.mockReturnValue({
            data: [
                { id: 'file-1', name: 'test.txt', type: 'file', parentId: 'root' },
            ],
            isLoading: false,
            isError: false,
            error: null,
        });
        renderWithProviders(<FileList parentId="root" />);
        expect(screen.getByRole('tree')).toBeInTheDocument();
    });

    it('renders group role for non-root', () => {
        mockUseDirectory.mockReturnValue({
            data: [
                { id: 'file-1', name: 'test.txt', type: 'file', parentId: 'dir-1' },
            ],
            isLoading: false,
            isError: false,
            error: null,
        });
        renderWithProviders(<FileList parentId="dir-1" />);
        expect(screen.getByRole('group')).toBeInTheDocument();
    });
});
