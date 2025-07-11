import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { MessageUtil } from '../utils';
import { TokenType } from '../enums';
import TokenModel from '../models/token.model'; '../models/token.model';
import { AuthenticatedRequest, TokenDocument, UserDecoded } from '../types';


const tokenExist = async (token: string) => {
    if (!token) throw new Error(MessageUtil.NOT_PROVIDED_TOKEN);
    const storedToken: TokenDocument | null = await TokenModel.findOne({ token });
    if (!storedToken) throw new Error(MessageUtil.INVALID_TOKEN_OR_USED);
};

const getSecretByTokenType = (tokenType: TokenType): string => {
    switch (tokenType) {
        case TokenType.ACCESS:
            return process.env.JWT_SECRET!;
        case TokenType.REFRESH:
            return process.env.JWT_REFRESH_SECRET!;
        case TokenType.FORGOTPASSWORD:
            return process.env.JWT_FORGOT_PASSWORD_SECRET!;
        default:
            throw new Error(MessageUtil.INVALID_TOKEN);
    }
};

const checkAuthorization = async (headers: any) => {
    const authHeader: string = headers['authorization']?.split(' ')[1]!;
    if (!authHeader) throw new Error(MessageUtil.AUTHORIZATION_MISSING);

    const token: string = authHeader.split(' ')[1];
    await tokenExist(token);
    return token;
}

export const verifyToken = (type = TokenType.ACCESS) => {
    return async (req: Request, res: Response, next: NextFunction) => {

        try {
            const token = await checkAuthorization(req.headers);
            const secret = getSecretByTokenType(type);

            const decoded = jwt.verify(token, secret) as UserDecoded;

            if (!decoded) throw new Error(MessageUtil.INVALID_TOKEN);
            (req as AuthenticatedRequest).user = decoded;

            next();

        } catch (error) {
            res.json({ status: false, message: MessageUtil.INVALID_TOKEN });
        }
    }
};
