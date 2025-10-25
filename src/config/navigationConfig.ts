// src/config/navigationConfig.ts
import { ROUTE_PATHS, NAVIGATION_GROUPS } from './routePaths';
import {
  LayoutDashboard,
  Inbox,
  Stethoscope,
  FileText,
  Receipt,
  ClipboardList,
  Activity,
  Package,
  DollarSign,
  Users,
  UserCog,
  User,
  Calendar,
  Database,
} from 'lucide-react';

export interface NavigationItem {
  title: string;
  href: string;
  icon: any;
  badge?: string | number;
  children?: NavigationItem[];
  group?: string;
}

export const navigationConfig: NavigationItem[] = [
  // Main Navigation
  {
    title: 'Dashboard',
    href: ROUTE_PATHS.DASHBOARD,
    icon: LayoutDashboard,
    group: NAVIGATION_GROUPS.MAIN,
  },
  {
    title: 'Inbox',
    href: ROUTE_PATHS.INBOX,
    icon: Inbox,
    group: NAVIGATION_GROUPS.MAIN,
  },

  // OPD Section
  {
    title: 'OPD',
    href: ROUTE_PATHS.OPD,
    icon: Stethoscope,
    group: NAVIGATION_GROUPS.OPD,
    children: [
      {
        title: 'OPD Visits',
        href: ROUTE_PATHS.OPD_VISITS,
        icon: FileText,
      },
      {
        title: 'OPD Bills',
        href: ROUTE_PATHS.OPD_BILLS,
        icon: Receipt,
      },
      {
        title: 'Clinical Notes',
        href: ROUTE_PATHS.OPD_CLINICAL_NOTES,
        icon: ClipboardList,
      },
      {
        title: 'Visit Findings',
        href: ROUTE_PATHS.OPD_FINDINGS,
        icon: Activity,
      },
      {
        title: 'Procedures',
        href: ROUTE_PATHS.OPD_PROCEDURES,
        icon: Stethoscope,
      },
      {
        title: 'Procedure Packages',
        href: ROUTE_PATHS.OPD_PACKAGES,
        icon: Package,
      },
      {
        title: 'Procedure Bills',
        href: ROUTE_PATHS.OPD_PROCEDURE_BILLS,
        icon: DollarSign,
      },
    ],
  },

  // Masters Section
  {
    title: 'Masters',
    href: '#',
    icon: Database,
    group: NAVIGATION_GROUPS.MASTERS,
    children: [
      {
        title: 'Doctors',
        href: ROUTE_PATHS.MASTERS_DOCTORS,
        icon: UserCog,
      },
      {
        title: 'Specialties',
        href: ROUTE_PATHS.MASTERS_SPECIALTIES,
        icon: Activity,
      },
      {
        title: 'Patients',
        href: ROUTE_PATHS.MASTERS_PATIENTS,
        icon: Users,
      },
      {
        title: 'Appointments',
        href: ROUTE_PATHS.MASTERS_APPOINTMENTS,
        icon: Calendar,
      },
    ],
  },
];

// Helper function to get navigation by group
export const getNavigationByGroup = (group: string): NavigationItem[] => {
  return navigationConfig.filter((item) => item.group === group);
};

// Helper function to flatten navigation items (useful for search)
export const flattenNavigation = (items: NavigationItem[]): NavigationItem[] => {
  return items.reduce((acc: NavigationItem[], item) => {
    acc.push(item);
    if (item.children) {
      acc.push(...flattenNavigation(item.children));
    }
    return acc;
  }, []);
};

// Helper function to find navigation item by path
export const findNavigationItemByPath = (
  path: string,
  items: NavigationItem[] = navigationConfig
): NavigationItem | undefined => {
  for (const item of items) {
    if (item.href === path) {
      return item;
    }
    if (item.children) {
      const found = findNavigationItemByPath(path, item.children);
      if (found) return found;
    }
  }
  return undefined;
};