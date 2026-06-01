import { Observable } from 'rxjs';

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface RefreshRequest {
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface ValidateTokenRequest {
  accessToken: string;
}

export interface UserIdentity {
  id: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserIdentity;
}

export interface ValidateTokenResponse {
  valid: boolean;
  user: UserIdentity;
}

export interface AuthGrpcClient {
  register(payload: RegisterRequest): Observable<AuthResponse>;
  login(payload: LoginRequest): Observable<AuthResponse>;
  refresh(payload: RefreshRequest): Observable<AuthResponse>;
  validateToken(payload: ValidateTokenRequest): Observable<ValidateTokenResponse>;
}
