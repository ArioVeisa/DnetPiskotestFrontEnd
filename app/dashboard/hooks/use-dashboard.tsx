import { useState, useEffect } from "react";
import {
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

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setStats(getStats());
      setActivities(getLatestTests());
      setActions(getQuickActions());
      setLoading(false);
    }, 500);
  }, []);

  return { stats, activities, actions, loading };
}
