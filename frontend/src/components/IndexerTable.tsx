import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { MoreHorizontal, Plus, Eye, PauseCircle, PlayCircle, ExternalLink, Cloud } from 'lucide-react';
import { COLORS } from '../utils/constants';
import AddIndexerModal from './AddIndexerModal';
import axios from '../api/axiosInstance';

interface Indexer {
  id: string;
  name: string;
  category: string;
  status: string;
  eventsPerMinute?: number;
}

interface IndexerTableProps {
  indexers: Indexer[];
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  onView: (id: string) => void;
}

interface DatabaseConnection {
  id: string;
  name: string;
  host: string;
  port: number;
  database: string;
}

const IndexerTable = ({ indexers, onActivate, onDeactivate, onView }: IndexerTableProps) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [databaseConnections, setDatabaseConnections] = useState<DatabaseConnection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  
  // Fetch database connections when modal opens
  useEffect(() => {
    if (isModalOpen) {
      fetchDatabaseConnections();
    }
  }, [isModalOpen]);
  
  const fetchDatabaseConnections = async () => {
    setLoadingConnections(true);
    try {
      const response = await axios.get('/database');
      setDatabaseConnections(response.data || []);
    } catch (error) {
      console.error('Error fetching database connections:', error);
      setDatabaseConnections([]);
    } finally {
      setLoadingConnections(false);
    }
  };
  
  const handleModalSuccess = () => {
    // Refresh the indexers list
    // You might want to call a refresh function passed from the parent
    // or use a context/state management solution
    window.location.reload();
  };
  
  const glassStyle = {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    boxShadow: "0 8px 32px 0 rgba(10, 35, 83, 0.37)",
  };

  return (
    <>
      <motion.div
        className="rounded-xl overflow-hidden mb-6"
        style={glassStyle}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div
          className="p-5 flex justify-between items-center border-b border-opacity-10"
          style={{ borderColor: COLORS.glassBorder }}
        >
          <h2 className="text-lg font-medium" style={{ color: COLORS.textPrimary }}>
            Active Indexers
          </h2>

          <div className="flex items-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-lg flex items-center text-sm font-medium text-white"
              style={{
                background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.purple})`,
              }}
            >
              <Plus size={14} className="mr-2" />
              Add New Indexer
            </button>

            <button
              className="ml-2 p-2 rounded-lg"
              style={{ background: "rgba(255, 255, 255, 0.1)" }}
            >
              <MoreHorizontal size={16} color={COLORS.textSecondary} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${COLORS.glassBorder}` }}>
                <th
                  className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: COLORS.textSecondary }}
                >
                  Name
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: COLORS.textSecondary }}
                >
                  Type
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: COLORS.textSecondary }}
                >
                  Status
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: COLORS.textSecondary }}
                >
                  Events/min
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: COLORS.textSecondary }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {indexers.length > 0 ? (
                indexers.map((indexer, index) => (
                  <motion.tr
                    key={indexer.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="hover:bg-white/5 transition-colors"
                    style={{ borderBottom: `1px solid ${COLORS.glassBorder}` }}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>
                        {indexer.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm" style={{ color: COLORS.textSecondary }}>
                        {indexer.category.replace("_", " ")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 inline-flex items-center text-xs font-medium rounded-full ${
                          indexer.status === "ACTIVE"
                            ? "bg-green-900/30 text-green-400"
                            : indexer.status === "ERROR"
                            ? "bg-red-900/30 text-red-400"
                            : "bg-yellow-900/30 text-yellow-400"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            indexer.status === "ACTIVE"
                              ? "bg-green-400"
                              : indexer.status === "ERROR"
                              ? "bg-red-400"
                              : "bg-yellow-400"
                          }`}
                        ></span>
                        {indexer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: COLORS.textSecondary }}>
                      {indexer.eventsPerMinute || "0"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onView(indexer.id)}
                          className="p-1.5 rounded-md transition-colors hover:bg-white/10"
                          style={{ color: COLORS.cyan }}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>

                        {indexer.status === "ACTIVE" ? (
                          <button
                            onClick={() => onDeactivate(indexer.id)}
                            className="p-1.5 rounded-md transition-colors hover:bg-white/10"
                            style={{ color: COLORS.warning }}
                            title="Pause Indexer"
                          >
                            <PauseCircle size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => onActivate(indexer.id)}
                            className="p-1.5 rounded-md transition-colors hover:bg-white/10"
                            style={{ color: COLORS.success }}
                            title="Activate Indexer"
                          >
                            <PlayCircle size={16} />
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/indexers/${indexer.id}`)}
                          className="p-1.5 rounded-md transition-colors hover:bg-white/10"
                          style={{ color: COLORS.textSecondary }}
                          title="Open in New Tab"
                        >
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center" style={{ color: COLORS.textSecondary }}>
                    <div className="flex flex-col items-center">
                      <Cloud size={24} className="mb-2 opacity-50" />
                      <p>No indexers found. Click "Add New Indexer" to create your first indexer.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
      
      <AddIndexerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        databaseConnections={databaseConnections}
      />
    </>
  );
};

export default IndexerTable;