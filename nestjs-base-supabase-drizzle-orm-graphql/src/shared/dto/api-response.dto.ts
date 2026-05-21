import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiSuccessResponseDto<TData = unknown> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Operation completed successfully' })
  message: string;

  @ApiPropertyOptional({ description: 'Endpoint response payload' })
  data?: TData;
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
    description: 'Request identifier when one is available',
    example: '2adb44a4-b355-4ab6-87a9-619e804b2ec6',
    nullable: true,
  })
  requestId: string | null;

  @ApiProperty({
    example: '2026-05-22T12:00:00.000Z',
    format: 'date-time',
  })
  timestamp: string;
}
