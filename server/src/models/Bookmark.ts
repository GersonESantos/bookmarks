import mongoose from 'mongoose';
import { Bookmark } from '@bookmark/shared';

const bookmarkSchema = new mongoose.Schema<Bookmark>({
    ownerId: { type: String, required: true, index: true },
    url: { type: String, required: true },
    title: { type: String },
    description: { type: String },
    notes: { type: String },
    source: { type: String },
    tags: [{ type: String }], // Store Tag IDs or Names? Prompt says "Tag: {id, ownerId, name}" and "BookmarkTag". 
    // Code Logic: Use Tag IDs (referencing Tag model) or embed names? 
    // Prompt lists BookmarkTag join table, so likely Normalized. 
    // In Mongo, referencing ObjectId is fine. I'll use ObjectId strings.
    savedFrom: { type: String, enum: ['web', 'extension'], default: 'web' },
}, { timestamps: true });

export const BookmarkModel = mongoose.model<Bookmark>('Bookmark', bookmarkSchema);
