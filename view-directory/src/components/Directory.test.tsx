import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Directory } from './Directory';
import { DirectoryNode } from '../types';
import { renderWithProviders } from '../test/test-utils';

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

// Mock useDirectory for nested FileList to avoid real fetches
vi.mock('../hooks/useDirectory', () => ({
    useDirectory: () => ({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
    }),
}));

const mockDir: DirectoryNode = {
    id: 'dir-1',
    name: 'Documents',
    type: 'directory',
    parentId: 'root',
};

const siblingIds = ['dir-1', 'file-1', 'dir-2'];

describe('Directory component', () => {
    it('renders the directory name', () => {
        renderWithProviders(<Directory node={mockDir} siblingIds={siblingIds} />);
        expect(screen.getByText('Documents')).toBeInTheDocument();
    });

    it('renders the closed folder icon initially', () => {
        renderWithProviders(<Directory node={mockDir} siblingIds={siblingIds} />);
        expect(screen.getByText('📁')).toBeInTheDocument();
    });

    it('has treeitem role with aria-expanded=false', () => {
        renderWithProviders(<Directory node={mockDir} siblingIds={siblingIds} />);
        const item = screen.getByRole('treeitem');
        expect(item).toHaveAttribute('aria-expanded', 'false');
    });

    it('has correct aria-label', () => {
        renderWithProviders(<Directory node={mockDir} siblingIds={siblingIds} />);
        expect(screen.getByRole('treeitem')).toHaveAttribute('aria-label', 'Folder: Documents');
    });

    it('clicking toggles expanded state and shows open icon', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Directory node={mockDir} siblingIds={siblingIds} />);
        const item = screen.getByRole('treeitem');
        await user.click(item);
        expect(item).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByText('📂')).toBeInTheDocument();
    });

    it('clicking again collapses the directory', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Directory node={mockDir} siblingIds={siblingIds} />);
        const item = screen.getByRole('treeitem');
        await user.click(item);
        await user.click(item);
        expect(item).toHaveAttribute('aria-expanded', 'false');
    });

    it('shows directory-contents when expanded', async () => {
        const user = userEvent.setup();
        const { container } = renderWithProviders(<Directory node={mockDir} siblingIds={siblingIds} />);
        const item = screen.getByRole('treeitem');
        await user.click(item);
        expect(container.querySelector('.directory-contents')).toBeInTheDocument();
    });

    it('is focusable (tabIndex=0)', () => {
        renderWithProviders(<Directory node={mockDir} siblingIds={siblingIds} />);
        const item = screen.getByRole('treeitem');
        expect(item.tabIndex).toBe(0);
    });
});
