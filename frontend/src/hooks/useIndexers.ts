import { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';

export interface Indexer {
  id: string;
  name: string;
  category: string;
  status: string;
  eventsPerMinute?: number;
  eventsProcessed?: number;
}

interface Stats {
  activeIndexers: number;
  eventsProcessed: number;
  errorRate: number;
}

export const useIndexers = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    activeIndexers: 0,
    eventsProcessed: 0,
    errorRate: 0,
  });
  const [indexers, setIndexers] = useState<Indexer[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch indexers
      const response = await axios.get("/indexer");
      const indexerData = response.data || [];

      setIndexers(indexerData);

      // Calculate stats
      const activeCount = 
        indexerData.filter((i: Indexer) => i.status === "ACTIVE").length || 0;
      const totalEvents =
        indexerData.reduce((sum: number, i: Indexer) => sum + (i.eventsProcessed || 0), 0) || 0;
      const errorsCount = indexerData.filter(
        (i: Indexer) => i.status === "ERROR"
      ).length;
      const errorRate =
        indexerData.length > 0
          ? ((errorsCount / indexerData.length) * 100).toFixed(2)
          : 0;

      setStats({
        activeIndexers: activeCount,
        eventsProcessed: totalEvents,
        errorRate: errorRate as unknown as number,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      // Fallback mock data for display purposes
      setStats({
        activeIndexers: 4,
        eventsProcessed: 1200000,
        errorRate: 0.01,
      });

      setIndexers([
        {
          id: "1",
          name: "NFT Price Tracker",
          category: "NFT_PRICES",
          status: "ACTIVE",
          eventsPerMinute: 245,
        },
        {
          id: "2",
          name: "Token Market Data",
          category: "TOKEN_PRICES",
          status: "ACTIVE",
          eventsPerMinute: 372,
        },
        {
          id: "3",
          name: "Loan Tracker",
          category: "TOKEN_LOANS",
          status: "ERROR",
          eventsPerMinute: 0,
        },
        {
          id: "4",
          name: "NFT Bids Monitor",
          category: "NFT_BIDS",
          status: "ACTIVE",
          eventsPerMinute: 157,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateIndexer = async (id: string) => {
    try {
      await axios.post(`/indexer/${id}/activate`);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error("Error activating indexer:", error);
    }
  };

  const handleDeactivateIndexer = async (id: string) => {
    try {
      await axios.post(`/indexer/${id}/deactivate`);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error("Error deactivating indexer:", error);
    }
  };

  return {
    loading,
    stats,
    indexers,
    activateIndexer: handleActivateIndexer,
    deactivateIndexer: handleDeactivateIndexer,
  };
};