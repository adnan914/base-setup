import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class HashService {
    hash(value: string) { return bcrypt.hash(value, 10); }
    compare(value: string, hash: string) { return bcrypt.compare(value, hash); }
}
