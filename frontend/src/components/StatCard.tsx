import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { COLORS } from '../utils/constants';

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
  isPositive?: boolean;
  delay?: number;
}

const StatCard = ({ title, value, change, icon, isPositive = true, delay = 0 }: StatCardProps) => {
  const glassStyle = {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    boxShadow: "0 8px 32px 0 rgba(10, 35, 83, 0.37)",
  };

  return (
    <motion.div
      className="rounded-xl p-6"
      style={glassStyle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="flex justify-between mb-4">
        <h3 style={{ color: COLORS.textSecondary }} className="text-sm">
          {title}
        </h3>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(91, 88, 235, 0.3)" }}
        >
          {icon}
        </div>
      </div>
      <div className="flex items-baseline">
        <span
          className="text-3xl font-bold"
          style={{ color: COLORS.textPrimary }}
        >
          {value}
        </span>
        <span
          className="ml-2 text-xs px-2 py-0.5 rounded flex items-center"
          style={{
            color: isPositive ? COLORS.success : COLORS.error,
            backgroundColor: isPositive ? "rgba(52, 211, 153, 0.2)" : "rgba(248, 113, 113, 0.2)",
          }}
        >
          <ArrowUpRight size={12} className="mr-1" />
          {change}
        </span>
      </div>
      <p className="text-xs mt-1" style={{ color: COLORS.textSecondary }}>
        vs last month
      </p>
    </motion.div>
  );
};

export default StatCard;