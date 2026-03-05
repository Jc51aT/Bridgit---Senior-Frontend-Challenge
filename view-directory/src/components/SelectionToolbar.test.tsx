import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectionToolbar } from './SelectionToolbar';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nProvider } from '../contexts/I18nContext';
import { SelectionProvider, useSelection } from '../contexts/SelectionContext';

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });

    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <I18nProvider>
                <SelectionProvider>
                    {children}
                </SelectionProvider>
            </I18nProvider>
        </QueryClientProvider>
    );
}

// Helper component that pre-selects items so the toolbar becomes visible
function ToolbarWithSelection({ selectedItems, allRootIds }: { selectedItems: string[]; allRootIds: string[] }) {
    const { toggleSelected } = useSelection();

    React.useEffect(() => {
        selectedItems.forEach(id => toggleSelected(id));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return <SelectionToolbar allRootIds={allRootIds} />;
}

describe('SelectionToolbar', () => {
    it('is hidden when no items are selected', () => {
        const Wrapper = createWrapper();
        const { container } = render(
            <Wrapper>
                <SelectionToolbar allRootIds={['a', 'b']} />
            </Wrapper>
        );
        expect(container.querySelector('.selection-toolbar')).toBeNull();
    });

    it('shows count when items are selected', () => {
        const Wrapper = createWrapper();
        render(
            <Wrapper>
                <ToolbarWithSelection selectedItems={['a', 'b']} allRootIds={['a', 'b', 'c']} />
            </Wrapper>
        );
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('items selected')).toBeInTheDocument();
    });

    it('shows singular label for 1 item', () => {
        const Wrapper = createWrapper();
        render(
            <Wrapper>
                <ToolbarWithSelection selectedItems={['a']} allRootIds={['a', 'b']} />
            </Wrapper>
        );
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('item selected')).toBeInTheDocument();
    });

    it('has toolbar role', () => {
        const Wrapper = createWrapper();
        render(
            <Wrapper>
                <ToolbarWithSelection selectedItems={['a']} allRootIds={['a']} />
            </Wrapper>
        );
        expect(screen.getByRole('toolbar')).toBeInTheDocument();
    });

    it('clicking Clear Selection button hides the toolbar', async () => {
        const user = userEvent.setup();
        const Wrapper = createWrapper();
        const { container } = render(
            <Wrapper>
                <ToolbarWithSelection selectedItems={['a']} allRootIds={['a']} />
            </Wrapper>
        );
        const clearBtn = screen.getByLabelText('Clear Selection');
        await user.click(clearBtn);
        expect(container.querySelector('.selection-toolbar')).toBeNull();
    });

    it('renders Select All and Delete Selected buttons', () => {
        const Wrapper = createWrapper();
        render(
            <Wrapper>
                <ToolbarWithSelection selectedItems={['a']} allRootIds={['a', 'b']} />
            </Wrapper>
        );
        expect(screen.getByText(/Select All/)).toBeInTheDocument();
        expect(screen.getByText(/Delete Selected/)).toBeInTheDocument();
    });
});
