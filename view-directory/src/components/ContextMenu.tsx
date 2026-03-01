import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useContextMenu } from '../contexts/ContextMenuContext';
import { useTranslation } from '../contexts/I18nContext';
import { useSelection } from '../contexts/SelectionContext';
import { useQueryClient } from '@tanstack/react-query';
import { RawFileNode } from '../types';

export const ContextMenu: React.FC = () => {
    const { menuState, closeMenu } = useContextMenu();
    const { t } = useTranslation();
    const { toggleSelected, selectedIds } = useSelection();
    const queryClient = useQueryClient();
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on Escape or outside click
    useEffect(() => {
        if (!menuState) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeMenu();
        };

        const handleMouseDown = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                closeMenu();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleMouseDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleMouseDown);
        };
    }, [menuState, closeMenu]);

    if (!menuState) return null;

    const { node, position } = menuState;

    const getParentCacheKey = () => node.parentId ?? 'root';

    // ── Actions ──────────────────────────────────────────────────────────────

    const handleRename = () => {
        closeMenu();
        const newName = window.prompt(t('contextMenuRenameLabel'), node.name);
        if (!newName || newName.trim() === '' || newName === node.name) return;

        const trimmed = newName.trim();
        const cacheKey = getParentCacheKey();

        queryClient.setQueryData<RawFileNode[]>(['directory', cacheKey], (old = []) =>
            old.map(n => (n.id === node.id ? { ...n, name: trimmed } : n))
        );

        fetch(`http://localhost:3001/files/${node.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: trimmed }),
        })
            .then(res => { if (!res.ok) throw new Error('Failed'); })
            .catch(() => {
                queryClient.setQueryData<RawFileNode[]>(['directory', cacheKey], (old = []) =>
                    old.map(n => (n.id === node.id ? { ...n, name: node.name } : n))
                );
            })
            .finally(() => {
                queryClient.invalidateQueries({ queryKey: ['directory', cacheKey] });
            });
    };

    const handleDelete = () => {
        closeMenu();
        const cacheKey = getParentCacheKey();

        const prev = queryClient.getQueryData<RawFileNode[]>(['directory', cacheKey]);
        queryClient.setQueryData<RawFileNode[]>(['directory', cacheKey], (old = []) =>
            old.filter(n => n.id !== node.id)
        );

        fetch(`http://localhost:3001/files/${node.id}`, { method: 'DELETE' })
            .then(res => { if (!res.ok) throw new Error('Failed'); })
            .catch(() => {
                if (prev) queryClient.setQueryData(['directory', cacheKey], prev);
            })
            .finally(() => {
                queryClient.invalidateQueries({ queryKey: ['directory', cacheKey] });
            });
    };

    const handleNewFile = () => {
        closeMenu();
        const name = window.prompt(t('contextMenuNewFilePrompt'));
        if (!name || name.trim() === '') return;

        const trimmed = name.trim();
        const targetDir = node.id;

        const tempNode: RawFileNode = {
            id: `temp-${Date.now()}`,
            name: trimmed,
            type: 'file',
            parentId: targetDir,
        };

        queryClient.setQueryData<RawFileNode[]>(['directory', targetDir], (old = []) => [
            ...old,
            tempNode,
        ]);

        fetch('http://localhost:3001/files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: trimmed, type: 'file', parentId: targetDir }),
        })
            .then(res => { if (!res.ok) throw new Error('Failed'); })
            .catch(() => {
                queryClient.setQueryData<RawFileNode[]>(['directory', targetDir], (old = []) =>
                    old.filter(n => n.id !== tempNode.id)
                );
            })
            .finally(() => {
                queryClient.invalidateQueries({ queryKey: ['directory', targetDir] });
            });
    };

    const handleToggleSelection = () => {
        closeMenu();
        toggleSelected(node.id);
    };

    // ── Render ───────────────────────────────────────────────────────────────

    const isDir = node.type === 'directory';
    const isNodeSelected = selectedIds.has(node.id);

    const menu = (
        <div
            ref={menuRef}
            className="context-menu"
            role="menu"
            aria-label="Context menu"
            style={{ top: position.y, left: position.x }}
            onContextMenu={e => e.preventDefault()}
        >
            <button
                className="context-menu-item"
                role="menuitem"
                onClick={handleToggleSelection}
            >
                {isNodeSelected ? '☑' : '☐'} {isNodeSelected ? t('contextMenuDeselect') : t('contextMenuSelect')}
            </button>

            <hr className="context-menu-divider" />

            <button
                className="context-menu-item"
                role="menuitem"
                onClick={handleRename}
            >
                ✏️ {t('contextMenuRename')}
            </button>

            {isDir && (
                <button
                    className="context-menu-item"
                    role="menuitem"
                    onClick={handleNewFile}
                >
                    📄 {t('contextMenuNewFile')}
                </button>
            )}

            <hr className="context-menu-divider" />

            <button
                className="context-menu-item context-menu-item--danger"
                role="menuitem"
                onClick={handleDelete}
            >
                🗑️ {t('contextMenuDelete')}
            </button>
        </div>
    );

    return ReactDOM.createPortal(menu, document.body);
};
