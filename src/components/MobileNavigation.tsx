import { NavLink } from "react-router-dom";
import { Home, BookOpen, CheckSquare, User } from "lucide-react";

interface MobileNavigationProps {
  role: "teacher" | "student";
}

const MobileNavigation = ({ role }: MobileNavigationProps) => {
  const basePath = role === "teacher" ? "/teacher-dashboard" : "/student-dashboard";
  
  const navItems = [
    {
      path: basePath,
      label: "Home",
      icon: Home,
      exact: true
    },
    {
      path: `${basePath}/groups`,
      label: "Courses",
      icon: BookOpen,
    },
    {
      path: `${basePath}/tasks`,
      label: "Tasks",
      icon: CheckSquare,
    },
    {
      path: "/profile",
      label: "Profile",
      icon: User,
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <div className="glass-card rounded-[2rem] shadow-soft mx-auto max-w-md pointer-events-auto">
        <div className="flex justify-between items-center px-6 py-3">
          {navItems.map((item) => (
            <NavLink 
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 relative ${
                  isActive 
                    ? "text-primary transform -translate-y-1" 
                    : "text-muted-foreground hover:text-primary/70"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`h-6 w-6 stroke-[2.5px]`} />
                  <span className="text-[10px] font-medium mt-1">{item.label}</span>
                  {isActive && (
                    <span className="absolute -1 bottom-1 w-1 h-1 bg-primary rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileNavigation;
