import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import UserModel from '../models/users.model';
import TokenModel from '../models/token.model';
import { TokenType } from '../enums';
import { MessageUtil, CommonUtils } from '../utils';
import { AuthenticatedRequest, CreateUserInput, LoginInput, UpdateUserInput, UserDocument, UserListInput } from '../types';
import mongoose from 'mongoose';

class UserController {
    public async createUser({ body }: { body: CreateUserInput }, res: Response): Promise<void> {

        let { email, password } = body;

        const user: UserDocument | null = await UserModel.findOne({ email });
        if (user) throw new Error(MessageUtil.EMAIL_EXIST);

        body.password = await bcryptjs.hash(password, 10);

        const data: UserDocument = await UserModel.create(body);

        res.status(200).json({ success: true, message: MessageUtil.USER_CREATE, data });
    }

    // Update user profile
    public async updateProfile(req: Request, res: Response): Promise<void> {

        const { _id } = (req as AuthenticatedRequest).user;
        const body = req.body as UpdateUserInput;
        if (req.file) req.body.profileImg = req.file.filename;

        const data: UserDocument | null = await UserModel.findOneAndUpdate({ _id: _id }, { $set: body }, { new: true });

        if (!data) throw new Error(MessageUtil.USER_NOT_FOUND);
        res.status(200).json({ success: true, message: MessageUtil.PROFILE_UPDATE_SUCC, data });

    }

    // User login
    public async loginUser({ body }: { body: LoginInput }, res: Response): Promise<void> {
        const { email, password } = body;
        const user: UserDocument | null = await UserModel.findOne({ email }).select('+password');
        if (!user) throw new Error(MessageUtil.INVALID_CRED);

        const { _id, password: encryptedPass } = user;

        const isPasswordMatch = await bcryptjs.compare(password, encryptedPass as string);

        if (!isPasswordMatch) throw new Error(MessageUtil.INVALID_CRED);

        // Generate JWT token and refresh token
        const accessToken = CommonUtils.generateToken({ _id, email, tokenType: TokenType.ACCESS }, process.env.JWT_SECRET as string, { expiresIn: process.env.JWT_EXPIRATION });
        const refreshToken = CommonUtils.generateToken({ _id, email, tokenType: TokenType.REFRESH }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: process.env.JWT_REFRESH_EXPIRATION });

        await TokenModel.deleteMany({ userId: _id });
        await TokenModel.insertMany([
            { userId: _id, token: accessToken, type: TokenType.ACCESS },
            { userId: _id, token: refreshToken, type: TokenType.REFRESH }
        ]);

        user.accessToken = accessToken;
        user.refreshToken = refreshToken;

        res
            .cookie('accessToken', accessToken, { httpOnly: true, secure: true, maxAge: 1 * 60 * 60 * 1000 })
            .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, maxAge: 2 * 60 * 60 * 1000 })
            .status(200).json({ success: true, message: MessageUtil.LOGIN, data: user });
    }

    public async logOut(req: Request, res: Response): Promise<void> {

        const { _id } = (req as AuthenticatedRequest).user;
        const user = await UserModel.findOne({ _id });
        if (!user) throw new Error(MessageUtil.INVALID_TOKEN_OR_USED);

        await TokenModel.deleteMany({ userId: _id });

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        res.status(200).json({ success: true, message: MessageUtil.LOG_OUT });

    }

    public async userList(req: Request, res: Response): Promise<void> {
        const { limit = 10, lastSeenId } = req.query as UserListInput;
        if (limit === 0) throw new Error(MessageUtil.LIMIT_ZERO);
        const matchStage = lastSeenId
            ? { _id: { $gt: new mongoose.Types.ObjectId(lastSeenId) } }
            : {};

        const pipeline: mongoose.PipelineStage[] = [
            {
                $facet: {
                    data: [
                        { $match: matchStage },
                        { $sort: { _id: 1 } },
                        { $limit: limit + 1 }, // +1 to check hasNextPage
                    ],
                    totalCount: [
                        // No match => counts all documents
                        { $count: 'count' },
                    ],
                },
            },
            {
                $unwind: {
                    path: '$totalCount',
                    preserveNullAndEmptyArrays: true,
                },
            },
        ];

        const result = await UserModel.aggregate<{
            data: UserDocument[];
            totalCount?: { count: number };
        }>(pipeline);

        const data = result[0]?.data || [];
        const totalCount = result[0]?.totalCount?.count || 0;

        const hasNextPage = data.length > limit;
        const paginatedUsers = hasNextPage ? data.slice(0, -1) : data;
        const newLastSeenId = paginatedUsers[paginatedUsers.length - 1]?._id;
        res.status(200).json({ success: true, message: MessageUtil.DATA_FOUND, totalCount, lastSeenId: newLastSeenId, data: paginatedUsers });
    }

}

export default new UserController();