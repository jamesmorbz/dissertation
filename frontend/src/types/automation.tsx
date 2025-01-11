export interface AutomationRuleCreate {
  hardware_name: string;
  action: string;
  trigger_type: string;
  value: string;
  active?: boolean;
}

export interface AutomationRuleUpdate {
  hardware_name?: string;
  action?: string;
  trigger_type?: string;
  value?: string;
  active?: boolean;
}
