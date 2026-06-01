import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createStructuredLogger,
  DEFAULT_GATEWAY_PROXY_RETRIES,
  DEFAULT_GATEWAY_PROXY_TIMEOUT_MS,
} from '@lib/core/common';
import { ServiceUrlEnvKey } from '@lib/core/contracts';
import axios, { AxiosHeaders, Method } from 'axios';
import { Request, Response } from 'express';

@Injectable()
export class GatewayProxyService {
  private readonly logger = createStructuredLogger(
    'api-gateway',
    GatewayProxyService.name,
  );

  constructor(private readonly configService: ConfigService) {}

  async forward(req: Request, res: Response, targetEnvKey: ServiceUrlEnvKey) {
    const baseUrl = this.configService.get<string>(targetEnvKey);
    if (!baseUrl) {
      throw new HttpException(
        `${targetEnvKey} is not configured`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const targetUrl = `${baseUrl}${req.path}`;
    const headers = new AxiosHeaders();

    const isMultipartRequest = this.isMultipartRequest(req);

    Object.entries(req.headers).forEach(([key, value]) => {
      if (!value) return;
      const lowerKey = key.toLowerCase();
      if (['host', 'connection'].includes(lowerKey)) return;
      if (lowerKey === 'content-length' && !isMultipartRequest) return;
      headers.set(key, Array.isArray(value) ? value.join(',') : value);
    });

    const response = await this.forwardWithRetry(
      {
        url: targetUrl,
        method: req.method as Method,
        headers,
        params: req.query,
        data: this.shouldSendBody(req.method)
          ? (isMultipartRequest ? req : req.body)
          : undefined,
        responseType: 'arraybuffer',
        validateStatus: () => true,
        timeout: this.getProxyTimeoutMs(),
      },
      req.method,
      targetUrl,
    );

    Object.entries(response.headers).forEach(([key, value]) => {
      if (['transfer-encoding', 'connection', 'content-encoding'].includes(key.toLowerCase())) return;
      if (typeof value !== 'undefined') {
        res.setHeader(key, value as string);
      }
    });

    res.status(response.status).send(response.data);
  }

  private shouldSendBody(method: string) {
    return !['GET', 'HEAD'].includes(method.toUpperCase());
  }

  private isMultipartRequest(req: Request) {
    const contentType = req.headers['content-type'];
    const normalized = Array.isArray(contentType) ? contentType.join(',') : contentType || '';
    return normalized.toLowerCase().includes('multipart/form-data');
  }

  private async forwardWithRetry(
    requestConfig: Parameters<typeof axios.request>[0],
    method: string,
    targetUrl: string,
  ) {
    const retries = this.getProxyRetries();
    const isRetryableMethod = ['GET', 'HEAD', 'OPTIONS'].includes(
      method.toUpperCase(),
    );

    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        const response = await axios.request(requestConfig);

        if (
          attempt < retries &&
          isRetryableMethod &&
          [502, 503, 504].includes(response.status)
        ) {
          this.logger.warn({
            event: 'gateway_proxy_retry',
            targetUrl,
            attempt: attempt + 1,
            reason: `upstream_status_${response.status}`,
          });
          continue;
        }

        return response;
      } catch (error) {
        lastError = error;

        if (attempt >= retries || !isRetryableMethod) {
          break;
        }

        this.logger.warn({
          event: 'gateway_proxy_retry',
          targetUrl,
          attempt: attempt + 1,
          reason: error instanceof Error ? error.message : 'unknown_proxy_error',
        });
      }
    }

    throw new HttpException(
      {
        success: false,
        message: 'Service unavailable',
        error:
          lastError instanceof Error
            ? lastError.message
            : 'Unknown service error',
      },
      HttpStatus.BAD_GATEWAY,
    );
  }

  private getProxyTimeoutMs() {
    return Number(
      this.configService.get('GATEWAY_PROXY_TIMEOUT_MS') ||
        DEFAULT_GATEWAY_PROXY_TIMEOUT_MS,
    );
  }

  private getProxyRetries() {
    return Number(
      this.configService.get('GATEWAY_PROXY_RETRIES') ||
        DEFAULT_GATEWAY_PROXY_RETRIES,
    );
  }
}
