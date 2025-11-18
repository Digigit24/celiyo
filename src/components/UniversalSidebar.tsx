import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Mail,
  Stethoscope,
  Database,
  ChevronDown,
  ChevronRight,
  Users,
  Calendar,
  ClipboardList,
  X,
  PanelLeftClose,
  PanelLeft,
  ClipboardPlus,
  FileText,
  Activity,
  Package,
  Receipt,
  Microscope,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  path?: string;
  badge?: number;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    id: "inbox",
    label: "Inbox",
    icon: Mail,
    path: "/inbox",
    badge: 3,
  },
  {
    id: "opd",
    label: "OPD",
    icon: Stethoscope,
    children: [
      {
        id: "opd-visits",
        label: "Visits",
        icon: ClipboardPlus,
        path: "/opd/visits",
      },
      {
        id: "opd-bills",
        label: "OPD Bills",
        icon: FileText,
        path: "/opd/bills",
      },
      {
        id: "clinical-notes",
        label: "Clinical Notes",
        icon: ClipboardList,
        path: "/opd/clinical-notes",
      },
      {
        id: "visit-findings",
        label: "Visit Findings",
        icon: Activity,
        path: "/opd/findings",
      },
      {
        id: "procedure-masters",
        label: "Procedures",
        icon: Microscope,
        path: "/opd/procedures",
      },
      {
        id: "procedure-packages",
        label: "Packages",
        icon: Package,
        path: "/opd/packages",
      },
      {
        id: "procedure-bills",
        label: "Procedure Bills",
        icon: Receipt,
        path: "/opd/procedure-bills",
      },
    ],
  },

  {
    id: "Services",
    label: "Services",
    icon: Package,
    children: [

      // {
      //   id: "service-categories",
      //   label: "Service Categories",
      //   icon: ClipboardList,
      //   path: "/services/categories",
      // },
      { 
        id: "diagnostic-tests",
        label: "Diagnostic Tests",
        icon: Microscope,
        path: "/services/diagnostic-tests",
      },
      {
        id: "nursing-packages",
        label: "Nursing Packages",
        icon: Receipt,
        path: "/services/nursing-packages",
      },
      {
        id: "home-healthcare",
        label: "Home Healthcare",
        icon: Stethoscope,
        path: "/services/home-healthcare",
      },
    ],
  },

  {
    id: "pharmacy",
    label: "Pharmacy",
    icon: Activity,
    path: "/pharmacy",
  },

  {
  id: 'payments',
  label: 'Payments',
  icon: CreditCard,
  path: '/payments',
},

  {
    id: "tenants",
    label: "Tenants",
    icon: Database,
    children: [
      {
        id: "tenants-list",
        label: "Tenant List",
        icon: Users,
        path: "/tenants",
      },
      {
        id: "tenant-dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/tenants/dashboard",
      },
    ],
  },

  {
    id: "masters",
    label: "Masters",
    icon: Database,
    children: [
      {
        id: "doctors",
        label: "Doctors",
        icon: Stethoscope,
        path: "/masters/doctors",
      },
      {
        id: "specialties",
        label: "Specialties",
        icon: ClipboardList,
        path: "/masters/specialties",
      },
      {
        id: "patients",
        label: "Patients",
        icon: Users,
        path: "/masters/patients",
      },
      {
        id: "appointments",
        label: "Appointments",
        icon: Calendar,
        path: "/masters/appointments",
      },
    ],
  },



  
];

interface UniversalSidebarProps {
  collapsed?: boolean;
  onCollapse?: () => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export function UniversalSidebar({
  collapsed = false,
  onCollapse,
  mobileOpen = false,
  setMobileOpen,
}: UniversalSidebarProps) {
  const location = useLocation();
  const [openSections, setOpenSections] = useState<string[]>(["masters", "opd"]);

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  const isParentActive = (children?: MenuItem[]) => {
    if (!children) return false;
    return children.some(
      (child) => child.path && location.pathname === child.path
    );
  };

  const closeMobileSidebar = () => {
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-background border-r border-border">
      {/* Header with Logo and Collapse Button */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center">
              <img src="https://pulsehospitalpcmc.com/assets/logo-DRaM1pzk.png" alt="" />
            </div>
            <span className="font-bold text-lg">HMS</span>
          </div>
        )}
        {collapsed && (
          <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
            <img src="https://pulsehospitalpcmc.com/assets/logo-DRaM1pzk.png" alt="" />
          </div>
        )}

        {/* Collapse Button - Top Right */}
        {onCollapse && !mobileOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCollapse}
            className="h-8 w-8 hover:bg-muted"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* Close Button for Mobile */}
        {mobileOpen && setMobileOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="h-8 w-8 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Separator />

      {/* Navigation Menu */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            if (item.children) {
              // Menu item with children (collapsible)
              const isOpen = openSections.includes(item.id);
              const hasActiveChild = isParentActive(item.children);

              return (
                <Collapsible
                  key={item.id}
                  open={isOpen}
                  onOpenChange={() => toggleSection(item.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 h-10 px-3 font-normal hover:bg-muted",
                        hasActiveChild && "bg-muted font-medium",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4 shrink-0 transition-transform" />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0 transition-transform" />
                          )}
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>

                  {!collapsed && (
                    <CollapsibleContent className="pl-4 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          to={child.path || "#"}
                          onClick={closeMobileSidebar}
                        >
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start gap-3 h-9 px-3 font-normal hover:bg-muted",
                              isActive(child.path) &&
                                "bg-muted font-medium text-foreground"
                            )}
                          >
                            <child.icon className="h-4 w-4 shrink-0" />
                            <span className="text-sm">{child.label}</span>
                          </Button>
                        </Link>
                      ))}
                    </CollapsibleContent>
                  )}
                </Collapsible>
              );
            }

            // Regular menu item
            return (
              <Link
                key={item.id}
                to={item.path || "#"}
                onClick={closeMobileSidebar}
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-10 px-3 font-normal hover:bg-muted",
                    isActive(item.path) &&
                      "bg-muted font-medium text-foreground",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="bg-foreground text-background text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center font-medium">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );

  // Mobile Sidebar (Drawer/Sheet)
  if (mobileOpen !== undefined && setMobileOpen !== undefined) {
    return (
      <>
        {/* Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <aside
          className={cn(
            "fixed top-0 left-0 h-full w-72 z-50 transition-transform duration-300 lg:hidden",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <SidebarContent />
        </aside>
      </>
    );
  }

  // Desktop Sidebar - FIXED POSITION
  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-screen transition-all duration-300 hidden lg:block z-30",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <SidebarContent />
    </aside>
  );
}