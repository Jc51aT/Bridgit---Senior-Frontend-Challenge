import './App.css';
import { FileList } from './components/FileList';
import { Breadcrumbs } from './components/Breadcrumbs';
import { SearchBar } from './components/SearchBar';
import { SortControls } from './components/SortControls';
import { ActiveNodeProvider } from './contexts/ActiveNodeContext';
import { ExpandedProvider } from './contexts/ExpandedContext';
import { SearchProvider } from './contexts/SearchContext';
import { SortProvider } from './contexts/SortContext';
import { DndContext, DragEndEvent, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RawFileNode } from './types';
import { useTranslation } from './contexts/I18nContext';

function App() {
  const queryClient = useQueryClient();
  const { t, language, setLanguage } = useTranslation();

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
      // Optimistic Update
      await queryClient.cancelQueries({ queryKey: ['directory', oldParentId] });
      await queryClient.cancelQueries({ queryKey: ['directory', parentId] });

      const prevOld = queryClient.getQueryData<RawFileNode[]>(['directory', oldParentId]);
      const prevNew = queryClient.getQueryData<RawFileNode[]>(['directory', parentId]);
      let movedNode: RawFileNode | undefined;

      // Remove from old parent
      if (prevOld) {
        movedNode = prevOld.find(n => n.id === id);
        queryClient.setQueryData<RawFileNode[]>(['directory', oldParentId], prevOld.filter(n => n.id !== id));
      }

      // Add to new parent
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

    // Ensure we are dropping into a directory that is not ourselves
    if (active.id === over.id) return;

    const oldParentId = active.data.current?.parentId;
    const newParentId = over.id as string;

    if (oldParentId && oldParentId !== newParentId) {
      moveNodeMutation.mutate({ id: active.id as string, parentId: newParentId, oldParentId });
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  return (
    <ExpandedProvider>
      <ActiveNodeProvider>
        <SearchProvider>
          <SortProvider>
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
            </DndContext>
          </SortProvider>
        </SearchProvider>
      </ActiveNodeProvider>
    </ExpandedProvider>
  )
}

export default App

