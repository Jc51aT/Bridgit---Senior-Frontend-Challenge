import React from 'react';
import { useDirectory } from '../hooks/useDirectory';
import { Directory } from './Directory';
import { File } from './File';

export const FileList: React.FC<{ parentId: string }> = ({ parentId }) => {
    const { data: nodes, isLoading, isError, error } = useDirectory(parentId);

    if (isLoading) {
        return (
            <div style={{ paddingLeft: '24px', color: '#888', fontStyle: 'italic', fontSize: '0.9em' }}>
                ⏳ Loading...
            </div>
        );
    }

    if (isError) {
        return (
            <div style={{ paddingLeft: '24px', color: 'red', fontSize: '0.9em' }}>
                ⚠️ Error loading folder: {(error as Error).message}
            </div>
        );
    }

    if (!nodes || nodes.length === 0) {
        return (
            <div style={{ paddingLeft: '24px', color: '#888', fontStyle: 'italic', fontSize: '0.9em' }}>
                (Empty folder)
            </div>
        );
    }

    return (
        <div className="file-list" role={parentId === 'root' ? 'tree' : 'group'} style={{ display: 'flex', flexDirection: 'column' }}>
            {nodes.map((node) => (
                node.type === 'directory'
                    ? <Directory key={node.id} node={node} />
                    : <File key={node.id} node={node} />
            ))}
        </div>
    );
};
