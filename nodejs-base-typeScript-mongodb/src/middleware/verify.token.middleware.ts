import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AppError, MessageUtil, StatusUtil } from '@/utils';
import { TokenType } from '@/enums';
import TokenModel from '@/models/token.model';
import { AuthenticatedRequest, TokenDocument, UserDecoded } from '@/types';

const tokenExist = async (token: string) => {
    if (!token) throw new AppError(MessageUtil.NOT_PROVIDED_TOKEN, StatusUtil.FORBIDDEN);
    const storedToken: TokenDocument | null = await TokenModel.findOne({ token });
    if (!storedToken) throw new AppError(MessageUtil.INVALID_TOKEN_OR_USED, StatusUtil.BAD_REQUEST);
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
            throw new AppError(MessageUtil.INVALID_TOKEN, StatusUtil.FORBIDDEN);
    }
};

const checkAuthorization = async (headers: any) => {
    const token: string = headers['authorization']?.split(' ')[1]!;
    if (!token) throw new AppError(MessageUtil.AUTHORIZATION_MISSING, StatusUtil.UNAUTHORIZED);

    await tokenExist(token);
    return token;
}

export const verifyToken = (type = TokenType.ACCESS) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = await checkAuthorization(req.headers);
            const secret = getSecretByTokenType(type);

            const decoded = jwt.verify(token, secret) as UserDecoded;

            if (!decoded) throw new AppError(MessageUtil.INVALID_TOKEN, StatusUtil.FORBIDDEN);
            (req as AuthenticatedRequest).user = decoded;

            next();

        } catch (error) {
            res.status(StatusUtil.UNAUTHORIZED).json({ status: false, message: MessageUtil.INVALID_TOKEN });
        }
    }
};
