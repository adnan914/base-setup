export const RES_MESSAGES = {
  CREATED: 'Created successfully.',
  UPDATED: 'Updated successfully.',
  DELETED: 'Deleted successfully.',
  LOGIN_SUCCESS: 'Signed in successfully.',
  LOGOUT_SUCCESS: 'Signed out successfully.',
  REFRESH_SUCCESS: 'Session refreshed successfully.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  VALIDATION_ERROR: 'Invalid input. Please check the form and try again.',
  INVALID_REQUEST:
    'This request looks invalid. Please refresh the page and try again.',
  INTERNAL_SERVER_ERROR:
    'Something went wrong on our side. Please try again later.',
  BAD_REQUEST: 'The request could not be processed. Please try again.',
  TOO_MANY_REQUESTS: 'Too many requests. Please try again later.',
  DATA_FOUND: 'Loaded successfully.',
  DATA_NOT_AVAILABLE: 'No data available.',
  NOT_FOUND: 'Not found.',
  DUPLICATE_ENTRY: 'This record already exists. Please use different values.',

  INVALID_TOKEN: 'Invalid token.',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token.',
  INVALID_TOKEN_OR_USED: 'This token is invalid or has already been used.',
  AUTHORIZATION_MISSING: 'Authorization header is missing.',
  ACCOUNT_NOT_ACTIVE: 'Your account is inactive. Please contact support.',
  ACCOUNT_BLOCKED: 'Your account is blocked. Please contact support.',
  INVALID_CREDENTIALS: 'Invalid email or password.',

  ADMIN_NOT_FOUND: 'Admin not found.',
  ADMIN_EMAIL_ALREADY_EXISTS:
    'An admin with this email already exists. Please use a different email.',
  ADMIN_ROLE_INVALID: 'The selected role is not allowed for admin management.',
  USER_NOT_FOUND: 'User not found.',
  EMAIL_ALREADY_EXISTS:
    'A user with this email already exists. Please use a different email.',
} as const;

export const VALIDATION_MESSAGES = {
  VALID_EMAIL_PROVIDE: 'Please provide a valid email address.',
  EMAIL_MAX: 'Email can be at most 70 characters.',
  NAME_STRING: 'Name must be a string.',
  NAME_MIN: 'Name must be at least 2 characters.',
  NAME_MAX: 'Name can be at most 50 characters.',
  PASSWORD_STRING: 'Password must be a string.',
  PASSWORD_AT_LEAST: 'Password must be at least 8 characters long.',
  PASSWORD_COMPLEXITY:
    'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
  ROLE_ID_UUID: 'Role ID must be a valid UUID.',
} as const;

export const SWAGGER_MESSAGES = {
  AUTH_LOGIN: 'Authenticate a user and return session tokens',
  AUTH_REFRESH: 'Refresh access and refresh tokens',
  AUTH_LOGOUT: 'Invalidate an active session token',

  USER_GET_ADMIN_OPTIONS: 'Get admin form options',
  USER_LIST_ADMINS: 'List admins with pagination/filter/sort',
  USER_LIST_AUDIT_LOGS: 'List audit logs with pagination/filter/sort',
  USER_GET_AUDIT_LOG: 'Get audit log detail by id',
  USER_GET_ADMIN: 'Get admin by id',
  USER_CREATE_ADMIN: 'Create admin',
  USER_UPDATE_ADMIN: 'Update admin',
  USER_DELETE_ADMIN: 'Delete admin',
  USER_LIST_USERS: 'List users',
  USER_GET_BY_ID: 'Get user by id',
  USER_UPDATE: 'Update user by id',
  USER_DELETE: 'Delete user by id',

  SYSTEM_HEALTH: 'Service health check',
  SYSTEM_METRICS: 'Service process metrics',
  SYSTEM_READINESS: 'Service readiness check including downstream services',
} as const;
