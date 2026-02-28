import './App.css';
import { FileList } from './components/FileList';
import { Breadcrumbs } from './components/Breadcrumbs';
import { ActiveNodeProvider } from './contexts/ActiveNodeContext';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RawFileNode } from './types';

function App() {
  const queryClient = useQueryClient();

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

  return (
    <ActiveNodeProvider>
      <DndContext onDragEnd={handleDragEnd}>
        <div className="app-container">
          <h2>File Explorer</h2>
          <Breadcrumbs />
          <main aria-label="File Explorer">
            <div className="explorer-root" style={{ textAlign: 'left', minWidth: '300px' }}>
              <FileList parentId="root" />
            </div>
          </main>
        </div>
      </DndContext>
    </ActiveNodeProvider>
  )
}

export default App
