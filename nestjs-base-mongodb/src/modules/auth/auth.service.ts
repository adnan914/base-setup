import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { HashService } from '../../shared/services/hash.service';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class AuthService {
    constructor(
        private readonly users: UserService,             // forwardRef handled in module
        private readonly hash: HashService,
        private readonly jwt: JwtService,
        private readonly moduleRef: ModuleRef,           // Module reference usage example
    ) { }

    async register(dto: { email: string; password: string; name: string }) {
        const existing = await this.users.findByEmail(dto.email);
        if (existing) throw new UnauthorizedException('Email already exists');
        const user = await this.users.create(dto);
        return this.sign(user);
    }

    async login(email: string, password: string) {
        const user: any = await this.users.findByEmail(email);
        if (!user || !(await this.hash.compare(password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.sign(user);
    }

    private sign(user: any) {
        const payload = { sub: String(user._id), email: user.email, role: user.role };
        return {
            accessToken: this.jwt.sign(payload),
            user: { id: user._id, email: user.email, role: user.role, name: user.name },
        };
    }
}
