import { Type, applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiProperty,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

export class ApiSuccessResponseDto<TData = unknown> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ additionalProperties: true, type: 'object' })
  data: TData;

  @ApiProperty({ example: 'Operation completed successfully' })
  message: string;
}

export class ApiMessageResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Operation completed successfully' })
  message: string;
}

export class ApiErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({
    oneOf: [
      { type: 'string', example: 'Validation failed' },
      {
        type: 'array',
        items: { type: 'string' },
        example: ['email must be an email'],
      },
    ],
  })
  message: string | string[];

  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    example: 'b4f9c192-76e2-41e5-9f78-8ad52f046bcc',
    required: false,
  })
  requestId?: string;

  @ApiProperty({
    example: '2026-05-21T10:24:31.000Z',
    format: 'date-time',
  })
  timestamp: string;
}

type ApiEnvelopeResponseOptions = {
  description: string;
  isArray?: boolean;
  message: string;
  status: number;
  type?: Type<unknown>;
};

export const ApiEnvelopeResponse = ({
  description,
  isArray = false,
  message,
  status,
  type,
}: ApiEnvelopeResponseOptions) => {
  const responseModel = type ? ApiSuccessResponseDto : ApiMessageResponseDto;
  const models = type ? [responseModel, type] : [responseModel];

  return applyDecorators(
    ApiExtraModels(...models),
    ApiResponse({
      description,
      status,
      schema: {
        allOf: [
          { $ref: getSchemaPath(responseModel) },
          {
            properties: {
              ...(type
                ? {
                    data: isArray
                      ? {
                          type: 'array',
                          items: { $ref: getSchemaPath(type) },
                        }
                      : { $ref: getSchemaPath(type) },
                  }
                : {}),
              message: { example: message },
            },
          },
        ],
      },
    }),
  );
};
