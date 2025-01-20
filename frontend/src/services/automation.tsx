import apiClient from '@/lib/api-client';
import { AutomationRuleCreate, AutomationRuleUpdate } from '@/types/automation';

class AutomationService {
  createAutomationRule(data: AutomationRuleCreate) {
    return apiClient.post('/controller/automation_rules', data);
  }

  updateAutomationRule(ruleId: number, data: AutomationRuleUpdate) {
    return apiClient.put(`/controller/automation_rules/${ruleId}`, data);
  }

  deleteAutomationRule(ruleId: number) {
    return apiClient.delete(`/controller/automation_rules/${ruleId}`);
  }

  toggleAutomationRule(ruleId: number) {
    return apiClient.patch(`/controller/automation_rules/${ruleId}/toggle`);
  }

  getAutomationRules() {
    return apiClient.get('/controller/automation_rules');
  }

  getAutomationRule(ruleId: number) {
    return apiClient.get(`/controller/automation_rules/${ruleId}`);
  }
}

export const automationService = new AutomationService();
