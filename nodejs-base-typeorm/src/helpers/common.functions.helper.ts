import { SignOptions, sign } from "jsonwebtoken"

export const generateToken = (data: any, secret: string, payload: SignOptions) => {
    return sign(data, secret, { expiresIn: payload.expiresIn });
}