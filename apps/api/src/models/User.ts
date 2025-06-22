import mongoose, { Document, Schema } from 'mongoose';
import {UserRole} from "@repo/lib";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.USER
        },
    },
    { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);