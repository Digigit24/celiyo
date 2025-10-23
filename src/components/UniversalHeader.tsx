import { Settings, User, LogOut, ChevronDown } from "lucide-react";
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

// Map routes to titles
const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/inbox": "Inbox",
  "/opd": "OPD",
};

export const UniversalHeader = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const pageTitle = routeTitles[location.pathname] || "Chat App";

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="h-16 border-b border-black/10 bg-white px-4 md:px-6 flex items-center justify-between">
      {/* Left Side - Logo and Title */}
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-black w-10 h-10 flex items-center justify-center text-white font-bold text-lg">
          C
        </div>
        <h1 className="text-xl font-semibold text-gray-800">{pageTitle}</h1>
      </div>

      {/* Right Side - Settings and Profile */}
      <div className="flex items-center gap-2">
        {/* Settings Button */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Settings"
        >
          <Settings size={20} className="text-black/60" />
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 rounded-full px-3"
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                
                  <User size={18} className="text-gray-600" />
                
              </div>
              <span className="hidden md:inline text-sm">
                {user?.first_name || 'User'}
              </span>
              <ChevronDown size={16} className="text-black/60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};