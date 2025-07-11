import { Types, Document } from "mongoose";

export interface CreateUserInput {
    username: string;
    email: string;
    password: string;
    phone?: number;
}

export interface UserDocument extends Document {
    _id: Types.ObjectId;
    email: string;
    username: string;
    password?: string;
    phone?: number;
    profileImg?: string;
    createdAt?: Date;
    updatedAt?: Date;
    accessToken?: string;
    refreshToken?: string;
}

export interface UpdateUserInput {
    username: string;
    phone?: string;
}

export interface LoginInput {
    email: string;
    password: string;
    test: string;
}

export interface UserListInput {
    limit?: number;
    lastSeenId?: string;
}
