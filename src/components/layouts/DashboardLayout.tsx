
import { Outlet } from 'react-router-dom';
import NavigationMenu from '../NavigationMenu';
import { useAuthStore } from '@/store/authStore';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileNavigation from '../MobileNavigation';

export const DashboardLayout = () => {
  const { role } = useAuthStore();
  const isMobile = useIsMobile();

  if (!role) return null;

  return (
    <div className="dashboard-layout min-h-screen flex flex-col md:flex-row bg-background">
      {!isMobile && (
        <div className="w-64 h-screen sticky top-0 flex-shrink-0">
          <NavigationMenu role={role} />
        </div>
      )}
      
      <div className="dashboard-content flex-1 p-4 pb-24 md:pb-6 md:p-6">
        <Outlet />
      </div>
      
      {isMobile && <MobileNavigation role={role} />}
    </div>
  );
};

export default DashboardLayout;
