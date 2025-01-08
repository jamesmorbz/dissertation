export type Notification = {
  id: string;
  message: string;
  timestamp: Date;
  read: boolean;
};

export type AuditLog = {
  timestamp: string;
  user_id: number;
  details: string;
  action_type: string;
  id: number;
  log: string;
  device: string;
};
