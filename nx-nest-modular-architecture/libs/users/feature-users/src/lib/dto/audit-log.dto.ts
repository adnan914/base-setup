import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { SortOrder } from './admin-management.dto';

export enum AuditLogSortField {
  SERVICE_NAME = 'service_name',
  MODULE = 'module',
  ENTITY_TYPE = 'entity_type',
  ACTION = 'action',
  CREATED_AT = 'created_at',
}

export class AuditLogListQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ enum: AuditLogSortField })
  @IsOptional()
  @IsEnum(AuditLogSortField)
  sortBy?: AuditLogSortField;

  @ApiPropertyOptional({ enum: SortOrder })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  module?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  action?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  entityType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  serviceName?: string;
}
