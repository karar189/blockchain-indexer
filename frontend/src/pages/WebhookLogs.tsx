import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Clock, Filter, ArrowDownToLine, CheckCircle2 } from 'lucide-react';
import { COLORS } from '../utils/constants';
import MainLayout from '../layouts/MainLayout';

interface WebhookLog {
  id: string;
  timestamp: string;
  message: string;
  status: 'success' | 'error' | 'skipped';
  indexerId?: string;
  webhookId?: string;
}

const WebhookLogs = () => {
  const { id } = useParams<{ id: string }>();
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFrame, setTimeFrame] = useState<'5m' | '30m' | '60m'>('5m');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const glassStyle = {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    boxShadow: "0 8px 32px 0 rgba(10, 35, 83, 0.37)",
  };

  // Mock data generator function
  const generateMockLogs = () => {
    const now = new Date();
    const mockData: WebhookLog[] = [];
    
    // Simulating logs going back in time
    for (let i = 0; i < 15; i++) {
      const timestamp = new Date(now.getTime() - (i * 5000));
      const formattedTime = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')} ${String(timestamp.getHours()).padStart(2, '0')}:${String(timestamp.getMinutes()).padStart(2, '0')}:${String(timestamp.getSeconds()).padStart(2, '0')}.${String(timestamp.getMilliseconds()).padStart(3, '0')}`;
      
      // Alternate between different log types
      const logTypes = [
        { 
          message: 'Received webhook event: {"type":"SWAP","signature":"abc123","events":[...]}', 
          status: 'success' 
        },
        { 
          message: 'Transforming data for TOKEN_PRICES indexer: Found 2 relevant events', 
          status: 'success' 
        },
        { 
          message: 'Inserted 2 records into token_prices table', 
          status: 'success' 
        },
        { 
          message: 'Updated indexer Greok v4: processed 2 events, new total: 128', 
          status: 'success' 
        },
        { 
          message: 'Skipping webhook post due to too many failed attempts', 
          status: 'skipped' 
        },
        { 
          message: 'Error processing webhook: TypeError: Cannot read property \'mint\' of undefined', 
          status: 'error' 
        }
      ];
      
      const logType = logTypes[i % logTypes.length];
      
      mockData.push({
        id: `log-${i}`,
        timestamp: formattedTime,
        message: logType.message,
        status: logType.status as any,
        indexerId: id,
        webhookId: '61780571-d5d2-46cc-a8bb-23026b8aae61'
      });
    }
    
    return mockData;
  };

  // Initial load of logs
  useEffect(() => {
    setLoading(true);
    // Simulating API call
    setTimeout(() => {
      try {
        const mockLogs = generateMockLogs();
        setLogs(mockLogs);
        setError(null);
      } catch (err: any) {
        setError('Failed to load webhook logs');
        console.error('Error fetching logs:', err);
      } finally {
        setLoading(false);
      }
    }, 800);
  }, [id, timeFrame]);

  // Auto-refresh logs every 2 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      const prevLogs = [...logs];
      const now = new Date();
      const formattedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;
      
      // Rotate between different log types for new entries
      const logTypes = [
        { 
          message: 'Received webhook event: {"type":"SWAP","signature":"xyz456","events":[...]}', 
          status: 'success' 
        },
        { 
          message: 'Transforming data for TOKEN_PRICES indexer: Found 1 relevant event', 
          status: 'success' 
        },
        { 
          message: 'Skipping webhook post due to too many failed attempts', 
          status: 'skipped' 
        }
      ];
      
      const randomIndex = Math.floor(Math.random() * logTypes.length);
      const newLog = {
        id: `log-${now.getTime()}`,
        timestamp: formattedTime,
        message: logTypes[randomIndex].message,
        status: logTypes[randomIndex].status as any,
        indexerId: id,
        webhookId: '61780571-d5d2-46cc-a8bb-23026b8aae61'
      };
      
      // Add at beginning and limit to 15 logs
      setLogs([newLog, ...prevLogs.slice(0, 14)]);
    }, 2000);

    return () => clearInterval(interval);
  }, [logs, autoRefresh, id]);

  const handleTimeFrameChange = (newTimeFrame: '5m' | '30m' | '60m') => {
    setTimeFrame(newTimeFrame);
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  if (loading && logs.length === 0) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-2" style={{ borderColor: COLORS.accent, borderTopColor: 'transparent' }}></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link to={id ? `/indexers/${id}` : "/"} className="mr-4 p-2 rounded-lg hover:bg-white/10" style={{ color: COLORS.textSecondary }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>Webhook Logs</h1>
            <p style={{ color: COLORS.textSecondary }}>Greok v4 - Token Price Monitor</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 rounded-lg flex items-center text-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <Clock size={14} className="mr-2" style={{ color: COLORS.textSecondary }} />
            <span style={{ color: COLORS.textSecondary }}>Auto-refresh:</span>
            <button
              onClick={toggleAutoRefresh}
              className="ml-2 px-2 py-0.5 rounded text-xs font-medium"
              style={{ 
                backgroundColor: autoRefresh ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)',
                color: autoRefresh ? COLORS.success : COLORS.error
              }}
            >
              {autoRefresh ? 'ON' : 'OFF'}
            </button>
          </div>
          
          <button
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLogs(generateMockLogs());
                setLoading(false);
              }, 500);
            }}
            className="px-4 py-2 rounded-lg flex items-center text-sm font-medium"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: COLORS.textPrimary }}
            disabled={loading}
          >
            <RefreshCw size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <div className="flex bg-opacity-10 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <button
              onClick={() => handleTimeFrameChange('5m')}
              className={`px-3 py-2 text-sm ${timeFrame === '5m' ? 'font-medium' : ''}`}
              style={{ 
                backgroundColor: timeFrame === '5m' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: timeFrame === '5m' ? COLORS.textPrimary : COLORS.textSecondary,
                borderRadius: '0.5rem 0 0 0.5rem'
              }}
            >
              5m
            </button>
            <button
              onClick={() => handleTimeFrameChange('30m')}
              className={`px-3 py-2 text-sm ${timeFrame === '30m' ? 'font-medium' : ''}`}
              style={{ 
                backgroundColor: timeFrame === '30m' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: timeFrame === '30m' ? COLORS.textPrimary : COLORS.textSecondary
              }}
            >
              30m
            </button>
            <button
              onClick={() => handleTimeFrameChange('60m')}
              className={`px-3 py-2 text-sm ${timeFrame === '60m' ? 'font-medium' : ''}`}
              style={{ 
                backgroundColor: timeFrame === '60m' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: timeFrame === '60m' ? COLORS.textPrimary : COLORS.textSecondary,
                borderRadius: '0 0.5rem 0.5rem 0'
              }}
            >
              60m
            </button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="rounded-lg p-6 mb-6" style={{ backgroundColor: 'rgba(248, 113, 113, 0.1)', borderLeft: `4px solid ${COLORS.error}` }}>
          <h2 className="text-lg font-medium mb-2" style={{ color: COLORS.textPrimary }}>Error Loading Logs</h2>
          <p style={{ color: COLORS.textSecondary }}>{error}</p>
        </div>
      )}
      
      <motion.div
        className="rounded-lg mb-6 overflow-hidden"
        style={glassStyle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-5 border-b border-opacity-10 flex justify-between items-center" style={{ borderColor: COLORS.glassBorder }}>
          <h2 className="text-lg font-medium" style={{ color: COLORS.textPrimary }}>Webhook Logs</h2>
          <p className="text-sm" style={{ color: COLORS.textSecondary }}>
            Note: we currently only show logs for failed webhook posts.
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${COLORS.glassBorder}` }}>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.textSecondary }}>
                  Timestamp
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.textSecondary }}>
                  Message
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className="hover:bg-white/5"
                  style={{ borderBottom: index < logs.length - 1 ? `1px solid ${COLORS.glassBorder}` : 'none' }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm" style={{ color: COLORS.textSecondary }}>
                      {log.timestamp.split(' ')[1]}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start">
                      {log.status === 'success' && (
                        <CheckCircle2 size={16} className="mt-0.5 mr-2 flex-shrink-0" style={{ color: COLORS.success }} />
                      )}
                      {log.status === 'error' && (
                        <div className="w-4 h-4 rounded-full mt-0.5 mr-2 flex-shrink-0" style={{ backgroundColor: COLORS.error }}></div>
                      )}
                      {log.status === 'skipped' && (
                        <div className="w-4 h-4 rounded-full mt-0.5 mr-2 flex-shrink-0" style={{ backgroundColor: COLORS.warning }}></div>
                      )}
                      <span 
                        className="text-sm" 
                        style={{ 
                          color: log.status === 'error' 
                            ? COLORS.error 
                            : log.status === 'skipped' 
                              ? COLORS.warning 
                              : COLORS.textPrimary 
                        }}
                      >
                        {log.message}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default WebhookLogs;