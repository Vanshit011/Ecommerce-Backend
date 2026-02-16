export interface DashboardQueryParams {
  startDate?: string;
  endDate?: string;
  month?: number;
  year?: number;
  limit?: number;
}

export const DASHBOARD_QUERY_DEFAULTS = {
  LIMIT: 10,
  MIN_MONTH: 1,
  MAX_MONTH: 12,
  MIN_YEAR: 2000,
} as const;
