// src/hooks/opd/common.hooks.ts

/**
 * Common SWR configuration options used across OPD hooks
 */

export const DEFAULT_SWR_OPTIONS = {
  revalidateOnFocus: false,
  keepPreviousData: true,
} as const;

export const REALTIME_SWR_OPTIONS = {
  revalidateOnFocus: false,
  refreshInterval: 30000, // 30 seconds
} as const;

export const QUEUE_SWR_OPTIONS = {
  revalidateOnFocus: false,
  refreshInterval: 10000, // 10 seconds
} as const;

/**
 * Helper function to build query strings from params
 * (You may already have this in your lib/apiConfig)
 */
export function buildQueryString(params?: Record<string, any>): string {
  if (!params) return '';
  
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}