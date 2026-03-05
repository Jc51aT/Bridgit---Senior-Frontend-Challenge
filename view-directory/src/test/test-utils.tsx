import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nProvider } from '../contexts/I18nContext';
import { ActiveNodeProvider } from '../contexts/ActiveNodeContext';
import { ExpandedProvider } from '../contexts/ExpandedContext';
import { SearchProvider } from '../contexts/SearchContext';
import { SortProvider } from '../contexts/SortContext';
import { ContextMenuProvider } from '../contexts/ContextMenuContext';
import { SelectionProvider } from '../contexts/SelectionContext';

export function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: { retry: false, gcTime: 0 },
            mutations: { retry: false },
        },
    });
}

export function AllProviders({ children }: { children: React.ReactNode }) {
    const queryClient = createTestQueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            <I18nProvider>
                <ExpandedProvider>
                    <ActiveNodeProvider>
                        <SearchProvider>
                            <SortProvider>
                                <ContextMenuProvider>
                                    <SelectionProvider>
                                        {children}
                                    </SelectionProvider>
                                </ContextMenuProvider>
                            </SortProvider>
                        </SearchProvider>
                    </ActiveNodeProvider>
                </ExpandedProvider>
            </I18nProvider>
        </QueryClientProvider>
    );
}

export function renderWithProviders(
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) {
    return render(ui, { wrapper: AllProviders, ...options });
}
