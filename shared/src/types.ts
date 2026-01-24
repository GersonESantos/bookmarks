export interface User {
    _id: string;
    email: string;
    password?: string;
    createdAt: Date;
}

export interface Tag {
    _id: string;
    ownerId: string;
    name: string;
}

export interface Bookmark {
    _id: string;
    ownerId: string;
    url: string;
    title?: string;
    description?: string;
    notes?: string;
    source?: string;
    tags: string[]; // Array of Tag IDs
    savedFrom: 'web' | 'extension';
    createdAt: Date;
    updatedAt: Date;
}

export interface ApiError {
    message: string;
    status: number;
}
