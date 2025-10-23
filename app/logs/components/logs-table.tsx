"use client";

import { useState } from "react";
import { ActivityLog } from "../services/logs-service";
import { logsService } from "../services/logs-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Search, Filter } from "lucide-react";

interface LogsTableProps {
  logs: ActivityLog[];
  loading: boolean;
  onRefresh: () => void;
  onFiltersChange: (filters: any) => void;
}

export function LogsTable({ logs, loading, onRefresh, onFiltersChange }: LogsTableProps) {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    activity_type: 'all'
  });

  const handleFilterChange = (key: string, value: string) => {
    // Convert "all" back to empty string for API
    const apiValue = value === 'all' ? '' : value;
    const newFilters = { ...filters, [key]: value };
    const apiFilters = { ...filters, [key]: apiValue };
    setFilters(newFilters);
    onFiltersChange(apiFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { search: '', status: 'all', activity_type: 'all' };
    const apiFilters = { search: '', status: '', activity_type: '' };
    setFilters(clearedFilters);
    onFiltersChange(apiFilters);
  };

  const getActivityType = (activity: string) => {
    return logsService.getActivityType(activity);
  };

  const getStatusColor = (status: string) => {
    return logsService.getStatusColor(status);
  };

  const formatDate = (dateString: string) => {
    return logsService.formatDate(dateString);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search activity..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.activity_type} onValueChange={(value) => handleFilterChange('activity_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Activity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Authentication">Authentication</SelectItem>
                <SelectItem value="Dashboard">Dashboard</SelectItem>
                <SelectItem value="Test Package">Test Package</SelectItem>
                <SelectItem value="Test Distribution">Test Distribution</SelectItem>
                <SelectItem value="Candidate">Candidate</SelectItem>
                <SelectItem value="User Management">User Management</SelectItem>
                <SelectItem value="Results">Results</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button onClick={clearFilters} variant="outline" size="sm">
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button onClick={onRefresh} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          Total: {logs.length} logs
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Agent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Related Data
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-4 text-center text-gray-500">
                      Loading logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-4 text-center text-gray-500">
                      No logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        #{log.id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={log.activity}>
                          {log.activity}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {getActivityType(log.activity)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {log.user ? log.user.name : 'System'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {log.ip_address}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-xs">
                        <div className="truncate" title={log.user_agent}>
                          {log.user_agent ? (
                            log.user_agent.includes('Mozilla') ? 'Browser' :
                            log.user_agent.includes('curl') ? 'API Call' :
                            log.user_agent.includes('Postman') ? 'Postman' :
                            'Other'
                          ) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <div className="space-y-1">
                          {log.candidate && (
                            <div className="text-xs">
                              <span className="font-medium">Candidate:</span> {log.candidate.name}
                            </div>
                          )}
                          {log.test && (
                            <div className="text-xs">
                              <span className="font-medium">Test:</span> {log.test.name}
                            </div>
                          )}
                          {log.question_type && (
                            <div className="text-xs">
                              <span className="font-medium">Q Type:</span> {log.question_type}
                            </div>
                          )}
                          {log.entity_type && (
                            <div className="text-xs">
                              <span className="font-medium">Entity:</span> {log.entity_type}
                            </div>
                          )}
                          {!log.candidate && !log.test && !log.question_type && !log.entity_type && (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          <div>{formatDate(log.created_at)}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(log.created_at).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
