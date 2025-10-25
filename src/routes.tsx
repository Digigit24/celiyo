// src/routes.tsx
import { RouteObject } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy load components for better code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Inbox = lazy(() => import('./pages/Inbox'));
const OPD = lazy(() => import('./pages/OPD'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Masters
const DoctorsListPage = lazy(() => import('./pages/masters/DoctorsListPage'));
const SpecialtiesListPage = lazy(() => import('./pages/masters/SpecialtyListPage'));
const PatientsListPage = lazy(() => import('./pages/masters/Patientslistpage'));
const AppointmentsListPage = lazy(() => import('./pages/masters/AppointmentsListPage'));

// OPD
const OpdVisitsListPage = lazy(() => import('./pages/opd/OpdVisitsListPage'));
const OpdBillsListPage = lazy(() => import('./pages/opd/OpdBillsListPage'));
const ClinicalNotesListPage = lazy(() => import('./pages/opd/ClinicalNotesListPage'));
const VisitFindingsListPage = lazy(() => import('./pages/opd/VisitFindingsListPage'));
const ProcedureMastersListPage = lazy(() => import('./pages/opd/ProcedureMastersListPage'));
const ProcedurePackagesListPage = lazy(() => import('./pages/opd/ProcedurePackagesListPage'));
const ProcedureBillsListPage = lazy(() => import('./pages/opd/ProcedureBillsListPage'));
const Consultation = lazy(() => import('./pages/Consultation'));
const OPDBilling = lazy(() => import('./pages/OPDBilling'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Wrapper for lazy loaded components
const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

// Route configuration
export interface AppRoute {
  path: string;
  element?: React.ReactNode;
  children?: AppRoute[];
  requiresAuth?: boolean;
  title?: string;
  icon?: string;
}

// Public routes (no authentication required)
export const publicRoutes: AppRoute[] = [
  {
    path: '/login',
    element: (
      <LazyWrapper>
        <Login />
      </LazyWrapper>
    ),
    title: 'Login',
  },
];

// Protected routes (authentication required)
export const protectedRoutes: AppRoute[] = [
  {
    path: '/',
    element: (
      <LazyWrapper>
        <Dashboard />
      </LazyWrapper>
    ),
    title: 'Dashboard',
    icon: 'LayoutDashboard',
  },
  {
    path: '/inbox',
    element: (
      <LazyWrapper>
        <Inbox />
      </LazyWrapper>
    ),
    title: 'Inbox',
    icon: 'Inbox',
  },
  {
    path: '/opd',
    element: (
      <LazyWrapper>
        <OPD />
      </LazyWrapper>
    ),
    title: 'OPD',
    icon: 'Stethoscope',
    children: [
      {
        path: '/opd/visits',
        element: (
          <LazyWrapper>
            <OpdVisitsListPage />
          </LazyWrapper>
        ),
        title: 'OPD Visits',
      },
      {
        path: '/opd/bills',
        element: (
          <LazyWrapper>
            <OpdBillsListPage />
          </LazyWrapper>
        ),
        title: 'OPD Bills',
      },
      {
        path: '/opd/clinical-notes',
        element: (
          <LazyWrapper>
            <ClinicalNotesListPage />
          </LazyWrapper>
        ),
        title: 'Clinical Notes',
      },
      {
        path: '/opd/findings',
        element: (
          <LazyWrapper>
            <VisitFindingsListPage />
          </LazyWrapper>
        ),
        title: 'Visit Findings',
      },
      {
        path: '/opd/procedures',
        element: (
          <LazyWrapper>
            <ProcedureMastersListPage />
          </LazyWrapper>
        ),
        title: 'Procedures',
      },
      {
        path: '/opd/packages',
        element: (
          <LazyWrapper>
            <ProcedurePackagesListPage />
          </LazyWrapper>
        ),
        title: 'Procedure Packages',
      },
      {
        path: '/opd/procedure-bills',
        element: (
          <LazyWrapper>
            <ProcedureBillsListPage />
          </LazyWrapper>
        ),
        title: 'Procedure Bills',
      },
    ],
  },
  {
    path: '/consultation/:visitId',
    element: (
      <LazyWrapper>
        <Consultation />
      </LazyWrapper>
    ),
    title: 'Consultation',
  },
  {
    path: '/opdbilling/:visitId',
    element: (
      <LazyWrapper>
        <OPDBilling />
      </LazyWrapper>
    ),
    title: 'OPD Billing',
  },
  {
    path: '/masters',
    title: 'Masters',
    icon: 'Database',
    children: [
      {
        path: '/masters/doctors',
        element: (
          <LazyWrapper>
            <DoctorsListPage />
          </LazyWrapper>
        ),
        title: 'Doctors',
      },
      {
        path: '/masters/specialties',
        element: (
          <LazyWrapper>
            <SpecialtiesListPage />
          </LazyWrapper>
        ),
        title: 'Specialties',
      },
      {
        path: '/masters/patients',
        element: (
          <LazyWrapper>
            <PatientsListPage />
          </LazyWrapper>
        ),
        title: 'Patients',
      },
      {
        path: '/masters/appointments',
        element: (
          <LazyWrapper>
            <AppointmentsListPage />
          </LazyWrapper>
        ),
        title: 'Appointments',
      },
    ],
  },
];

// 404 route
export const notFoundRoute: AppRoute = {
  path: '*',
  element: (
    <LazyWrapper>
      <NotFound />
    </LazyWrapper>
  ),
  title: 'Not Found',
};

// Helper function to flatten routes for React Router
export const flattenRoutes = (routes: AppRoute[]): RouteObject[] => {
  const flattened: RouteObject[] = [];

  routes.forEach((route) => {
    flattened.push({
      path: route.path,
      element: route.element,
    });

    if (route.children) {
      flattened.push(...flattenRoutes(route.children));
    }
  });

  return flattened;
};

// Get all protected route paths for navigation
export const getProtectedRoutePaths = (): string[] => {
  const paths: string[] = [];

  const extractPaths = (routes: AppRoute[]) => {
    routes.forEach((route) => {
      if (route.path && !route.path.includes(':')) {
        paths.push(route.path);
      }
      if (route.children) {
        extractPaths(route.children);
      }
    });
  };

  extractPaths(protectedRoutes);
  return paths;
};