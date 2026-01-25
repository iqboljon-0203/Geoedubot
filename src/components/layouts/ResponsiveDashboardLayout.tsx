import { Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import SidebarNavigation from '../navigation/SidebarNavigation';
import MobileBottomNav from '../navigation/MobileBottomNav';

/**
 * Responsive Dashboard Layout
 * Mobile: Bottom navigation bar
 * Desktop: Left sidebar navigation with Bento-style design
 */
export const ResponsiveDashboardLayout = () => {
  const { role } = useAuthStore();
  if (!role) return null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Desktop Sidebar - Hidden on mobile via CSS */}
      <aside className="hidden md:flex w-64 lg:w-72 h-screen sticky top-0 flex-shrink-0 border-r border-border bg-card">
        <SidebarNavigation role={role} />
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        {/* Mobile: pb-24 for bottom nav, Desktop: pb-6 */}
        <div className="min-h-screen pb-24 md:pb-6">
          <Outlet />
        </div>
      </main>
      
      {/* Mobile Bottom Navigation - Hidden on desktop via CSS */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <MobileBottomNav role={role} />
      </nav>
    </div>
  );
};

export default ResponsiveDashboardLayout;
