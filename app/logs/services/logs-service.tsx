import { api } from "@/public/services/api";

export interface ActivityLog {
  id: number;
  user_id: number | null;
  activity: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  updated_at: string;
  status: string;
  candidate_id: number | null;
  test_id: number | null;
  question_id: number | null;
  question_type: string | null;
  entity_type: string | null;
  entity_id: number | null;
  user?: {
    id: number;
    name: string;
  } | null;
  candidate?: {
    id: number;
    name: string;
  } | null;
  test?: {
    id: number;
    name: string;
  } | null;
}

export interface LogsFilters {
  user_id?: number;
  candidate_id?: number;
  test_id?: number;
  question_type?: string;
  entity_type?: string;
  status?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
}

export const logsService = {
  async getLogs(filters: LogsFilters = {}): Promise<ActivityLog[]> {
    try {
      const params = new URLSearchParams();
      
      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get<ActivityLog[]>(`/activity-logs-public?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw new Error('Gagal mengambil data logs');
    }
  },

  async exportLogs(filters: LogsFilters = {}): Promise<void> {
    try {
      const params = new URLSearchParams();
      
      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/activity-logs-public/export?${params.toString()}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `activity_logs_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting logs:', error);
      throw new Error('Gagal export logs');
    }
  },

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  },

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  getActivityType(activity: string): string {
    if (activity.includes('login') || activity.includes('logged in')) {
      return 'Authentication';
    } else if (activity.includes('dashboard')) {
      return 'Dashboard';
    } else if (activity.includes('test') && activity.includes('package')) {
      return 'Test Package';
    } else if (activity.includes('test') && activity.includes('distribution')) {
      return 'Test Distribution';
    } else if (activity.includes('candidate')) {
      return 'Candidate';
    } else if (activity.includes('user')) {
      return 'User Management';
    } else if (activity.includes('result')) {
      return 'Results';
    } else {
      return 'Other';
    }
  }
};

