import { Observable } from 'rxjs';

export interface CreateUserRequest {
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface GetUserRequest {
  id: string;
}

export interface GetUserByEmailRequest {
  email: string;
}

export interface ListUsersRequest {
  page: number;
  limit: number;
}

export interface UpdateUserRequest {
  id: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface DeleteUserRequest {
  id: string;
}

export interface DeleteUserResponse {
  deleted: boolean;
}

export interface UserResponse {
  id: string;
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicUserResponse extends Omit<UserResponse, 'passwordHash'> {}

export interface ListUsersResponse {
  data: UserResponse[];
  page: number;
  limit: number;
  total: number;
}

export interface UserGrpcClient {
  createUser(payload: CreateUserRequest): Observable<UserResponse>;
  getUser(payload: GetUserRequest): Observable<UserResponse>;
  getUserByEmail(payload: GetUserByEmailRequest): Observable<UserResponse>;
  listUsers(payload: ListUsersRequest): Observable<ListUsersResponse>;
  updateUser(payload: UpdateUserRequest): Observable<UserResponse>;
  deleteUser(payload: DeleteUserRequest): Observable<DeleteUserResponse>;
}
