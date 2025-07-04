import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { resMessage } from '../helpers/response.messages.helper';

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
        return res.status(401).json({ status: false, msg: resMessage.NOT_PROVIDED_TOKEN });
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err: any, userData: any) => {
        if (err) {
            res.status(403).json({ status: false, msg: resMessage.INVALID_TOKEN });
        }

        req.userData = userData; // Attach the user data to the request
        next(); // Proceed to the next middleware
    });
};

export { verifyToken };
