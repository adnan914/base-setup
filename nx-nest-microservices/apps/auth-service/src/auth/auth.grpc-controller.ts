import { Controller } from '@nestjs/common';
import { GRPC_SERVICES, LoginRequest, RefreshRequest, RegisterRequest, ValidateTokenRequest } from '@ecommerce/contracts';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthGrpcController {
  constructor(private readonly auth: AuthService) {}

  @GrpcMethod(GRPC_SERVICES.auth, 'Register')
  register(payload: RegisterRequest) {
    return this.auth.register(payload);
  }

  @GrpcMethod(GRPC_SERVICES.auth, 'Login')
  login(payload: LoginRequest) {
    return this.auth.login(payload);
  }

  @GrpcMethod(GRPC_SERVICES.auth, 'Refresh')
  refresh(payload: RefreshRequest) {
    return this.auth.refresh(payload);
  }

  @GrpcMethod(GRPC_SERVICES.auth, 'ValidateToken')
  validateToken(payload: ValidateTokenRequest) {
    return this.auth.validateToken(payload);
  }
}
