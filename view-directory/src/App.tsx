import './App.css';
import { FileList } from './components/FileList';
import { Breadcrumbs } from './components/Breadcrumbs';
import { SearchBar } from './components/SearchBar';
import { SortControls } from './components/SortControls';
import { SelectionToolbar } from './components/SelectionToolbar';
import { ActiveNodeProvider } from './contexts/ActiveNodeContext';
import { ExpandedProvider } from './contexts/ExpandedContext';
import { SearchProvider } from './contexts/SearchContext';
import { SortProvider } from './contexts/SortContext';
import { ContextMenuProvider } from './contexts/ContextMenuContext';
import { SelectionProvider } from './contexts/SelectionContext';
import { ContextMenu } from './components/ContextMenu';
import { DndContext, DragEndEvent, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RawFileNode } from './types';
import { useTranslation } from './contexts/I18nContext';
import { useSelection } from './contexts/SelectionContext';
import { useDirectory } from './hooks/useDirectory';

// Inner component that has access to SelectionProvider context
function AppInner() {
  const queryClient = useQueryClient();
  const { t, language, setLanguage } = useTranslation();
  const { selectedIds } = useSelection();

  // Fetch root nodes so SelectionToolbar can offer "Select All" at root level
  const { data: rootNodes } = useDirectory('root');
  const allRootIds = rootNodes ? rootNodes.map(n => n.id) : [];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const moveNodeMutation = useMutation({
    mutationFn: async ({ id, parentId }: { id: string; parentId: string; oldParentId: string }) => {
      const res = await fetch(`http://localhost:3001/files/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId })
      });
      if (!res.ok) throw new Error('Failed to move file');
      return res.json();
    },
    onMutate: async ({ id, parentId, oldParentId }: { id: string; parentId: string; oldParentId: string }) => {
      await queryClient.cancelQueries({ queryKey: ['directory', oldParentId] });
      await queryClient.cancelQueries({ queryKey: ['directory', parentId] });

      const prevOld = queryClient.getQueryData<RawFileNode[]>(['directory', oldParentId]);
      const prevNew = queryClient.getQueryData<RawFileNode[]>(['directory', parentId]);
      let movedNode: RawFileNode | undefined;

      if (prevOld) {
        movedNode = prevOld.find(n => n.id === id);
        queryClient.setQueryData<RawFileNode[]>(['directory', oldParentId], prevOld.filter(n => n.id !== id));
      }

      if (prevNew && movedNode) {
        queryClient.setQueryData<RawFileNode[]>(['directory', parentId], [...prevNew, { ...movedNode, parentId }]);
      }

      return { prevOld, prevNew, oldParentId, parentId };
    },
    onError: (_err, _vars, context) => {
      if (context?.prevOld) queryClient.setQueryData(['directory', context.oldParentId], context.prevOld);
      if (context?.prevNew) queryClient.setQueryData(['directory', context.parentId], context.prevNew);
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['directory', variables.oldParentId] });
      queryClient.invalidateQueries({ queryKey: ['directory', variables.parentId] });
    }
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const oldParentId = active.data.current?.parentId;
    const newParentId = over.id as string;

    if (!oldParentId || oldParentId === newParentId) return;

    // Batch move: if the dragged item is among the selected set, move all selected items
    const idsToMove = selectedIds.has(active.id as string) && selectedIds.size > 1
      ? Array.from(selectedIds)
      : [active.id as string];

    for (const id of idsToMove) {
      // Determine each item's current parent from cache
      const itemOldParentId = id === active.id
        ? oldParentId
        : (() => {
          // Look through cached queries for this node
          const queries = queryClient.getQueriesData<RawFileNode[]>({ queryKey: ['directory'] });
          for (const [, data] of queries) {
            if (data?.some(n => n.id === id)) {
              const node = data.find(n => n.id === id);
              return node?.parentId ?? 'root';
            }
          }
          return oldParentId;
        })();

      if (itemOldParentId !== newParentId) {
        moveNodeMutation.mutate({ id, parentId: newParentId, oldParentId: itemOldParentId });
      }
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  return (
    <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
      <div className="app-container">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{t('appTitle')}</h2>
          <button
            onClick={toggleLanguage}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontWeight: '600'
            }}
            aria-label="Toggle language"
          >
            {language === 'en' ? 'FR' : 'EN'}
          </button>
        </header>
        <SearchBar />
        <SortControls />
        <Breadcrumbs />
        <main aria-label={t('appTitle')}>
          <div className="explorer-root" style={{ textAlign: 'left', minWidth: '300px' }}>
            <FileList parentId="root" />
          </div>
        </main>
      </div>
      <ContextMenu />
      <SelectionToolbar allRootIds={allRootIds} />
    </DndContext>
  );
}

function App() {
  return (
    <ExpandedProvider>
      <ActiveNodeProvider>
        <SearchProvider>
          <SortProvider>
            <ContextMenuProvider>
              <SelectionProvider>
                <AppInner />
              </SelectionProvider>
            </ContextMenuProvider>
          </SortProvider>
        </SearchProvider>
      </ActiveNodeProvider>
    </ExpandedProvider>
  );
}

export default App;
