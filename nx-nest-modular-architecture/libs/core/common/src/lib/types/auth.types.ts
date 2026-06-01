export interface JwtUserPayload {
  id: string;
  email: string;
  role: string | null;
}

export interface AuthenticatedRequestUser extends JwtUserPayload {}

export interface RequestWithUser {
  user?: AuthenticatedRequestUser;
}
