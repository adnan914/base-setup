export type LoginForm = {
    email: string;
    password: string
}

export type Signupfield = {
    firstname: string;
    lastname: string;
    businessemail: string;
    companytype: string;
    phone: string;
    company: string;
}

export type Setnewpassword = {
    password: string;
    confirmpassword: string;
}

export type Setuppassword={
    password: string;
    confirmpassword: string;
    newpassword: string;
}

export type Forgotpasswordfield = {
    email: string;
}

export type Confirmcodefield = {
    confirmcode: string;
}

export type Role = {
    id: number;
    name: string;
}

export type User = {
    role: Role[]
}

export type AuthState = {
    token: string;
    refresh_token: string;
}

export type LoginRes = {
    access_token: string
    refresh_token: string
}

export type SignupRes={
    access_token: string
    refresh_token: string
}
  
