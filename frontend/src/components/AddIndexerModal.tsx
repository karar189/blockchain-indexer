//@ts-ignore
//@ts-nocheck
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Database, Cloud, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { COLORS } from '../utils/constants';
import axios from '../api/axiosInstance';

interface AddIndexerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  databaseConnections: DatabaseConnection[];
}

interface DatabaseConnection {
  id: string;
  name: string;
  host: string;
  port: number;
  database: string;
}

// Types of indexers that can be created
type IndexerCategory = 'NFT_BIDS' | 'NFT_PRICES' | 'TOKEN_LOANS' | 'TOKEN_PRICES' | 'CUSTOM';

interface IndexerConfig {
  name: string;
  category: IndexerCategory;
  databaseConnectionId: string;
  configuration: {
    collections?: string[];
    tokens?: string[];
    platforms?: string[];
    marketplaces?: string[];
  };
  customSchema?: any; // For custom indexers
}

const AddIndexerModal: React.FC<AddIndexerModalProps> = ({ isOpen, onClose, onSuccess, databaseConnections }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [indexerConfig, setIndexerConfig] = useState<IndexerConfig>({
    name: '',
    category: 'NFT_PRICES',
    databaseConnectionId: '',
    configuration: {
      collections: [],
      tokens: [],
      platforms: [],
      marketplaces: [],
    }
  });
  
  // New collection/token input state
  const [newItem, setNewItem] = useState('');
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested properties in configuration
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setIndexerConfig({
        ...indexerConfig,
        [parent]: {
          ...indexerConfig[parent as keyof IndexerConfig],
          [child]: value,
        },
      });
    } else {
      setIndexerConfig({
        ...indexerConfig,
        [name]: value,
      });
      
      // Reset configuration when category changes
      if (name === 'category') {
        setIndexerConfig(prev => ({
          ...prev,
          configuration: {
            collections: [],
            tokens: [],
            platforms: [],
            marketplaces: [],
          }
        }));
      }
    }
  };
  
  // Add a new item to an array (collections, tokens, etc.)
  const addItem = (type: 'collections' | 'tokens' | 'platforms' | 'marketplaces') => {
    if (!newItem.trim()) return;
    
    setIndexerConfig(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        [type]: [...(prev.configuration[type] || []), newItem.trim()],
      },
    }));
    
    setNewItem('');
  };
  
  // Remove an item from an array
  const removeItem = (type: 'collections' | 'tokens' | 'platforms' | 'marketplaces', index: number) => {
    setIndexerConfig(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        [type]: prev.configuration[type]?.filter((_, i) => i !== index),
      },
    }));
  };
  
  // Move to next step
  const nextStep = () => {
    if (step === 1 && !indexerConfig.name) {
      setError('Please enter a name for your indexer');
      return;
    }
    
    if (step === 2 && !indexerConfig.databaseConnectionId) {
      setError('Please select a database connection');
      return;
    }
    
    if (step === 3) {
      const configKeys = getConfigKeysForCategory(indexerConfig.category);
      const hasItems = configKeys.some(key => 
        indexerConfig.configuration[key as keyof typeof indexerConfig.configuration]?.length > 0
      );
      
      if (!hasItems) {
        setError(`Please add at least one item to track for your ${indexerConfig.category.replace('_', ' ').toLowerCase()}`);
        return;
      }
    }
    
    setError(null);
    setStep(prev => prev + 1);
  };
  
  // Go back to previous step
  const prevStep = () => {
    setError(null);
    setStep(prev => prev - 1);
  };
  
  // Get the configuration keys needed for the selected category
  const getConfigKeysForCategory = (category: IndexerCategory) => {
    switch (category) {
      case 'NFT_BIDS':
      case 'NFT_PRICES':
        return ['collections', 'marketplaces'];
      case 'TOKEN_LOANS':
        return ['tokens', 'platforms'];
      case 'TOKEN_PRICES':
        return ['tokens', 'platforms'];
      case 'CUSTOM':
        return ['collections', 'tokens', 'platforms', 'marketplaces'];
      default:
        return [];
    }
  };
  
  // Submit the form
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await axios.post('/indexer', indexerConfig);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create indexer. Please try again.');
      setStep(1); // Go back to first step on error
    } finally {
      setLoading(false);
    }
  };
  
  // Get a human-readable title for the selected category
  const getCategoryTitle = (category: IndexerCategory) => {
    switch (category) {
      case 'NFT_BIDS':
        return 'NFT Bids Monitor';
      case 'NFT_PRICES':
        return 'NFT Price Tracker';
      case 'TOKEN_LOANS':
        return 'Token Loan Tracker';
      case 'TOKEN_PRICES':
        return 'Token Price Monitor';
      case 'CUSTOM':
        return 'Custom Indexer';
      default:
        return 'Indexer';
    }
  };
  
  // Determine which configuration fields to show based on category
  const getConfigFields = () => {
    const configKeys = getConfigKeysForCategory(indexerConfig.category);
    
    return (
      <div className="space-y-6">
        {configKeys.includes('collections') && (
          <div>
            <label className="block text-sm mb-2" style={{ color: COLORS.textSecondary }}>
              NFT Collections to Monitor (Addresses)
            </label>
            <div className="flex mb-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Enter collection address"
                className="flex-1 py-2 px-3 rounded-l-lg focus:outline-none"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: COLORS.textPrimary 
                }}
              />
              <button
                onClick={() => addItem('collections')}
                className="px-4 py-2 rounded-r-lg text-white"
                style={{ background: COLORS.primary }}
              >
                Add
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {indexerConfig.configuration.collections?.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                  <span className="text-sm truncate" style={{ color: COLORS.textPrimary }}>{item}</span>
                  <button
                    onClick={() => removeItem('collections', index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {configKeys.includes('tokens') && (
          <div>
            <label className="block text-sm mb-2" style={{ color: COLORS.textSecondary }}>
              Tokens to Monitor (Addresses)
            </label>
            <div className="flex mb-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Enter token address"
                className="flex-1 py-2 px-3 rounded-l-lg focus:outline-none"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: COLORS.textPrimary 
                }}
              />
              <button
                onClick={() => addItem('tokens')}
                className="px-4 py-2 rounded-r-lg text-white"
                style={{ background: COLORS.primary }}
              >
                Add
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {indexerConfig.configuration.tokens?.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                  <span className="text-sm truncate" style={{ color: COLORS.textPrimary }}>{item}</span>
                  <button
                    onClick={() => removeItem('tokens', index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {configKeys.includes('platforms') && (
          <div>
            <label className="block text-sm mb-2" style={{ color: COLORS.textSecondary }}>
              {indexerConfig.category === 'TOKEN_LOANS' ? 'Lending Platforms' : 'Trading Platforms'}
            </label>
            <div className="flex mb-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Enter platform address"
                className="flex-1 py-2 px-3 rounded-l-lg focus:outline-none"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: COLORS.textPrimary 
                }}
              />
              <button
                onClick={() => addItem('platforms')}
                className="px-4 py-2 rounded-r-lg text-white"
                style={{ background: COLORS.primary }}
              >
                Add
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {indexerConfig.configuration.platforms?.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                  <span className="text-sm truncate" style={{ color: COLORS.textPrimary }}>{item}</span>
                  <button
                    onClick={() => removeItem('platforms', index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {configKeys.includes('marketplaces') && (
          <div>
            <label className="block text-sm mb-2" style={{ color: COLORS.textSecondary }}>
              NFT Marketplaces
            </label>
            <div className="flex mb-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Enter marketplace address"
                className="flex-1 py-2 px-3 rounded-l-lg focus:outline-none"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: COLORS.textPrimary 
                }}
              />
              <button
                onClick={() => addItem('marketplaces')}
                className="px-4 py-2 rounded-r-lg text-white"
                style={{ background: COLORS.primary }}
              >
                Add
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {indexerConfig.configuration.marketplaces?.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                  <span className="text-sm truncate" style={{ color: COLORS.textPrimary }}>{item}</span>
                  <button
                    onClick={() => removeItem('marketplaces', index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Glassmorphism style
  const glassStyle = {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    boxShadow: "0 8px 32px 0 rgba(10, 35, 83, 0.37)"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black/50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-2xl rounded-xl overflow-hidden"
            style={glassStyle}
          >
            {/* Header */}
            <div className="p-5 flex justify-between items-center border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <h2 className="text-xl font-medium" style={{ color: COLORS.textPrimary }}>
                {step === 4 ? 'Confirm Indexer Configuration' : `Add New Indexer - Step ${step} of 4`}
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={20} color={COLORS.textSecondary} />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {/* Error message */}
              {error && (
                <div className="mb-6 p-4 rounded-lg text-sm bg-red-900/20 text-red-400 border border-red-900/30">
                  {error}
                </div>
              )}
              
              {/* Progress indicator */}
              <div className="mb-6 flex justify-between">
                {[1, 2, 3, 4].map((stepNumber) => (
                  <div 
                    key={stepNumber}
                    className={`flex items-center ${stepNumber < 4 ? 'flex-1' : ''}`}
                  >
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        stepNumber <= step 
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' 
                          : 'bg-white/10 text-gray-400'
                      }`}
                    >
                      {stepNumber}
                    </div>
                    {stepNumber < 4 && (
                      <div 
                        className="h-1 flex-1 mx-2"
                        style={{ 
                          background: stepNumber < step 
                            ? `linear-gradient(to right, ${COLORS.purple}, ${COLORS.primary})` 
                            : 'rgba(255, 255, 255, 0.1)' 
                        }}
                      ></div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div>
                  <div className="mb-6">
                    <label className="block text-sm mb-2" style={{ color: COLORS.textSecondary }}>
                      Indexer Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={indexerConfig.name}
                      onChange={handleChange}
                      placeholder="e.g., Mad Lads Tracker"
                      className="w-full py-2 px-3 rounded-lg focus:outline-none"
                      style={{ 
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: COLORS.textPrimary 
                      }}
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm mb-2" style={{ color: COLORS.textSecondary }}>
                      Indexer Type
                    </label>
                    <select
                      name="category"
                      value={indexerConfig.category}
                      onChange={handleChange}
                      className="w-full py-2 px-3 rounded-lg focus:outline-none"
                      style={{ 
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: COLORS.textPrimary 
                      }}
                    >
                      <option value="NFT_PRICES">NFT Prices</option>
                      <option value="NFT_BIDS">NFT Bids</option>
                      <option value="TOKEN_LOANS">Token Loans</option>
                      <option value="TOKEN_PRICES">Token Prices</option>
                      <option value="CUSTOM">Custom</option>
                    </select>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                      What will be indexed:
                    </h3>
                    <div className="p-4 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                      <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                        {indexerConfig.category === 'NFT_PRICES' && 
                          "Track real-time NFT sales, listings, and price history across marketplaces."
                        }
                        {indexerConfig.category === 'NFT_BIDS' && 
                          "Monitor active NFT bids and offers across collections and marketplaces."
                        }
                        {indexerConfig.category === 'TOKEN_LOANS' && 
                          "Track token lending data including loan creation, repayments, and liquidations."
                        }
                        {indexerConfig.category === 'TOKEN_PRICES' && 
                          "Monitor real-time token prices and trading data across various DEXs and platforms."
                        }
                        {indexerConfig.category === 'CUSTOM' && 
                          "Create a custom indexer with your own configuration and schema."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 2: Database Connection */}
              {step === 2 && (
                <div>
                  <div className="mb-6">
                    <label className="block text-sm mb-2" style={{ color: COLORS.textSecondary }}>
                      Select Database Connection
                    </label>
                    
                    {databaseConnections.length > 0 ? (
                      <div className="space-y-3">
                        {databaseConnections.map((connection) => (
                          <div 
                            key={connection.id}
                            className={`p-4 rounded-lg cursor-pointer transition-all ${
                              indexerConfig.databaseConnectionId === connection.id 
                                ? 'border-2' 
                                : 'border'
                            }`}
                            style={{ 
                              background: 'rgba(255, 255, 255, 0.05)',
                              borderColor: indexerConfig.databaseConnectionId === connection.id 
                                ? COLORS.primary 
                                : 'rgba(255, 255, 255, 0.1)'
                            }}
                            onClick={() => setIndexerConfig({
                              ...indexerConfig,
                              databaseConnectionId: connection.id,
                            })}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Database size={18} className="mr-3" color={COLORS.cyan} />
                                <div>
                                  <h3 className="font-medium" style={{ color: COLORS.textPrimary }}>
                                    {connection.name}
                                  </h3>
                                  <p className="text-xs" style={{ color: COLORS.textSecondary }}>
                                    {connection.host}:{connection.port} / {connection.database}
                                  </p>
                                </div>
                              </div>
                              
                              {indexerConfig.databaseConnectionId === connection.id && (
                                <CheckCircle size={18} color={COLORS.primary} />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 rounded-lg text-center" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                        <Database size={24} className="mx-auto mb-2 opacity-50" color={COLORS.textSecondary} />
                        <p className="mb-4" style={{ color: COLORS.textSecondary }}>
                          No database connections found. You need to create one first.
                        </p>
                        <button
                          onClick={() => {
                            onClose();
                            // Navigate to database connections page
                            window.location.href = '/database';
                          }}
                          className="px-4 py-2 rounded-lg text-white text-sm"
                          style={{ background: COLORS.primary }}
                        >
                          Add Database Connection
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Step 3: Configuration */}
              {step === 3 && (
                <div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                      Configure {getCategoryTitle(indexerConfig.category)}
                    </h3>
                    <p className="text-sm mb-4" style={{ color: COLORS.textSecondary }}>
                      {indexerConfig.category === 'NFT_PRICES' && 
                        "Add the NFT collections and marketplaces you want to track prices for."
                      }
                      {indexerConfig.category === 'NFT_BIDS' && 
                        "Add the NFT collections and marketplaces you want to track bids for."
                      }
                      {indexerConfig.category === 'TOKEN_LOANS' && 
                        "Add the tokens and lending platforms you want to track loans for."
                      }
                      {indexerConfig.category === 'TOKEN_PRICES' && 
                        "Add the tokens and trading platforms you want to track prices for."
                      }
                      {indexerConfig.category === 'CUSTOM' && 
                        "Add all the items you want to track with your custom indexer."
                      }
                    </p>
                  </div>
                  
                  {getConfigFields()}
                </div>
              )}
              
              {/* Step 4: Confirmation */}
              {step === 4 && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-4" style={{ color: COLORS.textPrimary }}>
                      Review Your Indexer Configuration
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                        <h4 className="text-xs font-medium mb-2" style={{ color: COLORS.textSecondary }}>
                          Basic Information
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs" style={{ color: COLORS.textSecondary }}>Name</p>
                            <p className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>
                              {indexerConfig.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: COLORS.textSecondary }}>Type</p>
                            <p className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>
                              {getCategoryTitle(indexerConfig.category)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                        <h4 className="text-xs font-medium mb-2" style={{ color: COLORS.textSecondary }}>
                          Database Connection
                        </h4>
                        {databaseConnections.map(connection => 
                          connection.id === indexerConfig.databaseConnectionId && (
                            <div key={connection.id}>
                              <p className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>
                                {connection.name}
                              </p>
                              <p className="text-xs" style={{ color: COLORS.textSecondary }}>
                                {connection.host}:{connection.port} / {connection.database}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                      
                      <div className="p-4 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                        <h4 className="text-xs font-medium mb-2" style={{ color: COLORS.textSecondary }}>
                          Tracking Configuration
                        </h4>
                        
                        {indexerConfig.configuration.collections?.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs mb-1" style={{ color: COLORS.textSecondary }}>Collections ({indexerConfig.configuration.collections.length})</p>
                            <div className="flex flex-wrap gap-2">
                              {indexerConfig.configuration.collections.map((item, i) => (
                                <span 
                                  key={i} 
                                  className="text-xs py-1 px-2 rounded-full" 
                                  style={{ 
                                    background: 'rgba(91, 88, 235, 0.2)',
                                    color: COLORS.primary
                                  }}
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {indexerConfig.configuration.tokens?.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs mb-1" style={{ color: COLORS.textSecondary }}>Tokens ({indexerConfig.configuration.tokens.length})</p>
                            <div className="flex flex-wrap gap-2">
                              {indexerConfig.configuration.tokens.map((item, i) => (
                                <span 
                                  key={i} 
                                  className="text-xs py-1 px-2 rounded-full" 
                                  style={{ 
                                    background: 'rgba(91, 88, 235, 0.2)',
                                    color: COLORS.primary
                                  }}
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {indexerConfig.configuration.platforms?.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs mb-1" style={{ color: COLORS.textSecondary }}>Platforms ({indexerConfig.configuration.platforms.length})</p>
                            <div className="flex flex-wrap gap-2">
                              {indexerConfig.configuration.platforms.map((item, i) => (
                                <span 
                                  key={i} 
                                  className="text-xs py-1 px-2 rounded-full" 
                                  style={{ 
                                    background: 'rgba(91, 88, 235, 0.2)',
                                    color: COLORS.primary
                                  }}
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {indexerConfig.configuration.marketplaces?.length > 0 && (
                          <div>
                            <p className="text-xs mb-1" style={{ color: COLORS.textSecondary }}>Marketplaces ({indexerConfig.configuration.marketplaces.length})</p>
                            <div className="flex flex-wrap gap-2">
                              {indexerConfig.configuration.marketplaces.map((item, i) => (
                                <span 
                                  key={i} 
                                  className="text-xs py-1 px-2 rounded-full" 
                                  style={{ 
                                    background: 'rgba(91, 88, 235, 0.2)',
                                    color: COLORS.primary
                                  }}
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm mb-4" style={{ color: COLORS.textSecondary }}>
                      Once created, your indexer will automatically start tracking blockchain data according to your configuration. 
                      All indexed data will be saved to your selected database.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-5 flex justify-between items-center border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <button
                onClick={step > 1 ? prevStep : onClose}
                className="px-4 py-2 rounded-lg text-sm transition-colors"
                style={{ 
                  color: COLORS.textPrimary,
                  background: 'rgba(255, 255, 255, 0.05)'
                }}
              >
                {step > 1 ? 'Back' : 'Cancel'}
              </button>
              
              <button
                onClick={step < 4 ? nextStep : handleSubmit}
                disabled={loading}
                className="px-4 py-2 rounded-lg text-sm text-white font-medium flex items-center"
                style={{ 
                  background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.purple})`,
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    {step < 4 ? 'Next' : 'Create Indexer'}
                    {step < 4 && <ChevronRight size={16} className="ml-1" />}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddIndexerModal;