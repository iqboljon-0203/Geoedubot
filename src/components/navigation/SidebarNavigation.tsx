import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  FileText, 
  Calendar, 
  User, 
  Settings, 
  LogOut,
  GraduationCap,
  ClipboardList,
  Award
} from 'lucide-react';
import { useTelegramAuth } from '@/contexts/TelegramAuthContext';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarNavigationProps {
  role: 'teacher' | 'student';
}

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}

const SidebarNavigation = ({ role }: SidebarNavigationProps) => {
  const { signOut } = useTelegramAuth();
  const { name, profileUrl } = useAuthStore();
  const navigate = useNavigate();

  const basePath = role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';

  const teacherNavItems: NavItem[] = [
    {
      to: basePath,
      icon: <Home className="w-5 h-5" />,
      label: 'Dashboard',
    },
    {
      to: `${basePath}/groups`,
      icon: <Users className="w-5 h-5" />,
      label: 'Guruhlar',
    },
    {
      to: `${basePath}/tasks`,
      icon: <FileText className="w-5 h-5" />,
      label: 'Topshiriqlar',
    },
    {
      to: `${basePath}/answers`,
      icon: <ClipboardList className="w-5 h-5" />,
      label: 'Javoblar',
    },
    {
      to: `${basePath}/calendar`,
      icon: <Calendar className="w-5 h-5" />,
      label: 'Kalendar',
    },
  ];

  const studentNavItems: NavItem[] = [
    {
      to: basePath,
      icon: <Home className="w-5 h-5" />,
      label: 'Dashboard',
    },
    {
      to: `${basePath}/tasks`,
      icon: <FileText className="w-5 h-5" />,
      label: 'Topshiriqlar',
    },
    {
      to: `${basePath}/groups`,
      icon: <Users className="w-5 h-5" />,
      label: 'Guruhlar',
    },
    {
      to: `${basePath}/grades`,
      icon: <Award className="w-5 h-5" />,
      label: 'Baholar',
    },
    {
      to: `${basePath}/calendar`,
      icon: <Calendar className="w-5 h-5" />,
      label: 'Kalendar',
    },
  ];

  const navItems = role === 'teacher' ? teacherNavItems : studentNavItems;

  const handleLogout = async () => {
    await signOut();
    navigate('/role-selection');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Logo & Brand */}
      <div className="px-6 py-6 border-b border-zinc-200/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-900">GeoEdubot</h1>
            <p className="text-xs text-zinc-500">
              {role === 'teacher' ? "O'qituvchi" : 'Talaba'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === basePath}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={cn(
                  'transition-transform duration-200',
                  isActive && 'scale-110'
                )}>
                  {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500 text-white">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Divider */}
        <div className="h-px bg-zinc-200/60 my-4" />

        {/* Profile & Settings */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            cn(
              'group flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200',
              isActive
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            )
          }
        >
          <User className="w-5 h-5" />
          <span className="text-sm">Profil</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'group flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200',
              isActive
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            )
          }
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm">Sozlamalar</span>
        </NavLink>
      </nav>

      {/* User Profile Card & Logout */}
      <div className="p-4 border-t border-zinc-200/60 space-y-3">
        {/* User Card */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200/60">
          {profileUrl ? (
            <img
              src={profileUrl}
              alt={name || 'User'}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-sm">
              {name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zinc-900 truncate">
              {name || 'Foydalanuvchi'}
            </p>
            <p className="text-xs text-zinc-500">
              {role === 'teacher' ? "O'qituvchi" : 'Talaba'}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl font-medium"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Chiqish
        </Button>
      </div>
    </div>
  );
};

export default SidebarNavigation;
