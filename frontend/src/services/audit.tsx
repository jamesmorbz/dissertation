import apiClient from '@/lib/api-client';

class AuditService {
  getNotifications() {
    return apiClient.get('/user/notifications');
  }

  markNotificationsRead() {
    return apiClient.post('/user/notifications/mark-all-read');
  }

  getAuditLogs() {
    return apiClient.get('/user/audit');
  }
}

export const auditService = new AuditService();
