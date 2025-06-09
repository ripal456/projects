export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  energy_usages: [];
}

export interface EnergyUsage {
  id: number;
  energyUsage_id: number;
  kwh_consumed: number;
  date: string;
  device_type: string | null;
  location: string | null;
  user_id: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface ErrorResponse {
  error: string;
  message: string | string[];
}
export interface EnergyUsagePayload {
  user_id: number;
  kwh_consumed: number;
  date: string;
  device_type?: string | null; // Optional fields
  location?: string | null; // Optional fields
}
