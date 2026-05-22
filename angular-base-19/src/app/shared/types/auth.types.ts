export interface LoginType {
    email: string;
    password: string;
}

export interface SignupType {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface ForgotPasswordType {
    email: string;
}

export interface ResetPasswordType {
    token: string;
    password: string;
    confirmPassword: string;
}