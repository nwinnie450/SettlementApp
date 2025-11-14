import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="container mx-auto max-w-md px-0">
          <Outlet />
        </div>
      </main>

      {/* Bottom navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Layout;
