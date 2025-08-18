import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import { UserRepository, TokenRepository } from '@/repositories';
import { TokenType } from '@/enums';
import { MessageUtil, CommonUtils, StatusUtil, AppError } from '@/utils';
import { AuthenticatedRequest, CreateUserInput, LoginInput, UpdateUserInput, UserListInput } from '../types';
import { LessThan } from 'typeorm';
import { StringValue } from 'ms';

class UserController {

    // Create User
    public async createUser(req: Request, res: Response): Promise<void> {
        const body: CreateUserInput = req.body;
        const existingUser = await UserRepository.findOneBy({ email: body.email });
        if (existingUser) throw new AppError(MessageUtil.EMAIL_EXIST, StatusUtil.CONFLICT);

        const password = CommonUtils.generateRandomString(10);
        const encryptedPassword = await bcryptjs.hash(password, 10);
        const user = UserRepository.create({ ...body, password: encryptedPassword });
        await UserRepository.save(user);

        res.status(StatusUtil.OK).json({ success: true, message: MessageUtil.USER_CREATE, data: user });
    }

    // Update User Profile
    public async updateProfile(req: Request, res: Response): Promise<void> {
        const userId = (req as AuthenticatedRequest).user.id;
        const body: UpdateUserInput = req.body;

        if (req.file) req.body.profileImg = req.file.filename;

        const user = await UserRepository.findOneBy({ id: userId });
        if (!user) throw new AppError(MessageUtil.USER_NOT_FOUND, StatusUtil.NOT_FOUND);

        Object.assign(user, body);
        await UserRepository.save(user);

        res.status(StatusUtil.OK).json({ success: true, message: MessageUtil.PROFILE_UPDATE_SUCC, data: user });
    }

    // User Login
    public async loginUser(req: Request, res: Response): Promise<void> {
        const { email, password }: LoginInput = req.body;

        const user = await UserRepository.findOne({
            where: { email },
            select: ["id", "email", "password", "role", "status"]
        });

        if (!user) throw new AppError(MessageUtil.INVALID_CRED, StatusUtil.UNAUTHORIZED);

        const isPasswordMatch = await bcryptjs.compare(password, user.password!);
        if (!isPasswordMatch) throw new AppError(MessageUtil.INVALID_CRED, StatusUtil.UNAUTHORIZED);

        // Generate JWT tokens
        const payload = { id: user.id, email: user.email };
        const accessToken = CommonUtils.generateToken({ ...payload, tokenType: TokenType.ACCESS }, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_EXPIRATION as StringValue });
        const refreshToken = CommonUtils.generateToken({ ...payload, tokenType: TokenType.REFRESH }, process.env.JWT_REFRESH_SECRET!, { expiresIn: process.env.JWT_REFRESH_EXPIRATION as StringValue });

        // Delete old tokens
        await TokenRepository.delete({ user: { id: user.id } });

        // Save new tokens
        const tokens = [
            TokenRepository.create({ user, token: accessToken, type: TokenType.ACCESS, used: false }),
            TokenRepository.create({ user, token: refreshToken, type: TokenType.REFRESH, used: false })
        ];
        await TokenRepository.save(tokens);

        // Attach tokens to user object (runtime only)
        (user as any).accessToken = accessToken;
        (user as any).refreshToken = refreshToken;

        // Send cookies & response
        res
            .cookie('accessToken', accessToken, { httpOnly: true, secure: true, maxAge: 1 * 60 * 60 * 1000 })
            .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, maxAge: 2 * 60 * 60 * 1000 })
            .status(StatusUtil.OK)
            .json({ success: true, message: MessageUtil.LOGIN, data: user });
    }

    // User Logout
    public async logOut(req: Request, res: Response): Promise<void> {
        const userId = (req as AuthenticatedRequest).user.id;

        const user = await UserRepository.findOneBy({ id: userId });
        if (!user) throw new AppError(MessageUtil.INVALID_TOKEN_OR_USED, StatusUtil.BAD_REQUEST);

        await TokenRepository.delete({ user: { id: userId } });

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        res.status(StatusUtil.OK).json({ success: true, message: MessageUtil.LOG_OUT });
    }

    // List Users with Pagination (lastSeenId)
    public async userList(req: Request, res: Response): Promise<void> {
        const { limit = 10, lastSeenId }: UserListInput = req.query as any;

        if (limit === 0) throw new AppError(MessageUtil.LIMIT_ZERO, StatusUtil.BAD_REQUEST);

        const whereCondition: any = {};
        if (lastSeenId) whereCondition.id = LessThan(lastSeenId);

        const users = await UserRepository.find({
            where: whereCondition,
            order: { id: 'ASC' },
            take: limit + 1
        });

        const hasNextPage = users.length > limit;
        const paginatedUsers = hasNextPage ? users.slice(0, -1) : users;
        const newLastSeenId = paginatedUsers[paginatedUsers.length - 1]?.id;

        const totalCount = await UserRepository.count();

        res.status(StatusUtil.OK).json({
            success: true,
            message: MessageUtil.DATA_FOUND,
            totalCount,
            lastSeenId: newLastSeenId,
            data: paginatedUsers
        });
    }
}

export default new UserController();
