import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface MobileBottomNavProps {
  role: 'teacher' | 'student';
}

const MobileBottomNav = ({ role }: MobileBottomNavProps) => {
  const basePath = role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
  const { t } = useTranslation();

  const teacherNavItems = [
    {
      to: basePath,
      icon: (isActive: boolean) => (
        <svg className={cn("w-5 h-5", isActive && "scale-110")} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: t('nav.dashboard'),
    },
    {
      to: `${basePath}/groups`,
      icon: (isActive: boolean) => (
        <svg className={cn("w-5 h-5", isActive && "scale-110")} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      label: t('nav.groups'),
    },
    {
      to: `${basePath}/tasks`,
      icon: (isActive: boolean) => (
        <svg className={cn("w-5 h-5", isActive && "scale-110")} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      label: t('nav.tasks'),
    },
    {
      to: `${basePath}/answers`,
      icon: (isActive: boolean) => (
        <svg className={cn("w-5 h-5", isActive && "scale-110")} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      label: t('nav.answers'),
    },
    {
      to: '/profile',
      icon: (isActive: boolean) => (
        <svg className={cn("w-5 h-5", isActive && "scale-110")} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: t('nav.profile'),
    },
  ];

  const studentNavItems = [
    {
      to: basePath,
      icon: (isActive: boolean) => (
        <svg className={cn("w-5 h-5", isActive && "scale-110")} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: t('nav.dashboard'),
    },
    {
      to: `${basePath}/tasks`,
      icon: (isActive: boolean) => (
        <svg className={cn("w-5 h-5", isActive && "scale-110")} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      label: t('nav.tasks'),
    },
    {
      to: `${basePath}/groups`,
      icon: (isActive: boolean) => (
        <svg className={cn("w-5 h-5", isActive && "scale-110")} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      label: t('nav.groups'),
    },
    {
      to: `${basePath}/grades`,
      icon: (isActive: boolean) => (
        <svg className={cn("w-5 h-5", isActive && "scale-110")} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      label: t('nav.grades'),
    },
    {
      to: '/profile',
      icon: (isActive: boolean) => (
        <svg className={cn("w-5 h-5", isActive && "scale-110")} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: t('nav.profile'),
    },
  ];

  const navItems = role === 'teacher' ? teacherNavItems : studentNavItems;

  return (
    <nav 
      className="relative"
      role="navigation"
      aria-label={t('accessibility.menu_button')}
    >
      {/* Backdrop - solid background */}
      <div className="absolute inset-0 bg-card border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)]" aria-hidden="true" />
      
      {/* Navigation container */}
      <div className="relative px-2 py-2 safe-area-inset-bottom">
        <div className="flex items-center justify-around gap-1" role="menubar">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === basePath}
              role="menuitem"
              aria-label={item.label}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200 min-w-[64px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  isActive
                    ? 'bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg shadow-primary/30'
                    : 'text-muted-foreground active:scale-95 hover:bg-accent'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {item.icon(isActive)}
                  <span className={cn(
                    'text-[10px] font-medium transition-all duration-200',
                    isActive ? 'opacity-100' : 'opacity-70'
                  )}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
