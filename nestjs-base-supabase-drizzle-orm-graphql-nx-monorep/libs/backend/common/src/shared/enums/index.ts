export enum TokenType {
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH',
  FORGOTPASSWORD = 'FORGOTPASSWORD',
}

export enum Role {
  ADMIN = 'Admin',
  USER = 'User',
}

export enum Status {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export enum SessionRevocationReason {
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password-change',
  REFRESH_TOKEN_REUSE = 'refresh-token-reuse',
}

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
}
