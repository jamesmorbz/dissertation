export type Device = {
  hardware_name: string;
  friendly_name: string | null;
  room: string;
  tag: string;
  power: boolean | null;
  last_usage: number;
  uptime?: number;
  wifi_rssi?: number;
  wifi_signal?: number;
  wifi_name?: string;
};
