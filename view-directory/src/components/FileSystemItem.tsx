import React from 'react';
import { useFileSystem } from '../context/FileSystemContext';
import { File } from './File';
import { Directory } from './Directory';

export const FileSystemItem: React.FC<{ nodeId: string }> = ({ nodeId }) => {
    const { state } = useFileSystem();
    const node = state.nodes[nodeId];

    if (!node) {
        return null; // Or a loading skeleton
    }

    if (node.type === 'directory') {
        return <Directory node={node} />;
    }

    return <File node={node} />;
};
