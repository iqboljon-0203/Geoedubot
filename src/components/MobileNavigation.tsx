import { NavLink } from "react-router-dom";
import { Home, List, Calendar, Settings, User, FileText } from "lucide-react";
import { useTelegramAuth } from "@/contexts/TelegramAuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/authStore";

interface MobileNavigationProps {
  role: "teacher" | "student";
}

const MobileNavigation = ({ role }: MobileNavigationProps) => {
  const { signOut } = useTelegramAuth();
  const { name } = useAuthStore();
  
  const basePath =
    role === "teacher" ? "/teacher-dashboard" : "/student-dashboard";
  
  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 shadow-lg">
      <div className="flex justify-around items-center h-16">
        <NavLink 
          to={basePath} 
          className={({ isActive }) =>
            `flex flex-col items-center justify-center text-xs p-2 rounded-md ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`
          }
          end
        >
          <Home className="h-5 w-5 mb-1" />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink 
          to={`${basePath}/tasks`}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center text-xs p-2 rounded-md ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`
          }
        >
          <List className="h-5 w-5 mb-1" />
          <span>Topshiriqlar</span>
        </NavLink>

        {role === "student" && (
          <NavLink
            to={`${basePath}/groups`}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center text-xs p-2 rounded-md ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <List className="h-5 w-5 mb-1" />
            <span>Guruhlar</span>
          </NavLink>
        )}

        {role === "teacher" && (
          <NavLink
            to={`${basePath}/groups`}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center text-xs p-2 rounded-md ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <List className="h-5 w-5 mb-1" />
            <span>Guruhlar</span>
          </NavLink>
        )}

        {role === "teacher" && (
          <NavLink
            to={`${basePath}/answers`}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center text-xs p-2 rounded-md ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <FileText className="h-5 w-5 mb-1" />
            <span>Javoblar</span>
          </NavLink>
        )}

        {role === "student" && (
          <NavLink
            to={`${basePath}/grades`}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center text-xs p-2 rounded-md ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <FileText className="h-5 w-5 mb-1" />
            <span>Baholar</span>
          </NavLink>
        )}
        
        <NavLink 
          to={`${basePath}/calendar`} 
          className={({ isActive }) =>
            `flex flex-col items-center justify-center text-xs p-2 rounded-md ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`
          }
        >
          <Calendar className="h-5 w-5 mb-1" />
          <span>Kalendar</span>
        </NavLink>
        
        <DropdownMenu>
          <DropdownMenuTrigger className="flex flex-col items-center justify-center text-xs p-2 rounded-md focus:outline-none">
            <User className="h-5 w-5 mb-1 text-muted-foreground" />
            <span className="text-muted-foreground">Profil</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mb-4">
            <DropdownMenuLabel>Mening hisobim</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <NavLink to="/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <NavLink to="/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Sozlamalar</span>
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="text-red-500 focus:text-red-500 cursor-pointer"
            >
              <span>Chiqish</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default MobileNavigation;
