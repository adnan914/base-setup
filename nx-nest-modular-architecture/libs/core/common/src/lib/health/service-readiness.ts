export interface ReadinessCheck {
  name: string;
  status: 'ready' | 'not_ready';
  details?: string;
}

export interface ServiceReadinessResponse {
  status: 'ready' | 'not_ready';
  service: string;
  version: string;
  timestamp: string;
  checks: ReadinessCheck[];
}

export function createServiceReadinessResponse(
  service: string,
  checks: ReadinessCheck[],
): ServiceReadinessResponse {
  return {
    status: checks.every((check) => check.status === 'ready')
      ? 'ready'
      : 'not_ready',
    service,
    version: process.env['npm_package_version'] || '0.0.0',
    timestamp: new Date().toISOString(),
    checks,
  };
}
