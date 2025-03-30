//@ts-ignore
//@ts-nocheck
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Database,
  Play,
  Pause,
  ExternalLink,
  Info,
} from "lucide-react";
import { COLORS } from "../utils/constants";
import axios from "../api/axiosInstance";
import MainLayout from "../layouts/MainLayout";

const Indexers = () => {
  const [indexers, setIndexers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentIndexer, setCurrentIndexer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [databaseConnections, setDatabaseConnections] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(false);

  // Initial form state
  const initialFormState = {
    name: "",
    description: "",
    type: "NFT_PRICES", // Default type
    dbConnectionId: "",
    startBlock: 0,
    endBlock: null,
    config: {
      batchSize: 100,
      retryAttempts: 3,
      throttleMs: 1000,
    },
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  // Indexer types available in the system
  const indexerTypes = [
    { value: "NFT_PRICES", label: "NFT Prices" },
    { value: "TOKEN_PRICES", label: "Token Prices" },
    { value: "TOKEN_LOANS", label: "Token Loans" },
    { value: "NFT_BIDS", label: "NFT Bids" },
    { value: "DEX_SWAPS", label: "DEX Swaps" },
    { value: "WALLET_ACTIVITY", label: "Wallet Activity" },
  ];

  useEffect(() => {
    fetchIndexers();
    fetchDatabaseConnections();
  }, []);

  const fetchIndexers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/indexer");
      setIndexers(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching indexers:", err);
      setError("Failed to load indexers. Please try again.");
      setIndexers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDatabaseConnections = async () => {
    setLoadingConnections(true);
    try {
      const response = await axios.get("/database");
      setDatabaseConnections(response.data || []);
    } catch (err) {
      console.error("Error fetching database connections:", err);
    } finally {
      setLoadingConnections(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      // Handle nested properties (e.g., config.batchSize)
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === "number" ? parseInt(value, 10) : value,
        },
      });
    } else {
      // Handle top-level properties
      setFormData({
        ...formData,
        [name]:
          type === "checkbox"
            ? checked
            : type === "number"
            ? parseInt(value, 10)
            : value,
      });
    }

    // Clear errors when input changes
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.type) errors.type = "Type is required";
    if (!formData.dbConnectionId)
      errors.dbConnectionId = "Database connection is required";
    if (formData.startBlock < 0)
      errors.startBlock = "Start block must be a positive number";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (currentIndexer) {
        // Update existing indexer
        await axios.patch(`/indexer/${currentIndexer.id}`, formData);
      } else {
        // Create new indexer
        await axios.post("/indexer", formData);
      }

      // Reset form and fetch updated list
      setFormData(initialFormState);
      setShowAddModal(false);
      setShowEditModal(false);
      setCurrentIndexer(null);
      fetchIndexers();
    } catch (err) {
      console.error("Error saving indexer:", err);
      setError("Failed to save indexer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentIndexer) return;

    setIsSubmitting(true);

    try {
      await axios.delete(`/indexer/${currentIndexer.id}`);
      setShowDeleteModal(false);
      setCurrentIndexer(null);
      fetchIndexers();
    } catch (err) {
      console.error("Error deleting indexer:", err);
      setError("Failed to delete indexer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartIndexer = async (indexerId) => {
    setIsStarting(true);
    try {
      await axios.post(`/indexer/${indexerId}/start`);
      fetchIndexers(); // Refresh the list to show updated status
    } catch (err) {
      console.error("Error starting indexer:", err);
      setError("Failed to start indexer. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopIndexer = async (indexerId) => {
    setIsStopping(true);
    try {
      await axios.post(`/indexer/${indexerId}/stop`);
      fetchIndexers(); // Refresh the list to show updated status
    } catch (err) {
      console.error("Error stopping indexer:", err);
      setError("Failed to stop indexer. Please try again.");
    } finally {
      setIsStopping(false);
    }
  };

  const openEditModal = (indexer) => {
    setCurrentIndexer(indexer);
    // Transform API data to match form structure
    setFormData({
      name: indexer.name,
      description: indexer.description || "",
      type: indexer.type,
      dbConnectionId: indexer.dbConnectionId,
      startBlock: indexer.startBlock,
      endBlock: indexer.endBlock,
      config: {
        batchSize: indexer.config?.batchSize || 100,
        retryAttempts: indexer.config?.retryAttempts || 3,
        throttleMs: indexer.config?.throttleMs || 1000,
      },
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (indexer) => {
    setCurrentIndexer(indexer);
    setShowDeleteModal(true);
  };

  const filteredIndexers = indexers.filter(
    (indexer) =>
      indexer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      indexer.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (indexer.description &&
        indexer.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getIndexerTypeLabel = (typeValue) => {
    const type = indexerTypes.find((t) => t.value === typeValue);
    return type ? type.label : typeValue;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return COLORS.success;
      case "IDLE":
        return COLORS.warning;
      case "ERROR":
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getDatabaseName = (connectionId) => {
    const connection = databaseConnections.find(
      (conn) => conn.id === connectionId
    );
    return connection ? connection.name : "Unknown";
  };

  // Glassmorphism styles
  const glassStyle = {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    boxShadow: "0 8px 32px 0 rgba(10, 35, 83, 0.37)",
  };

  const IndexerForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="col-span-1 md:col-span-2">
          <label
            className="block text-sm mb-2"
            style={{ color: COLORS.textSecondary }}
          >
            Indexer Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Ethereum NFT Price Tracker"
            className={`w-full py-2 px-3 rounded-lg focus:outline-none ${
              formErrors.name ? "border-red-500" : ""
            }`}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: formErrors.name
                ? "1px solid #F87171"
                : "1px solid rgba(255, 255, 255, 0.1)",
              color: COLORS.textPrimary,
            }}
          />
          {formErrors.name && (
            <p className="text-xs mt-1" style={{ color: COLORS.error }}>
              {formErrors.name}
            </p>
          )}
        </div>

        <div className="col-span-1 md:col-span-2">
          <label
            className="block text-sm mb-2"
            style={{ color: COLORS.textSecondary }}
          >
            Description (Optional)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Brief description of what this indexer does"
            rows={3}
            className="w-full py-2 px-3 rounded-lg focus:outline-none"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: COLORS.textPrimary,
            }}
          />
        </div>

        <div>
          <label
            className="block text-sm mb-2"
            style={{ color: COLORS.textSecondary }}
          >
            Indexer Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className={`w-full py-2 px-3 rounded-lg focus:outline-none ${
              formErrors.type ? "border-red-500" : ""
            }`}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: formErrors.type
                ? "1px solid #F87171"
                : "1px solid rgba(255, 255, 255, 0.1)",
              color: COLORS.textPrimary,
            }}
          >
            {indexerTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {formErrors.type && (
            <p className="text-xs mt-1" style={{ color: COLORS.error }}>
              {formErrors.type}
            </p>
          )}
        </div>

        <div>
          <label
            className="block text-sm mb-2"
            style={{ color: COLORS.textSecondary }}
          >
            Database Connection
          </label>
          <select
            name="dbConnectionId"
            value={formData.dbConnectionId}
            onChange={handleInputChange}
            className={`w-full py-2 px-3 rounded-lg focus:outline-none ${
              formErrors.dbConnectionId ? "border-red-500" : ""
            }`}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: formErrors.dbConnectionId
                ? "1px solid #F87171"
                : "1px solid rgba(255, 255, 255, 0.1)",
              color: COLORS.textPrimary,
            }}
          >
            <option value="">Select Database Connection</option>
            {databaseConnections.map((conn) => (
              <option key={conn.id} value={conn.id}>
                {conn.name}
              </option>
            ))}
          </select>
          {formErrors.dbConnectionId && (
            <p className="text-xs mt-1" style={{ color: COLORS.error }}>
              {formErrors.dbConnectionId}
            </p>
          )}
          {databaseConnections.length === 0 && (
            <p className="text-xs mt-1" style={{ color: COLORS.warning }}>
              No database connections available.{" "}
              <Link to="/database" className="underline">
                Add one first
              </Link>
              .
            </p>
          )}
        </div>

        <div>
          <label
            className="block text-sm mb-2"
            style={{ color: COLORS.textSecondary }}
          >
            Start Block
          </label>
          <input
            type="number"
            name="startBlock"
            value={formData.startBlock}
            onChange={handleInputChange}
            placeholder="e.g., 0"
            className={`w-full py-2 px-3 rounded-lg focus:outline-none ${
              formErrors.startBlock ? "border-red-500" : ""
            }`}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: formErrors.startBlock
                ? "1px solid #F87171"
                : "1px solid rgba(255, 255, 255, 0.1)",
              color: COLORS.textPrimary,
            }}
          />
          {formErrors.startBlock && (
            <p className="text-xs mt-1" style={{ color: COLORS.error }}>
              {formErrors.startBlock}
            </p>
          )}
        </div>

        <div>
          <label
            className="block text-sm mb-2"
            style={{ color: COLORS.textSecondary }}
          >
            End Block (Optional)
          </label>
          <input
            type="number"
            name="endBlock"
            value={formData.endBlock || ""}
            onChange={handleInputChange}
            placeholder="Leave empty to sync continuously"
            className="w-full py-2 px-3 rounded-lg focus:outline-none"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: COLORS.textPrimary,
            }}
          />
        </div>

        <div>
          <label
            className="block text-sm mb-2"
            style={{ color: COLORS.textSecondary }}
          >
            Batch Size
          </label>
          <input
            type="number"
            name="config.batchSize"
            value={formData.config.batchSize}
            onChange={handleInputChange}
            placeholder="e.g., 100"
            className="w-full py-2 px-3 rounded-lg focus:outline-none"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: COLORS.textPrimary,
            }}
          />
        </div>

        <div>
          <label
            className="block text-sm mb-2"
            style={{ color: COLORS.textSecondary }}
          >
            Retry Attempts
          </label>
          <input
            type="number"
            name="config.retryAttempts"
            value={formData.config.retryAttempts}
            onChange={handleInputChange}
            placeholder="e.g., 3"
            className="w-full py-2 px-3 rounded-lg focus:outline-none"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: COLORS.textPrimary,
            }}
          />
        </div>

        <div>
          <label
            className="block text-sm mb-2"
            style={{ color: COLORS.textSecondary }}
          >
            Throttle (ms)
          </label>
          <input
            type="number"
            name="config.throttleMs"
            value={formData.config.throttleMs}
            onChange={handleInputChange}
            placeholder="e.g., 1000"
            className="w-full py-2 px-3 rounded-lg focus:outline-none"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: COLORS.textPrimary,
            }}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setFormData(initialFormState);
            setCurrentIndexer(null);
          }}
          className="px-4 py-2 rounded-lg text-sm"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            color: COLORS.textPrimary,
          }}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center"
          style={{
            background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.purple})`,
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting ? (
            <>
              <RefreshCw size={16} className="mr-2 animate-spin" />
              {currentIndexer ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              <Activity size={16} className="mr-2" />
              {currentIndexer ? "Update Indexer" : "Create Indexer"}
            </>
          )}
        </button>
      </div>
    </form>
  );

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ color: COLORS.textPrimary }}
        >
          Indexers
        </h1>

        <button
          onClick={() => {
            if (databaseConnections.length === 0) {
              setError(
                "You need to create a database connection first before adding an indexer."
              );
              return;
            }
            setCurrentIndexer(null);
            setFormData(initialFormState);
            setShowAddModal(true);
          }}
          className="px-4 py-2 rounded-lg flex items-center text-sm font-medium text-white"
          style={{
            background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.purple})`,
          }}
        >
          <Plus size={16} className="mr-2" />
          Add Indexer
        </button>
      </div>

      {/* Search and Refresh */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-grow max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
            size={18}
            color={COLORS.textSecondary}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search indexers..."
            className="pl-10 pr-4 py-2 w-full rounded-lg focus:outline-none"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: COLORS.textPrimary,
            }}
          />
        </div>

        <button
          onClick={fetchIndexers}
          className="p-2 rounded-lg"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
          title="Refresh"
        >
          <RefreshCw size={20} color={COLORS.textSecondary} />
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div
          className="p-4 mb-6 rounded-lg"
          style={{
            backgroundColor: "rgba(248, 113, 113, 0.1)",
            color: COLORS.error,
            border: "1px solid rgba(248, 113, 113, 0.3)",
          }}
        >
          <div className="flex items-center">
            <XCircle size={16} className="mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Indexers List */}
     {/* Indexers List */}
{loading ? (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-2" style={{ borderColor: COLORS.primary, borderTopColor: 'transparent' }}></div>
  </div>
) : (
  indexers.length === 0 ? (
    <motion.div
      className="rounded-lg p-8 text-center mb-6"
      style={glassStyle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Activity size={48} className="mx-auto mb-4 opacity-50" color={COLORS.textSecondary} />
      <h2 className="text-xl font-medium mb-2" style={{ color: COLORS.textPrimary }}>No Indexers</h2>
      <p className="mb-6" style={{ color: COLORS.textSecondary }}>
        You haven't added any indexers yet. Add your first indexer to start collecting blockchain data.
      </p>
      {databaseConnections.length === 0 ? (
        <Link
          to="/database"
          className="px-4 py-2 rounded-lg flex items-center text-sm font-medium text-white mx-auto inline-flex"
          style={{ background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.purple})` }}
        >
          <Database size={16} className="mr-2" />
          Add Database Connection First
        </Link>
      ) : (
        <button
          onClick={() => {
            setCurrentIndexer(null);
            setFormData(initialFormState);
            setShowAddModal(true);
          }}
          className="px-4 py-2 rounded-lg flex items-center text-sm font-medium text-white mx-auto"
          style={{ background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.purple})` }}
        >
          <Plus size={16} className="mr-2" />
          Add Your First Indexer
        </button>
      )}
    </motion.div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredIndexers.map((indexer, index) => (
        <motion.div
          key={indexer.id}
          className="rounded-lg overflow-hidden"
          style={glassStyle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <div className="p-5 border-b border-opacity-10" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <Activity size={18} className="mr-3" color={COLORS.primary} />
                <h3 className="font-medium" style={{ color: COLORS.textPrimary }}>{indexer.name}</h3>
              </div>
              <div 
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: getStatusColor(indexer.status) + '20',
                  color: getStatusColor(indexer.status)
                }}
              >
                {indexer.status}
              </div>
            </div>
            {indexer.description && (
              <p className="mt-2 text-sm" style={{ color: COLORS.textSecondary }}>
                {indexer.description}
              </p>
            )}
          </div>
          
          <div className="p-5">
            <div className="space-y-2">
              <div className="flex">
                <span className="text-xs w-24" style={{ color: COLORS.textSecondary }}>Type:</span>
                <span className="text-sm flex-1" style={{ color: COLORS.textPrimary }}>
                  {getIndexerTypeLabel(indexer.type)}
                </span>
              </div>
              <div className="flex">
                <span className="text-xs w-24" style={{ color: COLORS.textSecondary }}>Database:</span>
                <span className="text-sm flex-1" style={{ color: COLORS.textPrimary }}>
                  {getDatabaseName(indexer.dbConnectionId)}
                </span>
              </div>
              <div className="flex">
                <span className="text-xs w-24" style={{ color: COLORS.textSecondary }}>Start Block:</span>
                <span className="text-sm flex-1" style={{ color: COLORS.textPrimary }}>{indexer.startBlock}</span>
              </div>
              <div className="flex">
                <span className="text-xs w-24" style={{ color: COLORS.textSecondary }}>Current Block:</span>
                <span className="text-sm flex-1" style={{ color: COLORS.textPrimary }}>
                  {indexer.currentBlock || 'N/A'}
                </span>
              </div>
              <div className="flex">
                <span className="text-xs w-24" style={{ color: COLORS.textSecondary }}>Events/min:</span>
                <span className="text-sm flex-1" style={{ color: COLORS.textPrimary }}>
                  {indexer.eventsPerMinute || 0}
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-opacity-10 flex justify-between items-center" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div>
              <Link
                to={`/indexers/${indexer.id}`}
                className="p-2 rounded-lg transition-colors hover:bg-white/10 inline-flex items-center text-xs"
                style={{ color: COLORS.textPrimary }}
              >
                <Info size={14} className="mr-1" />
                Details
              </Link>
            </div>
            <div className="flex space-x-1">
              {indexer.status === 'ACTIVE' ? (
                <button
                  onClick={() => handleStopIndexer(indexer.id)}
                  disabled={isStopping}
                  className="p-2 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: COLORS.warning }}
                  title="Pause Indexer"
                >
                  <Pause size={16} />
                </button>
              ) : (
                <button
                  onClick={() => handleStartIndexer(indexer.id)}
                  disabled={isStarting}
                  className="p-2 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: COLORS.success }}
                  title="Start Indexer"
                >
                  <Play size={16} />
                </button>
              )}
              
              <button
                onClick={() => openEditModal(indexer)}
                className="p-2 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: COLORS.primary }}
                title="Edit Indexer"
              >
                <Edit size={16} />
              </button>
              
              <button
                onClick={() => openDeleteModal(indexer)}
                className="p-2 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: COLORS.error }}
                title="Delete Indexer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
)}

{/* Add Indexer Modal */}
{showAddModal && (
  <div className="fixed inset-0 z-50 overflow-auto bg-black/50 flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", duration: 0.5 }}
      className="relative w-full max-w-3xl rounded-xl overflow-hidden"
      style={glassStyle}
    >
      <div className="p-5 border-b border-opacity-10" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <h2 className="text-xl font-medium" style={{ color: COLORS.textPrimary }}>Create Blockchain Indexer</h2>
        <p className="mt-1 text-sm" style={{ color: COLORS.textSecondary }}>
          Configure your indexer to start collecting blockchain data
        </p>
      </div>
      
      <div className="p-6">
        <IndexerForm />
      </div>
    </motion.div>
  </div>
)}

{/* Edit Indexer Modal */}
{showEditModal && (
  <div className="fixed inset-0 z-50 overflow-auto bg-black/50 flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", duration: 0.5 }}
      className="relative w-full max-w-3xl rounded-xl overflow-hidden"
      style={glassStyle}
    >
      <div className="p-5 border-b border-opacity-10" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <h2 className="text-xl font-medium" style={{ color: COLORS.textPrimary }}>Edit Indexer</h2>
        <p className="mt-1 text-sm" style={{ color: COLORS.textSecondary }}>
          Update indexer configuration
        </p>
      </div>
      
      <div className="p-6">
        <IndexerForm />
      </div>
    </motion.div>
  </div>
)}

{/* Delete Confirmation Modal */}
{showDeleteModal && (
  <div className="fixed inset-0 z-50 overflow-auto bg-black/50 flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", duration: 0.5 }}
      className="relative w-full max-w-md rounded-xl overflow-hidden"
      style={glassStyle}
    >
      <div className="p-5">
        <h2 className="text-xl font-medium mb-4" style={{ color: COLORS.textPrimary }}>Confirm Deletion</h2>
        <p className="mb-3" style={{ color: COLORS.textSecondary }}>
          Are you sure you want to delete the indexer <span className="font-medium" style={{ color: COLORS.textPrimary }}>{currentIndexer?.name}</span>?
        </p>
        <p className="mb-6 text-sm" style={{ color: COLORS.warning }}>
          This action cannot be undone. The indexed data will remain in your database.
        </p>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              setShowDeleteModal(false);
              setCurrentIndexer(null);
            }}
            className="px-4 py-2 rounded-lg text-sm"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: COLORS.textPrimary }}
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg text-sm text-white font-medium flex items-center"
            style={{ backgroundColor: COLORS.error, opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? (
              <>
                <RefreshCw size={16} className="mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} className="mr-2" />
                Delete Indexer
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  </div>
)}
    </MainLayout>
  );
};

export default Indexers;
