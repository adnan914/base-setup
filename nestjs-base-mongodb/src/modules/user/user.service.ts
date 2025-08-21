import { Injectable, Inject, forwardRef, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { HashService } from '../../shared/services/hash.service';
import { AuthService } from '../auth/auth.service'; // circular ref demo

@Injectable()
export class UserService implements OnModuleInit {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly hash: HashService,
        @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService, // circular dependency handled
    ) { }

    onModuleInit() {
        // lifecycle event example
    }

    async create(dto: { email: string; password: string; name?: string }) {
        const password = await this.hash.hash(dto.password);
        const doc = new this.userModel({ ...dto, password });
        return doc.save();
    }

    findByEmail(email: string) {
        return this.userModel.findOne({ email }).lean();
    }

    findAll() {
        return this.userModel.find().lean();
    }
}
