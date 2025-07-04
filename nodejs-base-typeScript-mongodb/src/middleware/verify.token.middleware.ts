import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { ResMessageUtil } from '../utils';
import { TokenType } from '../enums';
import UserModel, { IUser } from '../models/users.model';
import RefreshTokenModel from '../models/refresh.token.model';

interface UserData extends JwtPayload {
    // Add any specific user properties expected in the token, for example:
    userId: string;
    role: string;
}

// Extend the Express Request interface to include 'userData'
declare global {
    namespace Express {
        interface Request {
            userData?: UserData;
        }
    }
}

const verifyToken = (req: Request, res: Response, next: NextFunction): any => {

    const token: string = req.headers['authorization']?.split(' ')[1]!;
    if (!token) {
        return res.status(401).json({ status: false, msg: ResMessageUtil.NOT_PROVIDED_TOKEN });

    }
    let secret = process.env.JWT_SECRET as string;

    if (req.body.tokenType === TokenType.REFRESH) {
        secret = process.env.JWT_REFRESH_SECRET as string;
        req.body.token = token;
    }

    jwt.verify(token, secret as string, async (err: any, userData: any) => {
        if (err) {
            return res.status(403).json({ status: false, msg: ResMessageUtil.INVALID_TOKEN });
        }
        const isEmailExist = await UserModel.findOne({ _id: userData._id });
        if (!isEmailExist) {
            return res.status(403).json({ status: false, msg: ResMessageUtil.INVALID_TOKEN });
        }

        req.userData = userData;
        next(); // Proceed to the next middleware
    });
};

export { verifyToken };
