import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Breadcrumbs } from './Breadcrumbs';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nProvider } from '../contexts/I18nContext';
import { ActiveNodeProvider, useActiveNode } from '../contexts/ActiveNodeContext';
import { ExpandedProvider } from '../contexts/ExpandedContext';
import { RawFileNode } from '../types';

function createTestSetup(initialData?: { activeNodeId?: string; cachedNodes?: RawFileNode[] }) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });

    // Pre-populate cache if needed
    if (initialData?.cachedNodes) {
        // Group by parentId
        const groups = new Map<string, RawFileNode[]>();
        for (const node of initialData.cachedNodes) {
            const key = node.parentId ?? 'root';
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(node);
        }
        for (const [parentId, nodes] of groups) {
            queryClient.setQueryData(['directory', parentId], nodes);
        }
    }

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <I18nProvider>
                <ExpandedProvider>
                    <ActiveNodeProvider>
                        {children}
                    </ActiveNodeProvider>
                </ExpandedProvider>
            </I18nProvider>
        </QueryClientProvider>
    );

    return { Wrapper, queryClient };
}

// Helper component to set activeNodeId
function BreadcrumbsWithActiveNode({ nodeId }: { nodeId: string }) {
    const { setActiveNodeId } = useActiveNode();
    React.useEffect(() => {
        setActiveNodeId(nodeId);
    }, [nodeId, setActiveNodeId]);
    return <Breadcrumbs />;
}

describe('Breadcrumbs', () => {
    it('shows prompt text when no node is active', () => {
        const { Wrapper } = createTestSetup();
        render(
            <Wrapper>
                <Breadcrumbs />
            </Wrapper>
        );
        expect(screen.getByText('Select a file or folder')).toBeInTheDocument();
    });

    it('shows Root crumb when a node is active', () => {
        const cachedNodes: RawFileNode[] = [
            { id: 'file-1', name: 'readme.md', type: 'file', parentId: 'root' },
        ];
        const { Wrapper } = createTestSetup({ cachedNodes });
        render(
            <Wrapper>
                <BreadcrumbsWithActiveNode nodeId="file-1" />
            </Wrapper>
        );
        expect(screen.getByText('Root')).toBeInTheDocument();
        expect(screen.getByText('readme.md')).toBeInTheDocument();
    });

    it('shows full path for nested nodes', () => {
        const cachedNodes: RawFileNode[] = [
            { id: 'dir-1', name: 'Documents', type: 'directory', parentId: 'root' },
            { id: 'file-1', name: 'notes.txt', type: 'file', parentId: 'dir-1' },
        ];
        const { Wrapper } = createTestSetup({ cachedNodes });
        render(
            <Wrapper>
                <BreadcrumbsWithActiveNode nodeId="file-1" />
            </Wrapper>
        );
        expect(screen.getByText('Root')).toBeInTheDocument();
        expect(screen.getByText('Documents')).toBeInTheDocument();
        expect(screen.getByText('notes.txt')).toBeInTheDocument();
    });

    it('breadcrumb items have button role', () => {
        const cachedNodes: RawFileNode[] = [
            { id: 'file-1', name: 'readme.md', type: 'file', parentId: 'root' },
        ];
        const { Wrapper } = createTestSetup({ cachedNodes });
        render(
            <Wrapper>
                <BreadcrumbsWithActiveNode nodeId="file-1" />
            </Wrapper>
        );
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThanOrEqual(1);
    });

    it('clicking Root clears active node', async () => {
        const user = userEvent.setup();
        const cachedNodes: RawFileNode[] = [
            { id: 'file-1', name: 'readme.md', type: 'file', parentId: 'root' },
        ];
        const { Wrapper } = createTestSetup({ cachedNodes });
        render(
            <Wrapper>
                <BreadcrumbsWithActiveNode nodeId="file-1" />
            </Wrapper>
        );
        await user.click(screen.getByText('Root'));
        // After clicking root, should show the prompt text
        expect(screen.getByText('Select a file or folder')).toBeInTheDocument();
    });
});
