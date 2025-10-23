import { User, LogOut, Moon, Sun, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/theme-provider";
import { Separator } from "@/components/ui/separator";

// Map routes to titles
const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/inbox": "Inbox",
  "/opd": "OPD",
  "/masters/doctors": "Doctors",
  "/masters/specialties": "Specialties",
  "/masters/patients": "Patients",
  "/masters/appointments": "Appointments",
};

interface UniversalHeaderProps {
  onMobileMenuClick?: () => void;
  sidebarCollapsed?: boolean;
}

export const UniversalHeader = ({
  onMobileMenuClick,
  sidebarCollapsed = false,
}: UniversalHeaderProps) => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();

  const pageTitle = routeTitles[location.pathname] || "HMS";

  const handleLogout = () => {
    logout();
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-16 border-b border-border bg-background z-20 transition-all duration-300",
        "lg:left-64",
        sidebarCollapsed && "lg:left-16"
      )}
    >
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* Left Side - Mobile Menu + Title */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          {onMobileMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileMenuClick}
              className="lg:hidden h-9 w-9"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <h1 className="text-xl font-semibold">{pageTitle}</h1>
        </div>

        {/* Right Side - Theme Toggle and Profile */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 hover:bg-muted"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-9 px-2 hover:bg-muted"
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border">
                  <User className="h-4 w-4" />
                </div>
                <span className="hidden md:inline text-sm font-medium">
                  {user?.first_name || "User"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

// Import cn helper
import { cn } from "@/lib/utils";