import { useState, useEffect } from "react";
import {
  getDashboardData,
  convertApiDataToStats,
  convertApiDataToActivities,
  getStats,
  getLatestTests,
  getQuickActions,
  StatCard,
  TestActivity,
  QuickAction,
} from "../services/dashboard-service";

export function useDashboard() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [activities, setActivities] = useState<TestActivity[]>([]);
  const [actions, setActions] = useState<QuickAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Coba ambil data dari API
        const apiData = await getDashboardData();
        
        if (apiData.success) {
          setStats(convertApiDataToStats(apiData.data));
          setActivities(convertApiDataToActivities(apiData.data));
        } else {
          // Fallback ke dummy data jika API gagal
          setStats(getStats());
          setActivities(getLatestTests());
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : "Gagal mengambil data dashboard");
        
        // Fallback ke dummy data
        setStats(getStats());
        setActivities(getLatestTests());
      } finally {
        // Quick actions selalu menggunakan static data
        setActions(getQuickActions());
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { stats, activities, actions, loading, error };
}
