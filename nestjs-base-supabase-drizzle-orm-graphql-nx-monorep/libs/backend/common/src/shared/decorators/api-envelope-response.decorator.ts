import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import {
  ApiMessageResponseDto,
  ApiSuccessResponseDto,
} from '@/shared/dto/api-response.dto';

type ApiEnvelopeResponseOptions = {
  description: string;
  isArray?: boolean;
  status: number;
  type: Type<unknown>;
};

export function ApiEnvelopeResponse({
  description,
  isArray = false,
  status,
  type,
}: ApiEnvelopeResponseOptions) {
  const dataSchema = isArray
    ? {
        type: 'array',
        items: { $ref: getSchemaPath(type) },
      }
    : { $ref: getSchemaPath(type) };

  return applyDecorators(
    ApiExtraModels(ApiSuccessResponseDto, type),
    ApiResponse({
      description,
      status,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiSuccessResponseDto) },
          { properties: { data: dataSchema } },
        ],
      },
    }),
  );
}

export function ApiEnvelopeMessageResponse(
  status: number,
  description: string,
) {
  return ApiResponse({
    description,
    status,
    type: ApiMessageResponseDto,
  });
}
