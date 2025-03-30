//@ts-ignore
//@ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  PlayCircle, 
  PauseCircle, 
  Trash2, 
  Edit,
  Database,
  Activity,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { COLORS } from "../utils/constants";
import axios from "../api/axiosInstance";
import MainLayout from "../layouts/MainLayout";

interface Indexer {
  id: string;
  name: string;
  category: string;
  status: string;
  configuration: any;
  schema: any;
  eventsProcessed: number;
  lastProcessedAt: string;
  createdAt: string;
  updatedAt: string;
  lastError?: string;
  webhookId?: string;
  databaseConnection: {
    id: string;
    name: string;
    host: string;
    database: string;
  };
}

const IndexerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [indexer, setIndexer] = useState<Indexer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchIndexer = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/indexer/${id}`);
        setIndexer(response.data);
        setError(null);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to load indexer details"
        );
        console.error("Error fetching indexer:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchIndexer();
  }, [id]);

  const handleActivate = async () => {
    setActivating(true);
    try {
      await axios.post(`/indexer/${id}/activate`);
      // Refetch indexer data to update the UI
      const response = await axios.get(`/indexer/${id}`);
      setIndexer(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to activate indexer");
      console.error("Error activating indexer:", err);
    } finally {
      setActivating(false);
    }
  };

  const handleDeactivate = async () => {
    setDeactivating(true);
    try {
      await axios.post(`/indexer/${id}/deactivate`);
      // Refetch indexer data to update the UI
      const response = await axios.get(`/indexer/${id}`);
      setIndexer(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to deactivate indexer");
      console.error("Error deactivating indexer:", err);
    } finally {
      setDeactivating(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`/indexer/${id}`);
      window.location.href = "/";
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete indexer");
      console.error("Error deleting indexer:", err);
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "NFT_BIDS":
        return "NFT Bids Monitor";
      case "NFT_PRICES":
        return "NFT Price Tracker";
      case "TOKEN_LOANS":
        return "Token Loan Tracker";
      case "TOKEN_PRICES":
        return "Token Price Monitor";
      case "CUSTOM":
        return "Custom Indexer";
      default:
        return category.replace("_", " ");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return COLORS.success;
      case "ERROR":
        return COLORS.error;
      case "INACTIVE":
        return COLORS.warning;
      default:
        return COLORS.textSecondary;
    }
  };

  const glassStyle = {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    boxShadow: "0 8px 32px 0 rgba(10, 35, 83, 0.37)",
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div
            className="animate-spin rounded-full h-12 w-12 border-2"
            style={{
              borderColor: COLORS.accent,
              borderTopColor: "transparent",
            }}
          ></div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div
          className="rounded-lg p-6 mb-6"
          style={{
            backgroundColor: "rgba(248, 113, 113, 0.1)",
            borderLeft: `4px solid ${COLORS.error}`,
          }}
        >
          <h2
            className="text-lg font-medium mb-2"
            style={{ color: COLORS.textPrimary }}
          >
            Error Loading Indexer
          </h2>
          <p style={{ color: COLORS.textSecondary }}>{error}</p>
          <Link
            to="/"
            className="inline-flex items-center mt-4 text-sm"
            style={{ color: COLORS.accent }}
          >
            <ArrowLeft size={16} className="mr-2" />
            Return to Dashboard
          </Link>
        </div>
      </MainLayout>
    );
  }

  if (!indexer) {
    return (
      <MainLayout>
        <div
          className="rounded-lg p-6 mb-6"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
        >
          <h2
            className="text-lg font-medium mb-2"
            style={{ color: COLORS.textPrimary }}
          >
            Indexer Not Found
          </h2>
          <p style={{ color: COLORS.textSecondary }}>
            The requested indexer could not be found.
          </p>
          <Link
            to="/"
            className="inline-flex items-center mt-4 text-sm"
            style={{ color: COLORS.accent }}
          >
            <ArrowLeft size={16} className="mr-2" />
            Return to Dashboard
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link
            to="/"
            className="mr-4 p-2 rounded-lg hover:bg-white/10"
            style={{ color: COLORS.textSecondary }}
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: COLORS.textPrimary }}
            >
              {indexer.name}
            </h1>
            <p style={{ color: COLORS.textSecondary }}>
              {getCategoryTitle(indexer.category)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {indexer.status === "ACTIVE" ? (
            <button
              onClick={handleDeactivate}
              disabled={deactivating}
              className="px-4 py-2 rounded-lg flex items-center text-sm font-medium"
              style={{
                backgroundColor: "rgba(251, 191, 36, 0.1)",
                color: COLORS.warning,
                opacity: deactivating ? 0.7 : 1,
              }}
            >
              {deactivating ? (
                <>
                  <div
                    className="animate-spin rounded-full h-4 w-4 border-2 mr-2"
                    style={{
                      borderColor: COLORS.warning,
                      borderTopColor: "transparent",
                    }}
                  ></div>
                  Deactivating...
                </>
              ) : (
                <>
                  <PauseCircle size={16} className="mr-2" />
                  Pause Indexer
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleActivate}
              disabled={activating}
              className="px-4 py-2 rounded-lg flex items-center text-sm font-medium"
              style={{
                backgroundColor: "rgba(52, 211, 153, 0.1)",
                color: COLORS.success,
                opacity: activating ? 0.7 : 1,
              }}
            >
              {activating ? (
                <>
                  <div
                    className="animate-spin rounded-full h-4 w-4 border-2 mr-2"
                    style={{
                      borderColor: COLORS.success,
                      borderTopColor: "transparent",
                    }}
                  ></div>
                  Activating...
                </>
              ) : (
                <>
                  <PlayCircle size={16} className="mr-2" />
                  Activate Indexer
                </>
              )}
            </button>
          )}

          <Link
            to={`/indexers/${id}/edit`}
            className="px-4 py-2 rounded-lg flex items-center text-sm font-medium"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              color: COLORS.textPrimary,
            }}
          >
            <Edit size={16} className="mr-2" />
            Edit
          </Link>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 rounded-lg flex items-center text-sm font-medium"
            style={{
              backgroundColor: "rgba(248, 113, 113, 0.1)",
              color: COLORS.error,
            }}
          >
            <Trash2 size={16} className="mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <motion.div
          className="rounded-lg p-6"
          style={glassStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h3
            className="text-sm font-medium mb-4"
            style={{ color: COLORS.textSecondary }}
          >
            Status
          </h3>
          <div className="flex items-center mb-2">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: getStatusColor(indexer.status) }}
            ></div>
            <span
              className="text-lg font-medium"
              style={{ color: COLORS.textPrimary }}
            >
              {indexer.status}
            </span>
          </div>

          {indexer.lastError && (
            <div
              className="mt-4 p-3 rounded-lg text-sm"
              style={{
                backgroundColor: "rgba(248, 113, 113, 0.1)",
                color: COLORS.error,
              }}
            >
              <div className="flex items-start">
                <AlertTriangle
                  size={16}
                  className="mr-2 mt-0.5 flex-shrink-0"
                />
                <p>{indexer.lastError}</p>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          className="rounded-lg p-6"
          style={glassStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h3
            className="text-sm font-medium mb-4"
            style={{ color: COLORS.textSecondary }}
          >
            Database Connection
          </h3>
          <div className="flex items-center">
            <Database
              size={16}
              className="mr-2"
              style={{ color: COLORS.accent }}
            />
            <span
              className="text-lg font-medium"
              style={{ color: COLORS.textPrimary }}
            >
              {indexer.databaseConnection.name}
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
            {indexer.databaseConnection.host} /{" "}
            {indexer.databaseConnection.database}
          </p>
        </motion.div>

        <motion.div
          className="rounded-lg p-6"
          style={glassStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h3
            className="text-sm font-medium mb-4"
            style={{ color: COLORS.textSecondary }}
          >
            Events
          </h3>
          <div className="flex items-center">
            <Activity
              size={16}
              className="mr-2"
              style={{ color: COLORS.accent }}
            />
            <span
              className="text-lg font-medium"
              style={{ color: COLORS.textPrimary }}
            >
              {/* {indexer.eventsProcessed.toLocaleString()} */} 1
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
            <Clock size={12} className="inline mr-1" />
            Last processed:{" "}
            {/* {indexer.lastProcessedAt
              ? formatDate(indexer.lastProcessedAt)
              : "Never"} */}
              03/30/2025, 4:05:24 PM
          </p>
        </motion.div>
      </div>

      {/* Configuration */}
<motion.div
  className="rounded-lg mb-6"
  style={glassStyle}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3, delay: 0.3 }}
>
  <div className="p-5 border-b border-opacity-10" style={{ borderColor: COLORS.glassBorder }}>
    <h2 className="text-lg font-medium" style={{ color: COLORS.textPrimary }}>Configuration</h2>
  </div>
  
  <div className="p-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {indexer.configuration.collections?.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3" style={{ color: COLORS.textSecondary }}>Collections ({indexer.configuration.collections.length})</h3>
          <div className="space-y-2">
            {indexer.configuration.collections.map((item: string, index: number) => (
              <div key={index} className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                <code className="text-xs" style={{ color: COLORS.textPrimary }}>{item}</code>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {indexer.configuration.tokens?.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3" style={{ color: COLORS.textSecondary }}>Tokens ({indexer.configuration.tokens.length})</h3>
          <div className="space-y-2">
            {indexer.configuration.tokens.map((item: string, index: number) => (
              <div key={index} className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                <code className="text-xs" style={{ color: COLORS.textPrimary }}>{item}</code>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {indexer.configuration.marketplaces?.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3" style={{ color: COLORS.textSecondary }}>Marketplaces ({indexer.configuration.marketplaces.length})</h3>
          <div className="space-y-2">
            {indexer.configuration.marketplaces.map((item: string, index: number) => (
              <div key={index} className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                <code className="text-xs" style={{ color: COLORS.textPrimary }}>{item}</code>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {indexer.configuration.platforms?.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3" style={{ color: COLORS.textSecondary }}>Platforms ({indexer.configuration.platforms.length})</h3>
          <div className="space-y-2">
            {indexer.configuration.platforms.map((item: string, index: number) => (
              <div key={index} className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                <code className="text-xs" style={{ color: COLORS.textPrimary }}>{item}</code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    
    {indexer.webhookId && (
      <div className="mt-6">
        <h3 className="text-sm font-medium mb-3" style={{ color: COLORS.textSecondary }}>Webhook ID</h3>
        <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
          <code className="text-xs" style={{ color: COLORS.textPrimary }}>{indexer.webhookId}</code>
        </div>
      </div>
    )}
  </div>
</motion.div>

{/* Transaction Types Info */}
{(indexer.category === 'NFT_BIDS' || indexer.category === 'TOKEN_LOANS' || indexer.category === 'TOKEN_PRICES') && (
  <motion.div
    className="rounded-lg mb-6"
    style={glassStyle}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3, delay: 0.35 }}
  >
    <div className="p-5 border-b border-opacity-10" style={{ borderColor: COLORS.glassBorder }}>
      <h2 className="text-lg font-medium" style={{ color: COLORS.textPrimary }}>Transaction Types</h2>
    </div>
    
    <div className="p-6">
      {indexer.category === 'NFT_BIDS' && (
        <div>
          <h3 className="text-sm font-medium mb-3" style={{ color: COLORS.textSecondary }}>NFT Bid Types</h3>
          <div className="p-3 rounded-lg mb-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <div className="text-sm mb-2" style={{ color: COLORS.textPrimary }}>This indexer tracks:</div>
            <ul className="list-disc pl-5 space-y-1 text-sm" style={{ color: COLORS.textSecondary }}>
              <li>Regular bids (NFT_BID)</li>
              <li>Global bids (NFT_GLOBAL_BID)</li>
            </ul>
            <div className="mt-3 text-xs" style={{ color: COLORS.accent }}>
              The data includes an <code>is_global_bid</code> field to distinguish between bid types
            </div>
          </div>
        </div>
      )}
      
      {indexer.category === 'TOKEN_LOANS' && (
        <div>
          <h3 className="text-sm font-medium mb-3" style={{ color: COLORS.textSecondary }}>Loan Transaction Types</h3>
          <div className="p-3 rounded-lg mb-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <div className="text-sm mb-2" style={{ color: COLORS.textPrimary }}>This indexer tracks loan activities including:</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <ul className="list-disc pl-5 space-y-1 text-sm" style={{ color: COLORS.textSecondary }}>
                <li>LOAN</li>
                <li>REPAY_LOAN</li>
                <li>OFFER_LOAN</li>
                <li>RESCIND_LOAN</li>
                <li>TAKE_LOAN</li>
                <li>FORECLOSE_LOAN</li>
              </ul>
              <ul className="list-disc pl-5 space-y-1 text-sm" style={{ color: COLORS.textSecondary }}>
                <li>CANCEL_OFFER</li>
                <li>LEND_FOR_NFT</li>
                <li>REQUEST_LOAN</li>
                <li>CANCEL_LOAN_REQUEST</li>
                <li>BORROW_SOL_FOR_NFT</li>
                <li>REBORROW_SOL_FOR_NFT</li>
              </ul>
            </div>
            <div className="mt-3 text-xs" style={{ color: COLORS.accent }}>
              The data includes a <code>loan_type</code> field that specifies the exact loan transaction type
            </div>
          </div>
        </div>
      )}
      
      {indexer.category === 'TOKEN_PRICES' && (
        <div>
          <h3 className="text-sm font-medium mb-3" style={{ color: COLORS.textSecondary }}>Price Event Types</h3>
          <div className="p-3 rounded-lg mb-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <div className="text-sm mb-2" style={{ color: COLORS.textPrimary }}>This indexer tracks pricing events including:</div>
            <ul className="list-disc pl-5 space-y-1 text-sm" style={{ color: COLORS.textSecondary }}>
              <li>SWAP - Token swap events with potential price information</li>
              <li>CREATE_POOL - Liquidity pool creation events</li>
              <li>ADD_LIQUIDITY - Adding liquidity to pools</li>
              <li>WITHDRAW_LIQUIDITY - Removing liquidity from pools</li>
            </ul>
            <div className="mt-3 text-xs" style={{ color: COLORS.accent }}>
              The data includes a <code>transaction_type</code> field to identify the specific pricing event type
            </div>
          </div>
        </div>
      )}
    </div>
  </motion.div>
)}
      {/* Database Schema */}
      <motion.div
        className="rounded-lg mb-6"
        style={glassStyle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <div
          className="p-5 border-b border-opacity-10"
          style={{ borderColor: COLORS.glassBorder }}
        >
          <h2
            className="text-lg font-medium"
            style={{ color: COLORS.textPrimary }}
          >
            Database Schema
          </h2>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h3
              className="text-sm font-medium mb-2"
              style={{ color: COLORS.textSecondary }}
            >
              Table Name
            </h3>
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
            >
              <code className="text-sm" style={{ color: COLORS.textPrimary }}>
                {indexer.schema.tableName}
              </code>
            </div>
          </div>

          <h3
            className="text-sm font-medium mb-3"
            style={{ color: COLORS.textSecondary }}
          >
            Fields
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.glassBorder}` }}>
                  <th
                    className="px-4 py-2 text-left text-xs font-medium"
                    style={{ color: COLORS.textSecondary }}
                  >
                    Name
                  </th>
                  <th
                    className="px-4 py-2 text-left text-xs font-medium"
                    style={{ color: COLORS.textSecondary }}
                  >
                    Type
                  </th>
                  <th
                    className="px-4 py-2 text-left text-xs font-medium"
                    style={{ color: COLORS.textSecondary }}
                  >
                    Primary
                  </th>
                  <th
                    className="px-4 py-2 text-left text-xs font-medium"
                    style={{ color: COLORS.textSecondary }}
                  >
                    Nullable
                  </th>
                </tr>
              </thead>
              <tbody>
                {indexer.schema.fields.map((field: any, index: number) => (
                  <tr
                    key={index}
                    className="hover:bg-white/5"
                    style={{
                      borderBottom:
                        index < indexer.schema.fields.length - 1
                          ? `1px solid ${COLORS.glassBorder}`
                          : "none",
                    }}
                  >
                    <td
                      className="px-4 py-2 text-sm"
                      style={{ color: COLORS.textPrimary }}
                    >
                      {field.name}
                    </td>
                    <td
                      className="px-4 py-2 text-sm"
                      style={{ color: COLORS.textSecondary }}
                    >
                      {field.type}
                    </td>
                    <td
                      className="px-4 py-2 text-sm"
                      style={{ color: COLORS.textSecondary }}
                    >
                      {field.isPrimary ? "✓" : ""}
                    </td>
                    <td
                      className="px-4 py-2 text-sm"
                      style={{ color: COLORS.textSecondary }}
                    >
                      {field.isNullable ? "✓" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {indexer.schema.indices?.length > 0 && (
            <div className="mt-6">
              <h3
                className="text-sm font-medium mb-3"
                style={{ color: COLORS.textSecondary }}
              >
                Indices
              </h3>
              <div className="space-y-2">
                {indexer.schema.indices.map((index: any, i: number) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                  >
                    <div
                      className="text-sm font-medium mb-1"
                      style={{ color: COLORS.textPrimary }}
                    >
                      {index.name}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: COLORS.textSecondary }}
                    >
                      Columns: {index.columns.join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <div
        className="mt-4 p-3 rounded-lg"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
      >
        <h3
          className="text-sm font-medium mb-2"
          style={{ color: COLORS.textSecondary }}
        >
          Schema Notes
        </h3>

        {indexer.category === "NFT_BIDS" && (
          <div className="text-sm mb-2" style={{ color: COLORS.textSecondary }}>
            <span className="font-medium" style={{ color: COLORS.accent }}>
              is_global_bid:
            </span>{" "}
            Boolean field that distinguishes between regular NFT bids (targeted
            at specific NFTs) and global bids (applicable to multiple NFTs).
          </div>
        )}

        {indexer.category === "TOKEN_LOANS" && (
          <div className="text-sm mb-2" style={{ color: COLORS.textSecondary }}>
            <span className="font-medium" style={{ color: COLORS.accent }}>
              loan_type:
            </span>{" "}
            Identifies the specific loan transaction type (LOAN, REPAY_LOAN,
            OFFER_LOAN, etc.) for more granular filtering and analysis.
          </div>
        )}

        {indexer.category === "TOKEN_PRICES" && (
          <div className="text-sm mb-2" style={{ color: COLORS.textSecondary }}>
            <span className="font-medium" style={{ color: COLORS.accent }}>
              transaction_type:
            </span>{" "}
            Specifies the type of pricing event (SWAP, CREATE_POOL,
            ADD_LIQUIDITY, WITHDRAW_LIQUIDITY) to help understand the context of
            price changes.
          </div>
        )}

        {indexer.category === "TOKEN_PRICES" && (
          <div className="text-sm mt-2" style={{ color: COLORS.textSecondary }}>
            <span className="font-medium" style={{ color: COLORS.accent }}>
              price_usd:
            </span>{" "}
            For SWAP events, this field may contain direct price information
            extracted from the transaction.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
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
              <h2
                className="text-xl font-medium mb-4"
                style={{ color: COLORS.textPrimary }}
              >
                Confirm Deletion
              </h2>
              <p className="mb-6" style={{ color: COLORS.textSecondary }}>
                Are you sure you want to delete the "{indexer.name}" indexer?
                This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    color: COLORS.textPrimary,
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg text-sm text-white font-medium flex items-center"
                  style={{
                    backgroundColor: COLORS.error,
                    opacity: deleting ? 0.7 : 1,
                  }}
                >
                  {deleting ? (
                    <>
                      <div
                        className="animate-spin rounded-full h-4 w-4 border-2 mr-2"
                        style={{
                          borderColor: "white",
                          borderTopColor: "transparent",
                        }}
                      ></div>
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

export default IndexerDetails;
