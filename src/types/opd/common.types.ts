// src/types/opd/common.types.ts

/**
 * Common API Response Wrappers
 * Used across all OPD API endpoints
 */

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Generic query parameters for list endpoints
 */
export interface BaseListParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  [key: string]: string | number | boolean | undefined;
}