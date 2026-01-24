import mongoose from 'mongoose';
import { Tag } from '@bookmark/shared';

const tagSchema = new mongoose.Schema<Tag>({
    ownerId: { type: String, required: true },
    name: { type: String, required: true },
}, { timestamps: false });

// Compound index to ensure unique tag names per user
tagSchema.index({ ownerId: 1, name: 1 }, { unique: true });

export const TagModel = mongoose.model<Tag>('Tag', tagSchema);
