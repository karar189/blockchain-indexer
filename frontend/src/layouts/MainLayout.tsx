import React, { ReactNode } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Star } from 'lucide-react';
import SpaceParticles from '../components/SpaceParticles';
import '../styles/background.css';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="relative h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-animation z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-[#112C70]/80 to-[#0A2353]/80 z-10"></div>
      <SpaceParticles />
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
        <div className="absolute top-10 left-[10%]">
          <Star size={8} color="white" fill="white" />
        </div>
        <div className="absolute top-[15%] right-[20%]">
          <Star size={10} color="white" fill="white" />
        </div>
        <div className="absolute bottom-[25%] left-[15%]">
          <Star size={6} color="white" fill="white" />
        </div>
        <div className="absolute bottom-[15%] right-[30%]">
          <Star size={12} color="white" fill="white" />
        </div>
        <div className="absolute top-[40%] left-[30%]">
          <Star size={7} color="white" fill="white" />
        </div>
      </div>
      
      {/* Main Content Container */}
      <div className="flex h-screen relative z-30">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          <Header />
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;