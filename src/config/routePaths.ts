// src/config/routePaths.ts

/**
 * Centralized route paths for the application
 * Use these constants instead of hardcoding paths throughout the app
 */

export const ROUTE_PATHS = {
  // Auth
  LOGIN: '/login',

  // Main
  DASHBOARD: '/',
  INBOX: '/inbox',
  OPD: '/opd',

  // OPD
  OPD_VISITS: '/opd/visits',
  OPD_BILLS: '/opd/bills',
  OPD_CLINICAL_NOTES: '/opd/clinical-notes',
  OPD_FINDINGS: '/opd/findings',
  OPD_PROCEDURES: '/opd/procedures',
  OPD_PACKAGES: '/opd/packages',
  OPD_PROCEDURE_BILLS: '/opd/procedure-bills',

  // Visit-scoped workflows
  CONSULTATION: (visitId: string) => `/consultation/${visitId}`,
  OPD_BILLING: (visitId: string) => `/opdbilling/${visitId}`,

  // Masters
  MASTERS_DOCTORS: '/masters/doctors',
  MASTERS_SPECIALTIES: '/masters/specialties',
  MASTERS_PATIENTS: '/masters/patients',
  MASTERS_APPOINTMENTS: '/masters/appointments',

  // System
  NOT_FOUND: '*',
} as const;

// Type helper for route paths
export type RoutePath = typeof ROUTE_PATHS[keyof typeof ROUTE_PATHS];

// Helper function to check if a path matches a route
export const isActiveRoute = (currentPath: string, routePath: string): boolean => {
  if (routePath === '/') {
    return currentPath === '/';
  }
  return currentPath.startsWith(routePath);
};

// Navigation groups for sidebar
export const NAVIGATION_GROUPS = {
  MAIN: 'Main',
  OPD: 'OPD',
  MASTERS: 'Masters',
} as const;