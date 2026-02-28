// ---------------------------------------------------------
// 1. Raw API Response (Nested Structure)
// ---------------------------------------------------------
// This is the shape of the data returned by the backend.

export type FileType = 'file' | 'directory';

export interface RawFileNode {
    id: string;
    name: string;
    type: FileType;
    content?: string; // Only present if type === 'file'
    children?: RawFileNode[]; // Only present if type === 'directory'
}

// The API endpoint `GET /files` will return an array of these root nodes.
export type FetchFilesResponse = RawFileNode[];

// ---------------------------------------------------------
// 2. Normalized Frontend State (Flat Structure)
// ---------------------------------------------------------
// The frontend will convert the `RawFileNode[]` into this shape 
// immediately upon receiving the response for easier state management.

export interface NormalizedFileNode {
    id: string;
    name: string;
    type: FileType;
    content?: string;
    parentId: string | null; // null indicates it is at the root level
    childrenIds?: string[]; // Array of IDs instead of nested objects (only for directories)
}

// This is how the data will be stored in React state
export interface FileSystemState {
    // Dictionary for O(1) lookups and updates by ID
    nodes: Record<string, NormalizedFileNode>;

    // IDs of the top-level files/directories to start rendering from
    rootIds: string[];
}
