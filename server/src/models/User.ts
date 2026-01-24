import mongoose from 'mongoose';
import { User } from '@bookmark/shared';

const userSchema = new mongoose.Schema<User>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export const UserModel = mongoose.model<User>('User', userSchema);
