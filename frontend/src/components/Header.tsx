//@ts-ignore
//@ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown, Bell, LogOut, User, Settings } from 'lucide-react';
import { COLORS } from '../utils/constants';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const glassStyle = {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    boxShadow: "0 8px 32px 0 rgba(10, 35, 83, 0.37)",
  };
  
  return (
    <header className="p-6 flex justify-between items-center">
      <h1 className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>
        Dashboard Overview
      </h1>

      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <button
            className="flex text-white items-center px-3 py-1.5 rounded-lg text-sm"
            style={glassStyle}
          >
            <Filter size={14} className="mr-2" />
            Filter
          </button>

          <div className="flex items-center ml-4">
            <span className="text-sm mr-2" style={{ color: COLORS.textSecondary }}>
              Year:
            </span>
            <button
              className="flex text-white items-center px-3 py-1.5 rounded-lg text-sm"
              style={glassStyle}
            >
              2025
              <ChevronDown size={14} className="ml-2" />
            </button>
          </div>
        </div>

        <div className="relative">
          <Bell size={20} className="cursor-pointer" color={COLORS.textSecondary} />
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs text-white"
            style={{ backgroundColor: COLORS.purple }}
          >
            3
          </span>
        </div>

        <div className="relative" ref={dropdownRef}>
          <div
            className="h-9 w-9 rounded-full overflow-hidden ring-2 ring-opacity-30 cursor-pointer"
            style={{ ringColor: COLORS.cyan }}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <img
              src="https://i.pravatar.cc/150?img=68"
              alt="Profile"
              className="h-full w-full object-cover"
            />
          </div>
          
          {showDropdown && (
            <div 
              className="absolute right-0 mt-2 w-64 rounded-lg z-50"
              style={glassStyle}
            >
              <div className="p-3 border-b border-white/10">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                    <img
                      src="https://i.pravatar.cc/150?img=68"
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: COLORS.textPrimary }}>
                      {user?.fullName || 'User'}
                    </p>
                    <p className="text-xs" style={{ color: COLORS.textSecondary }}>
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-2">
                <Link 
                  to="/profile" 
                  className="flex items-center px-3 py-2 rounded-md transition-colors hover:bg-white/10"
                  style={{ color: COLORS.textSecondary }}
                >
                  <User size={16} className="mr-3" />
                  Profile
                </Link>
                
                <Link 
                  to="/settings" 
                  className="flex items-center px-3 py-2 rounded-md transition-colors hover:bg-white/10"
                  style={{ color: COLORS.textSecondary }}
                >
                  <Settings size={16} className="mr-3" />
                  Settings
                </Link>
                
                <button 
                  onClick={logout}
                  className="flex items-center px-3 py-2 rounded-md w-full text-left transition-colors hover:bg-white/10"
                  style={{ color: COLORS.textSecondary }}
                >
                  <LogOut size={16} className="mr-3" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;