import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { Clock, ArrowLeft, Star } from 'lucide-react';
import { COLORS } from '../utils/constants';

const ComingSoon = () => {
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  const featurePart = pathParts[pathParts.length - 1];
  
  // Capitalize the feature name
  const pageName = featurePart.charAt(0).toUpperCase() + featurePart.slice(1);
  
  // Card glass styling
  const cardGlassStyle = {
    background: "rgba(91, 88, 235, 0.15)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(91, 88, 235, 0.3)",
  };

  // Content glass styling
  const contentGlassStyle = {
    background: "rgba(17, 44, 112, 0.3)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
  };
  
  return (
    <>
      {/* Main content */}
      <div className="w-full h-full flex flex-col items-center justify-center">
        <motion.div
          className="w-full max-w-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Icon and Title */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="p-4 rounded-full mb-6" style={{ backgroundColor: "rgba(91, 88, 235, 0.3)" }}>
              <Clock size={48} color={COLORS.cyan} />
            </div>
            
            <h1 className="text-3xl font-bold mb-3" style={{ color: COLORS.textPrimary }}>
              {pageName} Coming Soon
            </h1>
            
            <p className="text-lg text-center" style={{ color: COLORS.textSecondary }}>
              We're working hard to bring you this feature. The {featurePart} functionality 
              will be available in the next update. Stay tuned!
            </p>
          </div>
          
          {/* Upgrade Card */}
          <motion.div
            className="rounded-lg p-6 mb-6"
            style={cardGlassStyle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-start mb-4">
              <Star size={18} className="mr-3 mt-1 flex-shrink-0" color={COLORS.cyan} />
              <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                Want early access to upcoming features? Upgrade to our Pro plan to become a beta tester
                and get access to experimental features before they're released.
              </p>
            </div>
            
            <button
              className="w-full py-2 rounded-lg text-sm font-medium mt-2"
              style={{
                background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.purple})`,
                color: "white",
              }}
            >
              Upgrade to Pro
            </button>
          </motion.div>
          
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center"
          >
            <Link 
              to="/"
              className="flex items-center py-2.5 px-4 rounded-lg transition-colors hover:bg-white/10"
              style={{
                background: 'rgba(255, 255, 255, 0.05)', 
                color: COLORS.textPrimary,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <ArrowLeft size={16} className="mr-2" />
              <span>Back to Dashboard</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default ComingSoon;