import { IsOptional, IsInt, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DASHBOARD_QUERY_DEFAULTS } from '../../../shared/constants/dashboard-query.types';

export class DashboardQueryDto {
  @ApiPropertyOptional({ description: 'Start date for filtering (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for filtering (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Month (1-12)',
    minimum: DASHBOARD_QUERY_DEFAULTS.MIN_MONTH,
    maximum: DASHBOARD_QUERY_DEFAULTS.MAX_MONTH,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(DASHBOARD_QUERY_DEFAULTS.MIN_MONTH)
  @Max(DASHBOARD_QUERY_DEFAULTS.MAX_MONTH)
  month?: number;

  @ApiPropertyOptional({
    description: 'Year (e.g., 2026)',
    minimum: DASHBOARD_QUERY_DEFAULTS.MIN_YEAR,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(DASHBOARD_QUERY_DEFAULTS.MIN_YEAR)
  year?: number;

  @ApiPropertyOptional({
    description: 'Limit results',
    minimum: 1,
    default: DASHBOARD_QUERY_DEFAULTS.LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = DASHBOARD_QUERY_DEFAULTS.LIMIT;
}
