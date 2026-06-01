import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { GatewayProxyService } from './gateway-proxy.service';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GatewayProxyService', () => {
  let service: GatewayProxyService;
  let configService: ConfigService;

  beforeEach(() => {
    jest.clearAllMocks();
    configService = {
      get: jest.fn(),
    } as unknown as ConfigService;
    service = new GatewayProxyService(configService);
  });

  it('forwards requests to the configured downstream service', async () => {
    (configService.get as jest.Mock).mockReturnValue('http://auth-service:3001');
    mockedAxios.request.mockResolvedValue({
      status: 200,
      data: { ok: true },
      headers: {
        'content-type': 'application/json',
      },
    } as never);

    const req = {
      originalUrl: '/api/auth/login',
      method: 'POST',
      headers: {
        authorization: 'Bearer token',
        'content-type': 'application/json',
        host: 'localhost:3000',
      },
      query: {
        source: 'portal',
      },
      body: {
        email: 'user@example.com',
      },
    } as any;

    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as any;

    await service.forward(req, res, 'AUTH_SERVICE_URL');

    expect(mockedAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://auth-service:3001/api/auth/login',
        method: 'POST',
        params: { source: 'portal' },
        data: { email: 'user@example.com' },
        responseType: 'arraybuffer',
      }),
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'content-type',
      'application/json',
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({ ok: true });
  });

  it('does not send a body for GET requests', async () => {
    (configService.get as jest.Mock).mockReturnValue('http://user-service:3002');
    mockedAxios.request.mockResolvedValue({
      status: 200,
      data: { data: [] },
      headers: {},
    } as never);

    const req = {
      originalUrl: '/api/users',
      method: 'GET',
      headers: {},
      query: {},
      body: { shouldNotBeSent: true },
    } as any;

    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as any;

    await service.forward(req, res, 'USER_SERVICE_URL');

    expect(mockedAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://user-service:3002/api/users',
        method: 'GET',
        data: undefined,
      }),
    );
  });

  it('throws when the downstream service URL is not configured', async () => {
    (configService.get as jest.Mock).mockReturnValue(undefined);

    const req = {
      originalUrl: '/api/auth/login',
      method: 'POST',
      headers: {},
      query: {},
      body: {},
    } as any;

    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as any;

    await expect(service.forward(req, res, 'AUTH_SERVICE_URL')).rejects.toEqual(
      new HttpException(
        'AUTH_SERVICE_URL is not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      ),
    );
  });
});
