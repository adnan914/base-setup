import { GatewayProxyController } from './gateway-proxy.controller';
import { GatewayProxyService } from './gateway-proxy.service';

describe('GatewayProxyController', () => {
  let controller: GatewayProxyController;
  let gatewayProxyService: jest.Mocked<GatewayProxyService>;

  beforeEach(() => {
    gatewayProxyService = {
      forward: jest.fn(),
    } as unknown as jest.Mocked<GatewayProxyService>;
    controller = new GatewayProxyController(gatewayProxyService);
  });

  it('routes auth traffic to auth service key', () => {
    const req = {} as any;
    const res = {} as any;

    controller.proxyAuth(req, res);

    expect(gatewayProxyService.forward).toHaveBeenCalledWith(
      req,
      res,
      'AUTH_SERVICE_URL',
    );
  });

  it('routes user traffic to user service key', () => {
    const req = {} as any;
    const res = {} as any;

    controller.proxyUsers(req, res);

    expect(gatewayProxyService.forward).toHaveBeenCalledWith(
      req,
      res,
      'USER_SERVICE_URL',
    );
  });
});
