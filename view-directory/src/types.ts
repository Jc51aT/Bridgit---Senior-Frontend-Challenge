export type FileType = 'file' | 'directory';

export interface BaseNode {
    id: string;
    name: string;
    parentId: string | null;
}

export interface FileNode extends BaseNode {
    type: 'file';
    content?: string;
}

export interface DirectoryNode extends BaseNode {
    type: 'directory';
}

export type RawFileNode = FileNode | DirectoryNode;

export type FetchFilesResponse = RawFileNode[];
