import { Injectable } from '@nestjs/common';

@Injectable()
export class GlobalConfigService {
    get isProd() { return process.env.NODE_ENV === 'production'; }
    get mongoUri() { return process.env.MONGO_URI!; }
    get jwtSecret() { return process.env.JWT_SECRET!; }
    get jwtExpires() { return process.env.JWT_EXPIRES || '1d'; }
    get port() { return Number(process.env.PORT ?? 3000); }
}
