//@ts-ignore
//@ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Search
} from 'lucide-react';
import { COLORS } from '../utils/constants';
import axios from '../api/axiosInstance';
import MainLayout from '../layouts/MainLayout';

// DatabaseConnection interface (for TypeScript)
// interface DatabaseConnection {
//   id: string;
//   name: string;
//   host: string;
//   port: number;
//   database: string;
//   username: string;
//   password: string;
//   sslEnabled: boolean;
//   sslConfig: any;
//   isActive: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

const DatabaseConnections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentConnection, setCurrentConnection] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Initial form state
  const initialFormState = {
    name: '',
    host: '',
    port: 5432,
    database: '',
    username: '',
    password: '',
    sslEnabled: false,
    sslConfig: null
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/database');
      setConnections(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching database connections:', err);
      setError('Failed to load database connections. Please try again.');
      setConnections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear errors when input changes
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.host.trim()) errors.host = 'Host is required';
    if (!formData.port) errors.port = 'Port is required';
    if (!formData.database.trim()) errors.database = 'Database name is required';
    if (!formData.username.trim()) errors.username = 'Username is required';
    if (!formData.password.trim() && !currentConnection) errors.password = 'Password is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleTestConnection = async () => {
    if (!validateForm()) return;
    
    setTesting(true);
    setTestResult(null);
    
    try {
      await axios.post('/database/test', formData);
      setTestResult({ success: true, message: 'Connection successful' });
    } catch (err) {
      console.error('Connection test failed:', err);
      setTestResult({ 
        success: false, 
        message: err.response?.data?.message || 'Connection test failed. Please check your details and try again.'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (currentConnection) {
        // Update existing connection
        await axios.patch(`/database/${currentConnection.id}`, formData);
      } else {
        // Create new connection
        await axios.post('/database', formData);
      }
      
      // Reset form and fetch updated list
      setFormData(initialFormState);
      setShowAddModal(false);
      setShowEditModal(false);
      setCurrentConnection(null);
      fetchConnections();
    } catch (err) {
      console.error('Error saving database connection:', err);
      setError('Failed to save connection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentConnection) return;
    
    setIsSubmitting(true);
    
    try {
      await axios.delete(`/database/${currentConnection.id}`);
      setShowDeleteModal(false);
      setCurrentConnection(null);
      fetchConnections();
    } catch (err) {
      console.error('Error deleting connection:', err);
      setError('Failed to delete connection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (connection) => {
    setCurrentConnection(connection);
    setFormData({
      name: connection.name,
      host: connection.host,
      port: connection.port,
      database: connection.database,
      username: connection.username,
      password: '', // Don't show password
      sslEnabled: connection.sslEnabled,
      sslConfig: connection.sslConfig
    });
    setShowEditModal(true);
    setTestResult(null);
  };

  const openDeleteModal = (connection) => {
    setCurrentConnection(connection);
    setShowDeleteModal(true);
  };

  const filteredConnections = connections.filter(connection => 
    connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.database.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Glassmorphism styles
  const glassStyle = {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    boxShadow: "0 8px 32px 0 rgba(10, 35, 83, 0.37)"
  };

  const ConnectionForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm mb-2" style={{ color: COLORS.textSecondary }}>
            Connection Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Production Database"
            className={`w-full py-2 px-3 rounded-lg focus:outline-none ${formErrors.name ? 'border-red-500' : ''}`}
            style={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              border: formErrors.name ? '1px solid #F87171' : '1px solid rgba(255, 255, 255, 0.1)',
              color: COLORS.textPrimary 
            }}
          />
          {formErrors.name && (
            <p className="text-xs mt-1" style={{ color: COLORS.error }}>{formErrors.name}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm mb-2" style={{ color: COLORS.textSecondary }}>
            Host / Endpoint
          </label>
          <input
            type="text"
            name="host"
            value={formData.host}
            onChange={handleInputChange}
            placeholder="e.g., localhost or db.example.com"
            className={`w-full py-2 px-3 rounded-lg focus:outline-none ${formErrors.host ? 'border-red-500' : ''}`}
            style={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              border: formErrors.host ? '1px solid #F87171' : '1px solid rgba(255, 255, 255, 0.1)',
              color: COLORS.textPrimary 
            }}
          />
          {formErrors.host && (
            <p className="text-xs mt-1" style={{ color: COLORS.error }}>{formErrors.host}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm mb-2" style={{ color: COLORS.textSecondary }}>
            Port
          </label>
          <input
            type="number"
            name="port"
            value={formData.port}
            onChange={handleInputChange}
            placeholder="e.g., 5432"
            className={`w-full py-2 px-3 rounded-lg focus:outline-none ${formErrors.port ? 'border-red-500' : ''}`}
            style={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              border: formErrors.port ? '1px solid #F87171' : '1px solid rgba(255, 255, 255, 0.1)',
              color: COLORS.textPrimary 
            }}
          />
          {formErrors.port && (
            <p className="text-xs mt-1" style={{ color: COLORS.error }}>{formErrors.port}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm mb-2" style={{ color: COLORS.textSecondary }}>
            Database Name
          </label>
          <input
            type="text"
            name="database"
            value={formData.database}
            onChange={handleInputChange}
            placeholder="e.g., blockchain_data"
            className={`w-full py-2 px-3 rounded-lg focus:outline-none ${formErrors.database ? 'border-red-500' : ''}`}
            style={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              border: formErrors.database ? '1px solid #F87171' : '1px solid rgba(255, 255, 255, 0.1)',
              color: COLORS.textPrimary 
            }}
          />
          {formErrors.database && (
            <p className="text-xs mt-1" style={{ color: COLORS.error }}>{formErrors.database}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm mb-2" style={{ color: COLORS.textSecondary }}>
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="e.g., postgres"
            className={`w-full py-2 px-3 rounded-lg focus:outline-none ${formErrors.username ? 'border-red-500' : ''}`}
            style={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              border: formErrors.username ? '1px solid #F87171' : '1px solid rgba(255, 255, 255, 0.1)',
              color: COLORS.textPrimary 
            }}
          />
          {formErrors.username && (
            <p className="text-xs mt-1" style={{ color: COLORS.error }}>{formErrors.username}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm mb-2" style={{ color: COLORS.textSecondary }}>
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder={currentConnection ? "Leave empty to keep current password" : "Enter password"}
            className={`w-full py-2 px-3 rounded-lg focus:outline-none ${formErrors.password ? 'border-red-500' : ''}`}
            style={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              border: formErrors.password ? '1px solid #F87171' : '1px solid rgba(255, 255, 255, 0.1)',
              color: COLORS.textPrimary 
            }}
          />
          {formErrors.password && (
            <p className="text-xs mt-1" style={{ color: COLORS.error }}>{formErrors.password}</p>
          )}
        </div>
        
        <div className="col-span-1 md:col-span-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="sslEnabled"
              checked={formData.sslEnabled}
              onChange={handleInputChange}
              className="mr-2 rounded"
            />
            <span className="text-sm" style={{ color: COLORS.textSecondary }}>
              Enable SSL connection
            </span>
          </label>
        </div>
      </div>
      
      {testResult && (
        <div 
          className="p-4 mb-6 rounded-lg"
          style={{ 
            backgroundColor: testResult.success ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
            color: testResult.success ? COLORS.success : COLORS.error,
            border: `1px solid ${testResult.success ? 'rgba(52, 211, 153, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`
          }}
        >
          <div className="flex items-center">
            {testResult.success ? 
              <CheckCircle size={16} className="mr-2 flex-shrink-0" /> : 
              <XCircle size={16} className="mr-2 flex-shrink-0" />
            }
            <p>{testResult.message}</p>
          </div>
        </div>
      )}
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setFormData(initialFormState);
            setCurrentConnection(null);
            setTestResult(null);
          }}
          className="px-4 py-2 rounded-lg text-sm"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: COLORS.textPrimary }}
        >
          Cancel
        </button>
        
        <button
          type="button"
          onClick={handleTestConnection}
          disabled={testing}
          className="px-4 py-2 rounded-lg text-sm flex items-center"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            color: COLORS.textPrimary,
            opacity: testing ? 0.7 : 1
          }}
        >
          {testing ? (
            <>
              <RefreshCw size={16} className="mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Database size={16} className="mr-2" />
              Test Connection
            </>
          )}
        </button>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center"
          style={{ 
            background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.purple})`,
            opacity: isSubmitting ? 0.7 : 1
          }}
        >
          {isSubmitting ? (
            <>
              <RefreshCw size={16} className="mr-2 animate-spin" />
              {currentConnection ? 'Updating...' : 'Saving...'}
            </>
          ) : (
            <>
              <Database size={16} className="mr-2" />
              {currentConnection ? 'Update Connection' : 'Save Connection'}
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
        <h1 className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>Database Connections</h1>
        
        <button
          onClick={() => {
            setCurrentConnection(null);
            setFormData(initialFormState);
            setShowAddModal(true);
            setTestResult(null);
          }}
          className="px-4 py-2 rounded-lg flex items-center text-sm font-medium text-white"
          style={{ background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.purple})` }}
        >
          <Plus size={16} className="mr-2" />
          Add Connection
        </button>
      </div>
      
      {/* Search and Refresh */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={18} color={COLORS.textSecondary} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search connections..."
            className="pl-10 pr-4 py-2 w-full rounded-lg focus:outline-none"
            style={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: COLORS.textPrimary 
            }}
          />
        </div>
        
        <button
          onClick={fetchConnections}
          className="p-2 rounded-lg"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
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
            backgroundColor: 'rgba(248, 113, 113, 0.1)',
            color: COLORS.error,
            border: '1px solid rgba(248, 113, 113, 0.3)'
          }}
        >
          <div className="flex items-center">
            <XCircle size={16} className="mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {/* Connections List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-2" style={{ borderColor: COLORS.primary, borderTopColor: 'transparent' }}></div>
        </div>
      ) : (
        connections.length === 0 ? (
          <motion.div
            className="rounded-lg p-8 text-center mb-6"
            style={glassStyle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Database size={48} className="mx-auto mb-4 opacity-50" color={COLORS.textSecondary} />
            <h2 className="text-xl font-medium mb-2" style={{ color: COLORS.textPrimary }}>No Database Connections</h2>
            <p className="mb-6" style={{ color: COLORS.textSecondary }}>
              You haven't added any database connections yet. Add your first connection to start indexing blockchain data.
            </p>
            <button
              onClick={() => {
                setCurrentConnection(null);
                setFormData(initialFormState);
                setShowAddModal(true);
              }}
              className="px-4 py-2 rounded-lg flex items-center text-sm font-medium text-white mx-auto"
              style={{ background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.purple})` }}
            >
              <Plus size={16} className="mr-2" />
              Add Your First Connection
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConnections.map((connection, index) => (
              <motion.div
                key={connection.id}
                className="rounded-lg overflow-hidden"
                style={glassStyle}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="p-5 border-b border-opacity-10" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <Database size={18} className="mr-3" color={COLORS.primary} />
                      <h3 className="font-medium" style={{ color: COLORS.textPrimary }}>{connection.name}</h3>
                    </div>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="text-xs w-24" style={{ color: COLORS.textSecondary }}>Host:</span>
                      <span className="text-sm flex-1" style={{ color: COLORS.textPrimary }}>{connection.host}</span>
                    </div>
                    <div className="flex">
                      <span className="text-xs w-24" style={{ color: COLORS.textSecondary }}>Port:</span>
                      <span className="text-sm flex-1" style={{ color: COLORS.textPrimary }}>{connection.port}</span>
                    </div>
                    <div className="flex">
                      <span className="text-xs w-24" style={{ color: COLORS.textSecondary }}>Database:</span>
                      <span className="text-sm flex-1" style={{ color: COLORS.textPrimary }}>{connection.database}</span>
                    </div>
                    <div className="flex">
                      <span className="text-xs w-24" style={{ color: COLORS.textSecondary }}>Username:</span>
                      <span className="text-sm flex-1" style={{ color: COLORS.textPrimary }}>{connection.username}</span>
                    </div>
                    <div className="flex">
                      <span className="text-xs w-24" style={{ color: COLORS.textSecondary }}>SSL:</span>
                      <span className="text-sm flex-1" style={{ color: COLORS.textPrimary }}>
                        {connection.sslEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-t border-opacity-10 flex justify-end space-x-2" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <button
                    onClick={() => openEditModal(connection)}
                    className="p-2 rounded-lg transition-colors hover:bg-white/10"
                    style={{ color: COLORS.primary }}
                    title="Edit Connection"
                  >
                    <Edit size={16} />
                  </button>
                  
                  <button
                    onClick={() => openDeleteModal(connection)}
                    className="p-2 rounded-lg transition-colors hover:bg-white/10"
                    style={{ color: COLORS.error }}
                    title="Delete Connection"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}
      
      {/* Add Connection Modal */}
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
              <h2 className="text-xl font-medium" style={{ color: COLORS.textPrimary }}>Add Database Connection</h2>
            </div>
            
            <div className="p-6">
              <ConnectionForm />
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Edit Connection Modal */}
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
              <h2 className="text-xl font-medium" style={{ color: COLORS.textPrimary }}>Edit Database Connection</h2>
            </div>
            
            <div className="p-6">
              <ConnectionForm />
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
              <p className="mb-6" style={{ color: COLORS.textSecondary }}>
                Are you sure you want to delete the "{currentConnection?.name}" database connection? 
                This will affect any indexers using this connection.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setCurrentConnection(null);
                  }}
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: COLORS.textPrimary }}
                >
                  Cancel
                </button>
                
                <button
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
                      Delete Connection
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

export default DatabaseConnections;