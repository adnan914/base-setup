export interface ServiceHealthResponse {
  status: 'ok';
  service: string;
  version: string;
  timestamp: string;
  uptime: number;
}

export function createServiceHealthResponse(
  service: string,
): ServiceHealthResponse {
  return {
    status: 'ok',
    service,
    version: process.env['npm_package_version'] || '0.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
  };
}
