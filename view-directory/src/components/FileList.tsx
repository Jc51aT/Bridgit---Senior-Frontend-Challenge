import React from 'react';
import { useFileSystem } from '../context/FileSystemContext';
import { FileSystemItem } from './FileSystemItem';

export const FileList: React.FC<{ nodeIds: string[] }> = ({ nodeIds }) => {
    return (
        <div className="file-list" style={{ display: 'flex', flexDirection: 'column' }}>
            {nodeIds.map((id) => (
                <FileSystemItem key={id} nodeId={id} />
            ))}
        </div>
    );
};
