import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Uses ExecutionContext under the hood
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { }
