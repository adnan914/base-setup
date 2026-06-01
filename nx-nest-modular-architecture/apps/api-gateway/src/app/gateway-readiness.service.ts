import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServiceUrlEnvKey } from '@lib/core/contracts';
import { ReadinessCheck } from '@lib/core/common';
import axios from 'axios';

const DOWNSTREAM_SERVICES: Array<{
  name: string;
  envKey: ServiceUrlEnvKey;
}> = [
  { name: 'auth-service', envKey: 'AUTH_SERVICE_URL' },
  { name: 'user-service', envKey: 'USER_SERVICE_URL' },
];

@Injectable()
export class GatewayReadinessService {
  constructor(private readonly configService: ConfigService) {}

  async getChecks(): Promise<ReadinessCheck[]> {
    const checks = await Promise.all(
      DOWNSTREAM_SERVICES.map(async ({ name, envKey }) => {
        const baseUrl = this.configService.get<string>(envKey);

        if (!baseUrl) {
          return {
            name,
            status: 'not_ready' as const,
            details: `${envKey} is not configured`,
          };
        }

        try {
          const response = await axios.get(`${baseUrl}/api/health`, {
            timeout: 3000,
            validateStatus: () => true,
          });

          return {
            name,
            status:
              response.status === 200
                ? ('ready' as const)
                : ('not_ready' as const),
            details:
              response.status === 200
                ? undefined
                : `Unexpected status ${response.status}`,
          };
        } catch (error) {
          return {
            name,
            status: 'not_ready' as const,
            details:
              error instanceof Error ? error.message : 'Unknown health check error',
          };
        }
      }),
    );

    return checks;
  }
}
