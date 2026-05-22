import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status: string;

  @ApiProperty({
    example: '2026-05-21T10:24:31.000Z',
    format: 'date-time',
  })
  timestamp: string;

  @ApiProperty({ example: 214.42 })
  uptime: number;
}

export class ReadinessResponseDto {
  @ApiProperty({ example: 'ready' })
  status: string;

  @ApiProperty({
    example: '2026-05-21T10:24:31.000Z',
    format: 'date-time',
  })
  timestamp: string;
}
