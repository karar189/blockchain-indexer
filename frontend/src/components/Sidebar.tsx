import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Database, Cloud, FileText, Settings, Home, 
  Activity, PieChart
} from 'lucide-react';
import { COLORS } from '../utils/constants';
import logo from "../logo.png"

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const glassDarkStyle = {
    background: "rgba(17, 44, 112, 0.4)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    boxShadow: "0 8px 32px 0 rgba(10, 35, 83, 0.37)",
  };

  const isActive = (path) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };
  
  const getLinkStyle = (path) => {
    return isActive(path)
      ? {
          background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.purple})`,
          color: 'white',
        }
      : { color: COLORS.textSecondary };
  };
  
  return (
    <div className="w-64 h-full flex-shrink-0 relative" style={glassDarkStyle}>
      <div className="">
        <div className="flex items-center px-4 pt-4 ">
        
        
          <img src={logo} alt="" className='w-52' />
  
        </div>
        <div className="text-sm mt-1 px-6 pb-4" style={{ color: COLORS.textSecondary }}>
          Blockchain Indexing Platform
        </div>
      </div>

      <div className="px-4 pb-6">
        <div className="mb-6">
          <p className="text-xs uppercase font-medium mb-3 px-3" style={{ color: COLORS.textSecondary }}>
            Main menu
          </p>
          <nav>
            <Link
              to="/"
              className={`flex items-center py-2.5 px-3 mb-1 rounded-lg ${isActive('/') ? 'text-white' : 'transition-colors hover:bg-white/10'}`}
              style={getLinkStyle('/')}
            >
              <Home size={16} />
              <span className="ml-3">Dashboard</span>
            </Link>

            <Link
              to="/database"
              className={`flex items-center py-2.5 px-3 mb-1 rounded-lg ${isActive('/database') ? 'text-white' : 'transition-colors hover:bg-white/10'}`}
              style={getLinkStyle('/database')}
            >
              <Database size={16} />
              <span className="ml-3">Database Connections</span>
            </Link>

            <Link
              to="/indexers"
              className={`flex items-center py-2.5 px-3 mb-1 rounded-lg ${isActive('/indexers') ? 'text-white' : 'transition-colors hover:bg-white/10'}`}
              style={getLinkStyle('/indexers')}
            >
              <Cloud size={16} />
              <span className="ml-3">Indexers</span>
            </Link>

            <Link
              to="/logs"
              className={`flex items-center py-2.5 px-3 mb-1 rounded-lg ${isActive('/logs') ? 'text-white' : 'transition-colors hover:bg-white/10'}`}
              style={getLinkStyle('/logs')}
            >
              <FileText size={16} />
              <span className="ml-3">Logs</span>
            </Link>

            <Link
              to="/coming-soon/analytics"
              className={`flex items-center py-2.5 px-3 mb-1 rounded-lg ${isActive('/coming-soon/analytics') ? 'text-white' : 'transition-colors hover:bg-white/10'}`}
              style={getLinkStyle('/coming-soon/analytics')}
            >
              <Activity size={16} />
              <span className="ml-3">Analytics</span>
            </Link>

            <Link
              to="/coming-soon/reports"
              className={`flex items-center py-2.5 px-3 mb-1 rounded-lg ${isActive('/coming-soon/reports') ? 'text-white' : 'transition-colors hover:bg-white/10'}`}
              style={getLinkStyle('/coming-soon/reports')}
            >
              <PieChart size={16} />
              <span className="ml-3">Reports</span>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;