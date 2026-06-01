import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createStructuredLogger, DEFAULT_API_PREFIX } from '@lib/core/common';
import axios from 'axios';

interface OpenApiDocument {
  openapi: string;
  info: Record<string, unknown>;
  servers?: Array<Record<string, unknown>>;
  tags?: Array<Record<string, unknown>>;
  paths?: Record<string, unknown>;
  components?: Record<string, Record<string, unknown>>;
  security?: Array<Record<string, unknown>>;
}

type ServiceDocConfig = {
  name: string;
  url: string;
  pathPrefixes: string[];
};

const COMPONENT_SECTIONS = [
  'schemas',
  'responses',
  'parameters',
  'examples',
  'requestBodies',
  'headers',
  'links',
  'callbacks',
] as const;

@Injectable()
export class SwaggerAggregateService {
  private readonly logger = createStructuredLogger(
    'api-gateway',
    SwaggerAggregateService.name,
  );

  constructor(private readonly configService: ConfigService) {}

  getServiceDocumentRoutes() {
    const apiPrefix =
      this.configService.get<string>('API_PREFIX') || DEFAULT_API_PREFIX;
    return [
      { name: 'Merged API', url: `/${apiPrefix}/openapi.json` },
      { name: 'API Gateway', url: `/${apiPrefix}/openapi/gateway.json` },
      { name: 'Auth Service', url: `/${apiPrefix}/openapi/auth.json` },
      { name: 'User Service', url: `/${apiPrefix}/openapi/users.json` },
    ];
  }

  async getMergedDocument(): Promise<OpenApiDocument> {
    const serviceDocs = await Promise.all(
      this.getServiceConfigs().map(async (serviceConfig) => {
        try {
          return {
            serviceConfig,
            document: await this.fetchDocument(serviceConfig),
          };
        } catch (error) {
          this.logger.error({
            event: 'swagger_aggregate_fetch_failed',
            service: serviceConfig.name,
            url: serviceConfig.url,
            error: error instanceof Error ? error.message : 'unknown_error',
          });
          return null;
        }
      }),
    );

    const availableServiceDocs = serviceDocs.filter(
      (entry): entry is { serviceConfig: ServiceDocConfig; document: OpenApiDocument } =>
        entry !== null,
    );

    const gatewayDoc =
      availableServiceDocs.find((entry) => entry.serviceConfig.name === 'gateway')
        ?.document ?? this.createFallbackGatewayDocument();

    const merged: OpenApiDocument = {
      openapi: gatewayDoc.openapi || '3.0.0',
      info: {
        title: 'FocusEd API',
        version:
          String(gatewayDoc.info?.['version'] ?? process.env['npm_package_version'] ?? '1.0.0'),
        description: 'Merged API documentation for all gateway-exposed services',
      },
      servers: [
        {
          url: `/${this.configService.get<string>('API_PREFIX') || DEFAULT_API_PREFIX}`,
        },
      ],
      tags: [],
      paths: {},
      components: {},
      security: gatewayDoc.security ?? [],
    };

    for (const { serviceConfig, document } of availableServiceDocs) {
      const normalizedDocument = this.normalizeDocument(serviceConfig.name, document);
      const filteredPaths = this.filterPaths(
        normalizedDocument.paths ?? {},
        serviceConfig.pathPrefixes,
      );

      this.logger.log({
        event: 'swagger_aggregate_service_paths',
        service: serviceConfig.name,
        totalPaths: Object.keys(normalizedDocument.paths ?? {}).length,
        mergedPaths: Object.keys(filteredPaths).length,
      });

      merged.paths = {
        ...(merged.paths ?? {}),
        ...filteredPaths,
      };

      merged.tags = this.mergeTags(merged.tags ?? [], normalizedDocument.tags ?? []);
      merged.components = this.mergeComponents(
        merged.components ?? {},
        normalizedDocument.components ?? {},
      );
      merged.security = this.mergeSecurity(
        merged.security ?? [],
        normalizedDocument.security ?? [],
      );
    }

    this.logger.log({
      event: 'swagger_aggregate_complete',
      servicesRequested: this.getServiceConfigs().length,
      servicesMerged: availableServiceDocs.length,
      totalPaths: Object.keys(merged.paths ?? {}).length,
      totalTags: (merged.tags ?? []).length,
    });

    return merged;
  }

  async getServiceDocument(serviceName: string): Promise<OpenApiDocument> {
    const serviceConfig = this.getServiceConfigs().find(
      (entry) => entry.name === serviceName,
    );

    if (!serviceConfig) {
      throw new Error(`Unknown swagger service: ${serviceName}`);
    }

    const document = await this.fetchDocument(serviceConfig);
    return this.normalizeDocument(serviceName, document);
  }

  private getServiceConfigs(): ServiceDocConfig[] {
    const authUrl = this.requireServiceUrl('AUTH_SERVICE_URL');
    const userUrl = this.requireServiceUrl('USER_SERVICE_URL');
    const gatewayPort = this.configService.get<string>('GATEWAY_PORT') || '3000';
    const apiPrefix =
      this.configService.get<string>('API_PREFIX') || DEFAULT_API_PREFIX;
    return [
      {
        name: 'gateway',
        url: `http://127.0.0.1:${gatewayPort}/docs-json`,
        pathPrefixes: [
          '/health',
          '/metrics',
          '/ready',
          `/${apiPrefix}/health`,
          `/${apiPrefix}/metrics`,
          `/${apiPrefix}/ready`,
        ],
      },
      {
        name: 'auth',
        url: `${authUrl}/docs-json`,
        pathPrefixes: ['/auth', `/${apiPrefix}/auth`],
      },
      {
        name: 'users',
        url: `${userUrl}/docs-json`,
        pathPrefixes: [
          '/users',
          '/profiles',
          `/${apiPrefix}/users`,
          `/${apiPrefix}/profiles`,
        ],
      },
    ];
  }

  private requireServiceUrl(key: string) {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`${key} is not configured`);
    }
    return value.replace(/\/+$/, '');
  }

  private async fetchDocument(serviceConfig: ServiceDocConfig): Promise<OpenApiDocument> {
    const response = await axios.get<OpenApiDocument>(serviceConfig.url, {
      timeout: 3000,
    });

    return response.data;
  }

  private filterPaths(
    paths: Record<string, unknown>,
    prefixes: string[],
  ): Record<string, unknown> {
    const normalizedPrefixes = Array.from(
      new Set(
        prefixes.map((prefix) =>
          prefix.startsWith('/') ? prefix : `/${prefix}`,
        ),
      ),
    );

    return Object.fromEntries(
      Object.entries(paths).filter(([path]) =>
        normalizedPrefixes.some(
          (prefix) => path === prefix || path.startsWith(`${prefix}/`),
        ),
      ),
    );
  }

  private mergeTags(
    existingTags: Array<Record<string, unknown>>,
    incomingTags: Array<Record<string, unknown>>,
  ) {
    const merged = [...existingTags];
    const knownTagNames = new Set(
      existingTags.map((tag) => String(tag['name'] ?? '')),
    );

    for (const tag of incomingTags) {
      const tagName = String(tag['name'] ?? '');
      if (!tagName || knownTagNames.has(tagName)) {
        continue;
      }
      knownTagNames.add(tagName);
      merged.push(tag);
    }

    return merged;
  }

  private mergeSecurity(
    existingSecurity: Array<Record<string, unknown>>,
    incomingSecurity: Array<Record<string, unknown>>,
  ) {
    const seen = new Set(existingSecurity.map((entry) => JSON.stringify(entry)));
    const merged = [...existingSecurity];

    for (const entry of incomingSecurity) {
      const serialized = JSON.stringify(entry);
      if (seen.has(serialized)) {
        continue;
      }
      seen.add(serialized);
      merged.push(entry);
    }

    return merged;
  }

  private mergeComponents(
    existingComponents: Record<string, Record<string, unknown>>,
    incomingComponents: Record<string, Record<string, unknown>>,
  ) {
    const merged = { ...existingComponents };

    for (const [section, values] of Object.entries(incomingComponents)) {
      if (!merged[section]) {
        merged[section] = {};
      }

      merged[section] = {
        ...merged[section],
        ...values,
      };
    }

    return merged;
  }

  private normalizeDocument(serviceName: string, document: OpenApiDocument): OpenApiDocument {
    const clonedDocument = JSON.parse(JSON.stringify(document)) as OpenApiDocument;
    this.normalizePathsForGateway(clonedDocument);
    this.dedupePathParameters(clonedDocument);
    const refMappings = this.prefixComponentKeys(serviceName, clonedDocument);

    if (refMappings.length > 0) {
      this.replaceRefs(clonedDocument, refMappings);
    }

    this.mergeSecuritySchemesWithoutPrefix(document, clonedDocument);

    return clonedDocument;
  }

  private dedupePathParameters(document: OpenApiDocument) {
    const paths = document.paths ?? {};
    const sharedParameters = (document.components?.['parameters'] ?? {}) as Record<
      string,
      Record<string, unknown>
    >;

    for (const pathItem of Object.values(paths)) {
      if (!pathItem || typeof pathItem !== 'object') {
        continue;
      }

      const pathRecord = pathItem as Record<string, unknown>;
      const pathLevelParameters = Array.isArray(pathRecord['parameters'])
        ? this.dedupeParameters(
            pathRecord['parameters'] as Array<Record<string, unknown>>,
            sharedParameters,
          )
        : [];

      const operationParameterKeys = new Set<string>();

      for (const [method, operation] of Object.entries(pathRecord)) {
        if (method === 'parameters' || !operation || typeof operation !== 'object') {
          continue;
        }

        const operationRecord = operation as Record<string, unknown>;
        if (Array.isArray(operationRecord['parameters'])) {
          const dedupedOperationParameters = this.dedupeParameters(
            operationRecord['parameters'] as Array<Record<string, unknown>>,
            sharedParameters,
          );
          operationRecord['parameters'] = dedupedOperationParameters;

          for (const parameter of dedupedOperationParameters) {
            operationParameterKeys.add(
              this.getParameterKey(parameter, sharedParameters),
            );
          }
        }
      }

      if (pathLevelParameters.length > 0) {
        const filteredPathParameters = pathLevelParameters.filter(
          (parameter) =>
            !operationParameterKeys.has(
              this.getParameterKey(parameter, sharedParameters),
            ),
        );

        if (filteredPathParameters.length > 0) {
          pathRecord['parameters'] = filteredPathParameters;
        } else {
          delete pathRecord['parameters'];
        }
      }
    }
  }

  private dedupeParameters(
    parameters: Array<Record<string, unknown>>,
    sharedParameters: Record<string, Record<string, unknown>>,
  ) {
    const seen = new Set<string>();
    const deduped: Array<Record<string, unknown>> = [];

    for (const parameter of parameters) {
      const key = this.getParameterKey(parameter, sharedParameters);

      if (!key || seen.has(key)) {
        continue;
      }

      seen.add(key);
      deduped.push(parameter);
    }

    return deduped;
  }

  private getParameterKey(
    parameter: Record<string, unknown>,
    sharedParameters: Record<string, Record<string, unknown>>,
  ) {
    const reference = String(parameter['$ref'] ?? '');
    if (reference) {
      const resolvedReference = this.resolveParameterReference(
        reference,
        sharedParameters,
      );

      if (resolvedReference) {
        const resolvedName = String(resolvedReference['name'] ?? '');
        const resolvedLocation = String(resolvedReference['in'] ?? '');
        return `${resolvedLocation}:${resolvedName}`;
      }

      return reference;
    }

    const name = String(parameter['name'] ?? '');
    const location = String(parameter['in'] ?? '');
    return `${location}:${name}`;
  }

  private resolveParameterReference(
    reference: string,
    sharedParameters: Record<string, Record<string, unknown>>,
  ) {
    const match = reference.match(/^#\/components\/parameters\/(.+)$/);
    if (!match) {
      return null;
    }

    return sharedParameters[match[1] ?? ''] ?? null;
  }

  private normalizePathsForGateway(document: OpenApiDocument) {
    const apiPrefix =
      this.configService.get<string>('API_PREFIX') || DEFAULT_API_PREFIX;
    const prefix = `/${apiPrefix}`;
    const originalPaths = document.paths ?? {};
    const normalizedPaths: Record<string, unknown> = {};

    for (const [path, value] of Object.entries(originalPaths)) {
      if (path === prefix) {
        normalizedPaths['/'] = value;
        continue;
      }

      if (path.startsWith(`${prefix}/`)) {
        normalizedPaths[path.slice(prefix.length)] = value;
        continue;
      }

      normalizedPaths[path] = value;
    }

    document.paths = normalizedPaths;
    document.servers = [{ url: prefix }];
  }

  private prefixComponentKeys(serviceName: string, document: OpenApiDocument) {
    const refMappings: Array<{ from: string; to: string }> = [];
    const components = document.components ?? {};

    for (const section of COMPONENT_SECTIONS) {
      const values = components[section];
      if (!values) {
        continue;
      }

      const renamedValues: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(values)) {
        const nextKey = `${serviceName}_${key}`;
        renamedValues[nextKey] = value;
        refMappings.push({
          from: `#/components/${section}/${key}`,
          to: `#/components/${section}/${nextKey}`,
        });
      }
      components[section] = renamedValues;
    }

    return refMappings;
  }

  private mergeSecuritySchemesWithoutPrefix(
    originalDocument: OpenApiDocument,
    normalizedDocument: OpenApiDocument,
  ) {
    const originalSchemes = originalDocument.components?.['securitySchemes'];
    if (!originalSchemes) {
      return;
    }

    normalizedDocument.components = normalizedDocument.components ?? {};
    normalizedDocument.components['securitySchemes'] = {
      ...(normalizedDocument.components['securitySchemes'] ?? {}),
      ...originalSchemes,
    };
  }

  private replaceRefs(
    value: unknown,
    mappings: Array<{ from: string; to: string }>,
  ) {
    if (Array.isArray(value)) {
      value.forEach((item) => this.replaceRefs(item, mappings));
      return;
    }

    if (!value || typeof value !== 'object') {
      return;
    }

    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      if (key === '$ref' && typeof nestedValue === 'string') {
        const nextRef =
          mappings.find((mapping) => mapping.from === nestedValue)?.to ?? nestedValue;
        (value as Record<string, unknown>)[key] = nextRef;
        continue;
      }

      this.replaceRefs(nestedValue, mappings);
    }
  }

  private createFallbackGatewayDocument(): OpenApiDocument {
    return {
      openapi: '3.0.0',
      info: {
        title: 'FocusEd API',
        version: process.env['npm_package_version'] ?? '1.0.0',
      },
      tags: [],
      paths: {},
      components: {},
      security: [],
    };
  }
}
