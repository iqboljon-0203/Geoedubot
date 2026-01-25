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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  const basePath = role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';

  const teacherNavItems: NavItem[] = [
    {
      to: basePath,
      icon: <Home className="w-5 h-5" aria-hidden="true" />,
      label: t('nav.dashboard'),
    },
    {
      to: `${basePath}/groups`,
      icon: <Users className="w-5 h-5" aria-hidden="true" />,
      label: t('nav.groups'),
    },
    {
      to: `${basePath}/tasks`,
      icon: <FileText className="w-5 h-5" aria-hidden="true" />,
      label: t('nav.tasks'),
    },
    {
      to: `${basePath}/answers`,
      icon: <ClipboardList className="w-5 h-5" aria-hidden="true" />,
      label: t('nav.answers'),
    },
    {
      to: `${basePath}/calendar`,
      icon: <Calendar className="w-5 h-5" aria-hidden="true" />,
      label: t('nav.calendar'),
    },
  ];

  const studentNavItems: NavItem[] = [
    {
      to: basePath,
      icon: <Home className="w-5 h-5" aria-hidden="true" />,
      label: t('nav.dashboard'),
    },
    {
      to: `${basePath}/tasks`,
      icon: <FileText className="w-5 h-5" aria-hidden="true" />,
      label: t('nav.tasks'),
    },
    {
      to: `${basePath}/groups`,
      icon: <Users className="w-5 h-5" aria-hidden="true" />,
      label: t('nav.groups'),
    },
    {
      to: `${basePath}/grades`,
      icon: <Award className="w-5 h-5" aria-hidden="true" />,
      label: t('nav.grades'),
    },
    {
      to: `${basePath}/calendar`,
      icon: <Calendar className="w-5 h-5" aria-hidden="true" />,
      label: t('nav.calendar'),
    },
  ];

  const navItems = role === 'teacher' ? teacherNavItems : studentNavItems;

  const handleLogout = async () => {
    await signOut();
    navigate('/role-selection');
  };

  const getRoleLabel = () => {
    return role === 'teacher' ? t('auth.teacher') : t('auth.student');
  };

  return (
    <div className="h-full flex flex-col" role="navigation" aria-label={t('accessibility.menu_button')}>
      {/* Logo & Brand */}
      <div className="px-6 py-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20"
            aria-hidden="true"
          >
            <img src="/logo.png" alt="GeoEdubot Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">GeoEdubot</h1>
            <p className="text-xs text-muted-foreground">
              {getRoleLabel()}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto" role="menu">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === basePath}
            role="menuitem"
            aria-label={item.label}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary',
                isActive
                  ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
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
                  <span className="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-destructive text-white">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Divider */}
        <div className="h-px bg-border my-4" role="separator" aria-hidden="true" />

        {/* Profile & Settings */}
        <NavLink
          to="/profile"
          role="menuitem"
          aria-label={t('nav.profile')}
          className={({ isActive }) =>
            cn(
              'group flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary',
              isActive
                ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )
          }
        >
          <User className="w-5 h-5" aria-hidden="true" />
          <span className="text-sm">{t('nav.profile')}</span>
        </NavLink>

        <NavLink
          to="/settings"
          role="menuitem"
          aria-label={t('nav.settings')}
          className={({ isActive }) =>
            cn(
              'group flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary',
              isActive
                ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )
          }
        >
          <Settings className="w-5 h-5" aria-hidden="true" />
          <span className="text-sm">{t('nav.settings')}</span>
        </NavLink>
      </nav>

      {/* User Profile Card & Logout */}
      <div className="p-4 border-t border-border space-y-3">
        {/* User Card */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted border border-border">
          {profileUrl ? (
            <img
              src={profileUrl}
              alt={name || 'User'}
              className="w-10 h-10 rounded-full object-cover border-2 border-card shadow-sm"
            />
          ) : (
            <div 
              className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-semibold shadow-sm"
              aria-hidden="true"
            >
              {name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {name || t('auth.student')}
            </p>
            <p className="text-xs text-muted-foreground">
              {getRoleLabel()}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl font-medium focus:ring-2 focus:ring-destructive"
          aria-label={t('common.logout')}
        >
          <LogOut className="w-5 h-5 mr-3" aria-hidden="true" />
          {t('common.logout')}
        </Button>
      </div>
    </div>
  );
};

export default SidebarNavigation;
