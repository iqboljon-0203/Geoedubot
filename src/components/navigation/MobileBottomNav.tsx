import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Home, Users, ClipboardList, MessageSquare, User, Calendar, Award } from 'lucide-react';

interface MobileBottomNavProps {
  role: 'teacher' | 'student';
}

const MobileBottomNav = ({ role }: MobileBottomNavProps) => {
  const basePath = role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
  const { t } = useTranslation();

  const teacherNavItems = [
    {
      to: basePath,
      icon: Home,
      label: t('nav.dashboard'),
    },
    {
      to: `${basePath}/groups`,
      icon: Users,
      label: t('nav.groups'),
    },
    {
      to: `${basePath}/tasks`,
      icon: ClipboardList,
      label: t('nav.tasks'),
    },
    {
      to: `${basePath}/answers`,
      icon: MessageSquare,
      label: t('nav.answers'),
    },
    {
      to: '/profile',
      icon: User,
      label: t('nav.profile'),
    },
  ];

  const studentNavItems = [
    {
      to: basePath,
      icon: Home,
      label: t('nav.dashboard'),
    },
    {
      to: `${basePath}/tasks`,
      icon: ClipboardList,
      label: t('nav.tasks'),
    },
    {
      to: `${basePath}/groups`,
      icon: Users,
      label: t('nav.groups'),
    },
    {
      to: `${basePath}/grades`,
      icon: Award,
      label: t('nav.grades'),
    },
    {
      to: '/profile',
      icon: User,
      label: t('nav.profile'),
    },
  ];

  const navItems = role === 'teacher' ? teacherNavItems : studentNavItems;

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgb(0,0,0,0.02)] pb-safe"
      role="navigation"
      aria-label={t('accessibility.menu_button')}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === basePath}
            role="menuitem"
            aria-label={item.label}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 w-16 py-1 rounded-2xl transition-all duration-200 focus:outline-none',
                isActive
                  ? 'text-[#00A87A]'
                  : 'text-slate-400 hover:text-slate-600'
              )
            }
          >
            {({ isActive }) => {
              const Icon = item.icon;
              return (
                <>
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300",
                    isActive ? "bg-[#00A87A]/10" : "bg-transparent"
                  )}>
                    <Icon className={cn("w-5 h-5", isActive && "scale-110 fill-current opacity-20")} />
                    {isActive && <Icon className="w-5 h-5 absolute" />}
                  </div>
                  <span className={cn(
                    'text-[10px] font-bold transition-all duration-200',
                    isActive ? 'opacity-100' : 'opacity-80'
                  )}>
                    {item.label}
                  </span>
                </>
              );
            }}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
