import React from "react";
import { useNavigate } from "react-router-dom";
import { Cloud, BarChart2, Activity } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import StatCard from "../components/StatCard";
import IndexerTable from "../components/IndexerTable";
import { useIndexers } from "../hooks/useIndexers";
import { COLORS, formatNumber } from "../utils/constants";

const Dashboard = () => {
  const navigate = useNavigate();
  const { loading, stats, indexers, activateIndexer, deactivateIndexer } = useIndexers();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#112C70] to-[#0A2353]">
        <div
          className="animate-spin rounded-full h-12 w-12 border-2"
          style={{ borderColor: COLORS.primary, borderTopColor: "transparent" }}
        ></div>
      </div>
    );
  }

  const handleViewIndexer = (id: string) => {
    navigate(`/indexers/${id}`);
  };

  return (
    <MainLayout>
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <StatCard
          title="Active Indexers"
          value={stats.activeIndexers}
          change="12.5%"
          icon={<Cloud size={16} color={COLORS.cyan} />}
          isPositive={true}
          delay={0}
        />
        
        <StatCard
          title="Events Processed"
          value={formatNumber(stats.eventsProcessed)}
          change="28.1%"
          icon={<BarChart2 size={16} color={COLORS.purple} />}
          isPositive={true}
          delay={0.1}
        />
        
        <StatCard
          title="Error Rate"
          value={`${stats.errorRate}%`}
          change="0.3%"
          icon={<Activity size={16} color={COLORS.primary} />}
          isPositive={false}
          delay={0.2}
        />
      </div>
      
      {/* Indexers Table */}
      <IndexerTable
        indexers={indexers}
        onActivate={activateIndexer}
        onDeactivate={deactivateIndexer}
        onView={handleViewIndexer}
      />
    </MainLayout>
  );
};

export default Dashboard;