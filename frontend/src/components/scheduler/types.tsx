export interface Rule {
  id: number;
  device_name: string;
  action: string;
  time: string;
  schedule: Schedule[];
}

export interface NewRule {
  device_name: string;
  action: string;
  time: string;
  schedule: Schedule[];
}

export interface RuleTableProps {
  rules: Rule[];
}

export interface AddRuleFormProps {
  onAddRule: (rule: {
    device_name: string;
    action: string;
    time: string;
    schedule: Schedule[];
  }) => void;
}

export enum Schedule {
  MON = "Monday",
  TUE = "Tuesday",
  WED = "Wednesday",
  THU = "Thursday",
  FRI = "Friday",
  SAT = "Saturday",
  SUN = "Sunday",
}
