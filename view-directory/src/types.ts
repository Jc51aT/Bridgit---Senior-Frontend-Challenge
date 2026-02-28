export type FileType = 'file' | 'directory';

export interface RawFileNode {
    id: string;
    name: string;
    type: FileType;
    content?: string; // Only present if type === 'file'
    parentId: string | null;
}

export type FetchFilesResponse = RawFileNode[];
