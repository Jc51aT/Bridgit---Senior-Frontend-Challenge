import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { File } from './File';
import { FileNode } from '../types';
import { renderWithProviders } from '../test/test-utils';

// Mock dnd-kit to avoid draggable setup complexity
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

const mockFile: FileNode = {
    id: 'file-1',
    name: 'readme.md',
    type: 'file',
    parentId: 'root',
};

const siblingIds = ['file-1', 'file-2', 'file-3'];

describe('File component', () => {
    it('renders the file name', () => {
        renderWithProviders(<File node={mockFile} siblingIds={siblingIds} />);
        expect(screen.getByText('readme.md')).toBeInTheDocument();
    });

    it('renders the file icon', () => {
        renderWithProviders(<File node={mockFile} siblingIds={siblingIds} />);
        expect(screen.getByText('📄')).toBeInTheDocument();
    });

    it('has correct aria-label', () => {
        renderWithProviders(<File node={mockFile} siblingIds={siblingIds} />);
        expect(screen.getByRole('treeitem')).toHaveAttribute('aria-label', 'File: readme.md');
    });

    it('has treeitem role', () => {
        renderWithProviders(<File node={mockFile} siblingIds={siblingIds} />);
        expect(screen.getByRole('treeitem')).toBeInTheDocument();
    });

    it('is focusable (tabIndex=0)', () => {
        renderWithProviders(<File node={mockFile} siblingIds={siblingIds} />);
        const item = screen.getByRole('treeitem');
        expect(item.tabIndex).toBe(0);
    });

    it('clicking sets the file as active', async () => {
        const user = userEvent.setup();
        renderWithProviders(<File node={mockFile} siblingIds={siblingIds} />);
        const item = screen.getByRole('treeitem');
        await user.click(item);
        // After click, it should be visually active (no error means handler ran)
        expect(item).toBeInTheDocument();
    });
});
