import { Type, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  CustomValidationPipe,
  createRateLimitMiddleware,
  createRequestContextMiddleware,
  createNormalizeQueryMiddleware,
  createStructuredLogger,
  GlobalExceptionFilter,
  ResponseInterceptor,
  TimeoutInterceptor,
  DEFAULT_API_PREFIX,
  DEFAULT_AUTH_RATE_LIMIT_MAX_REQUESTS,
  DEFAULT_BODY_SIZE_LIMIT,
  DEFAULT_RATE_LIMIT_MAX_REQUESTS,
  DEFAULT_RATE_LIMIT_WINDOW_MS,
  DEFAULT_REQUEST_TIMEOUT_MS,
  DEFAULT_SWAGGER_VERSION,
  LOCAL_CORS_ORIGINS,
} from '@lib/core/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { json, urlencoded } from 'express';
import helmet, { HelmetOptions } from 'helmet';

export interface BootstrapHttpAppOptions {
  appModule: Type<unknown>;
  serviceName: string;
  title: string;
  description: string;
  defaultPort: number;
  portEnvKey?: string;
  hostEnvKey?: string;
  defaultHost?: string;
  swaggerDocuments?: BootstrapSwaggerDocumentOptions[];
}

export interface BootstrapSwaggerDocumentOptions {
  route: string;
  title: string;
  description: string;
  tags: string[];
}

export async function bootstrapHttpApp({
  appModule,
  serviceName,
  title,
  description,
  defaultPort,
  portEnvKey = 'PORT',
  hostEnvKey = 'HOST',
  defaultHost = '0.0.0.0',
  swaggerDocuments = [],
}: BootstrapHttpAppOptions) {
  const app = await NestFactory.create<NestExpressApplication>(appModule);
  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);
  const logger = createStructuredLogger(
    serviceName,
    `${serviceName}-bootstrap`,
  );
  const express = app.getHttpAdapter().getInstance();
  const trustProxy = getTrustProxySetting(configService);
  const apiPrefix = configService.get<string>('API_PREFIX') || DEFAULT_API_PREFIX;

  if (trustProxy !== false) {
    express.set('trust proxy', trustProxy);
  }

  const bodySizeLimit = getBodySizeLimit(configService);
  const rateLimitConfig = getRateLimitConfig(configService);
  const authRateLimitConfig = getAuthRateLimitConfig(configService);
  app.enableCors(getCorsOptions(configService));
  app.use(createRequestContextMiddleware(serviceName));
  app.use(createNormalizeQueryMiddleware());
  app.use(
    createRateLimitMiddleware(
      serviceName,
      rateLimitConfig,
      authRateLimitConfig,
    ),
  );
  app.use(json({ limit: bodySizeLimit }));
  app.use(urlencoded({ extended: true, limit: bodySizeLimit }));
  app.use(helmet(getHelmetOptions(configService)));
  app.setGlobalPrefix(apiPrefix);

  app.useGlobalPipes(
    new CustomValidationPipe(),
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(
    new ResponseInterceptor(reflector),
    new TimeoutInterceptor(DEFAULT_REQUEST_TIMEOUT_MS),
  );

  const swaggerEnabled = isSwaggerEnabled(configService);
  if (swaggerEnabled) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle(title)
        .setDescription(description)
        .setVersion(DEFAULT_SWAGGER_VERSION)
        .addBearerAuth({
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Paste access token only. Do not include Bearer prefix.',
          in: 'header',
        })
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
          },
          'JWT-auth',
        )
        .addServer(`/${apiPrefix}`, 'API base path')
        .build(),
      {
        operationIdFactory: (controllerKey: string, methodKey: string) =>
          `${controllerKey}_${methodKey}`,
      },
    );

    for (const swaggerDocument of swaggerDocuments) {
      const filteredDocument = filterSwaggerDocumentByTags(
        document as unknown as SwaggerDocumentRecord,
        swaggerDocument,
      );
      express.get(swaggerDocument.route, (_req: unknown, res: { type: (contentType: string) => { send: (body: unknown) => void } }) => {
        res.type('application/json').send(filteredDocument);
      });
    }

    SwaggerModule.setup('docs', app, document, {
      customSiteTitle: `${title} Docs`,
      ...(serviceName === 'api-gateway'
        ? {
            explorer: true,
            swaggerUrl: `/${apiPrefix}/openapi.json`,
          }
        : {}),
      swaggerOptions: {
        ...(serviceName === 'api-gateway'
          ? {
              urls: [
                { name: 'Merged API', url: `/${apiPrefix}/openapi.json` },
                {
                  name: 'API Gateway',
                  url: `/${apiPrefix}/openapi/gateway.json`,
                },
                {
                  name: 'Auth Service',
                  url: `/${apiPrefix}/openapi/auth.json`,
                },
                {
                  name: 'User Service',
                  url: `/${apiPrefix}/openapi/users.json`,
                },
              ],
              urlsPrimaryName: 'Merged API',
            }
          : {}),
        requestInterceptor: (request: { headers?: Record<string, string> }) => {
          const authorizationHeader = request.headers?.['Authorization'];

          if (typeof authorizationHeader === 'string') {
            const normalizedToken = authorizationHeader
              .replace(/^Bearer\s+/i, '')
              .replace(/^"+|"+$/g, '')
              .trim();

            if (normalizedToken) {
              request.headers = {
                ...(request.headers ?? {}),
                ['Authorization']: `Bearer ${normalizedToken}`,
              };
            }
          }

          return request;
        },
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
        displayRequestDuration: true,
        docExpansion: 'list',
      },
    });
  }

  express.get('/', (_req: unknown, res: { send: (body: string) => void }) => {
    res.send(createStatusPageHtml(title, serviceName));
  });

  const port = Number(
    configService.get<string>(portEnvKey) ||
      configService.get<string>('PORT') ||
      defaultPort,
  );
  const host = configService.get<string>(hostEnvKey) || defaultHost;
  await app.listen(port, host);

  const env = process.env['NODE_ENV'] || 'development';
  const version = process.env['npm_package_version'] || '0.0.0';
  const baseUrl =
    env === 'production'
      ? `http://localhost:${port}`
      : `http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`;
  const docsUrl = `${baseUrl}/docs`;

  logger.log({
    event: 'service_started',
    version,
    environment: env,
    host,
    port,
    baseUrl,
    docsUrl: swaggerEnabled ? docsUrl : 'disabled',
    trustProxy: trustProxy === false ? 'disabled' : trustProxy,
    bodySizeLimit,
  });

  return app;
}

function getCorsOptions(configService: ConfigService): CorsOptions {
  const origins = getCorsOrigins(configService);

  return {
    origin: (requestOrigin, callback) => {
      if (!requestOrigin) {
        callback(null, true);
        return;
      }

      if (origins === false) {
        callback(null, false);
        return;
      }

      const isAllowed = origins.some((allowedOrigin) =>
        doesOriginMatch(allowedOrigin, requestOrigin),
      );

      callback(null, isAllowed ? requestOrigin : false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Authorization',
      'Content-Type',
      'Accept',
      'Origin',
      'X-Requested-With',
      'X-Request-Id',
      'X-Client',
    ],
    exposedHeaders: ['X-Request-Id'],
    optionsSuccessStatus: 204,
    preflightContinue: false,
  };
}

function getHelmetOptions(configService: ConfigService): HelmetOptions {
  const nodeEnv = (configService.get<string>('NODE_ENV') || 'development')
    .trim()
    .toLowerCase();
  
  const publicUrl =
    configService.get<string>('PROD_URL') ||
    configService.get<string>('PUBLIC_URL') ||
    '';
    
  const isHttpsDeployment = 
    nodeEnv === 'production' && 
    publicUrl.trim().toLowerCase().startsWith('https://');

  return {
    hsts: isHttpsDeployment
      ? {
          maxAge: 31536000,
          includeSubDomains: true,
        }
      : false,
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'upgrade-insecure-requests': isHttpsDeployment ? [] : null,
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  };
}

function getCorsOrigins(configService: ConfigService) {
  const corsOriginRaw = configService.get<string>('CORS_ORIGIN') || '';
  const corsOrigins = corsOriginRaw
    .split(',')
    .map((origin) => normalizeOrigin(origin))
    .filter((origin): origin is string => Boolean(origin));

  if (corsOrigins.length > 0) {
    return Array.from(new Set(corsOrigins));
  }

  const nodeEnv = (configService.get<string>('NODE_ENV') || 'development')
    .trim()
    .toLowerCase();

  if (nodeEnv === 'production') {
    return false;
  }
  return [...LOCAL_CORS_ORIGINS];
}

function doesOriginMatch(allowedOrigin: string, requestOrigin: string) {
  const normalizedAllowedOrigin = normalizeOrigin(allowedOrigin);
  const normalizedRequestOrigin = normalizeOrigin(requestOrigin);

  if (!normalizedAllowedOrigin || !normalizedRequestOrigin) {
    return false;
  }

  if (normalizedAllowedOrigin === normalizedRequestOrigin) {
    return true;
  }

  try {
    const allowedUrl = new URL(normalizedAllowedOrigin);
    const requestUrl = new URL(normalizedRequestOrigin);

    return (
      allowedUrl.protocol === requestUrl.protocol &&
      allowedUrl.port === requestUrl.port &&
      isLoopbackHost(allowedUrl.hostname) &&
      isLoopbackHost(requestUrl.hostname)
    );
  } catch {
    return false;
  }
}

function normalizeOrigin(origin: string) {
  const normalizedOrigin = origin.trim();

  if (!normalizedOrigin) {
    return '';
  }

  try {
    return new URL(normalizedOrigin).origin;
  } catch {
    return normalizedOrigin.replace(/\/$/, '');
  }
}

function isLoopbackHost(hostname: string) {
  return ['localhost', '127.0.0.1', '::1'].includes(
    hostname.trim().toLowerCase(),
  );
}

function getTrustProxySetting(configService: ConfigService) {
  const trustProxyValue = configService.get<string>('TRUST_PROXY');

  if (!trustProxyValue) {
    return false;
  }

  const normalizedValue = trustProxyValue.trim().toLowerCase();

  if (normalizedValue === 'true') {
    return true;
  }

  if (normalizedValue === 'false') {
    return false;
  }

  const numericValue = Number(normalizedValue);
  if (!Number.isNaN(numericValue)) {
    return numericValue;
  }

  return trustProxyValue;
}

function isSwaggerEnabled(configService: ConfigService) {
  const swaggerEnabled = configService.get<string>('SWAGGER_ENABLED');

  if (swaggerEnabled) {
    return swaggerEnabled.trim().toLowerCase() === 'true';
  }

  const nodeEnv = (configService.get<string>('NODE_ENV') || 'development')
    .trim()
    .toLowerCase();

  return nodeEnv !== 'production';
}

function getBodySizeLimit(configService: ConfigService) {
  return configService.get<string>('BODY_SIZE_LIMIT') || DEFAULT_BODY_SIZE_LIMIT;
}

type SwaggerDocumentRecord = Record<string, unknown> & {
  info?: Record<string, unknown>;
  paths?: Record<string, unknown>;
  tags?: Array<Record<string, unknown>>;
};

function filterSwaggerDocumentByTags(
  document: SwaggerDocumentRecord,
  swaggerDocument: BootstrapSwaggerDocumentOptions,
) {
  const allowedTags = new Set(swaggerDocument.tags.map((tag) => String(tag).trim()).filter(Boolean));

  const filteredPaths = Object.fromEntries(
    Object.entries(document.paths ?? {}).reduce<Array<[string, unknown]>>((acc, [path, pathItem]) => {
      const filteredPathItem = Object.fromEntries(
        Object.entries(pathItem as Record<string, unknown>).filter(([, operation]) => {
          const operationTags = new Set(
            Array.isArray((operation as { tags?: unknown[] })?.tags)
              ? (operation as { tags?: unknown[] }).tags
                  .map((tag) => String(tag).trim())
                  .filter(Boolean)
              : [],
          );

          if (allowedTags.size === 0) {
            return true;
          }

          for (const tag of operationTags) {
            if (allowedTags.has(tag)) {
              return true;
            }
          }

          return false;
        }),
      );

      if (Object.keys(filteredPathItem).length > 0) {
        acc.push([path, filteredPathItem]);
      }

      return acc;
    }, []),
  );

  const filteredTags = (document.tags ?? []).filter((tag: Record<string, unknown>) => {
    const name = String(tag?.['name'] ?? '').trim();
    return !allowedTags.size || allowedTags.has(name);
  });

  return {
    ...document,
    info: {
      ...(document.info ?? {}),
      title: swaggerDocument.title,
      description: swaggerDocument.description,
    },
    paths: filteredPaths,
    tags: filteredTags,
  };
}

function getRateLimitConfig(configService: ConfigService) {
  return {
    windowMs: Number(configService.get('RATE_LIMIT_WINDOW_MS') || DEFAULT_RATE_LIMIT_WINDOW_MS),
    maxRequests: Number(configService.get('RATE_LIMIT_MAX_REQUESTS') || DEFAULT_RATE_LIMIT_MAX_REQUESTS),
  };
}

function getAuthRateLimitConfig(configService: ConfigService) {
  return {
    windowMs: Number(configService.get('AUTH_RATE_LIMIT_WINDOW_MS') || DEFAULT_RATE_LIMIT_WINDOW_MS),
    maxRequests: Number(
      configService.get('AUTH_RATE_LIMIT_MAX_REQUESTS') || DEFAULT_AUTH_RATE_LIMIT_MAX_REQUESTS,
    ),
  };
}

function createStatusPageHtml(title: string, serviceName: string) {
  const displayName = formatServiceName(serviceName);

  return `<!DOCTYPE html>
<html>
<head>
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      height: 100vh;
      font-family: "Segoe UI", Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #d8eefe, #f3faff, #ffffff);
    }

    .card {
      width: 380px;
      padding: 40px;
      border-radius: 20px;
      backdrop-filter: blur(12px);
      background: rgba(255, 255, 255, 0.75);
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      text-align: center;
      border: 1px solid rgba(255,255,255,0.4);
    }

    .status-icon {
      font-size: 55px;
      margin-bottom: 10px;
      color: #28a745;
    }

    h1 {
      margin: 10px 0;
      font-size: 28px;
      color: #222;
    }

    h3, p {
      color: #444;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="status-icon">&#128640;</div>
    <h1>Welcome to ${escapeHtml(displayName)}</h1>
    <h3>Server Running</h3>
    <p>Uptime: ${process.uptime().toFixed(1)} seconds</p>
    <p>Time: ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>`;
}

function formatServiceName(serviceName: string) {
  return serviceName
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
