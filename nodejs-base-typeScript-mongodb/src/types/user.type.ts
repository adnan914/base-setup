import { Types, Document } from "mongoose";
import { Role, Status } from "@/enums";

export interface CreateUserInput {
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
}

export interface UserDocument extends Document {
    _id: Types.ObjectId;
    email: string;
    firstName: string;
    lastName: string;
    password?: string;
    profileImg?: string;
    role: Role;
    status: Status;
    createdAt?: Date;
    updatedAt?: Date;
    accessToken?: string;
    refreshToken?: string;
}

export interface UpdateUserInput {
    firstName: string;
    lastName: string;
    role: Role;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface UserListInput {
    limit?: number;
    lastSeenId?: string;
}
