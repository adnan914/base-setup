import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDataDto {
  @ApiProperty({ example: 'ok' })
  status: string;

  @ApiProperty({
    example: '2026-05-22T12:00:00.000Z',
    format: 'date-time',
  })
  timestamp: string;

  @ApiProperty({ example: 321.54 })
  uptime: number;
}

export class ReadinessResponseDataDto {
  @ApiProperty({ example: 'ready' })
  status: string;

  @ApiProperty({
    example: '2026-05-22T12:00:00.000Z',
    format: 'date-time',
  })
  timestamp: string;
}
