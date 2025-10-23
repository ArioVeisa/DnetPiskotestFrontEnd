import { useState, useEffect } from 'react';
import { logsService, ActivityLog, LogsFilters } from '../services/logs-service';

export const useLogs = (filters: LogsFilters = {}) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await logsService.getLogs(filters);
      setLogs(data);
    } catch (err) {
      console.error('Error in useLogs:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [JSON.stringify(filters)]);

  const refreshLogs = () => {
    fetchLogs();
  };

  return {
    logs,
    loading,
    error,
    refreshLogs
  };
};
