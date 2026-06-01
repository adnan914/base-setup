export interface ServiceMetricsResponse {
  service: string;
  version: string;
  timestamp: string;
  uptimeSeconds: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  cpu: {
    user: number;
    system: number;
  };
}

export function createServiceMetricsResponse(
  service: string,
): ServiceMetricsResponse {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  return {
    service,
    version: process.env['npm_package_version'] || '0.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    memory: {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      external: memoryUsage.external,
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system,
    },
  };
}
