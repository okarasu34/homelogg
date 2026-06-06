import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Types
export interface Property {
  id: string;
  user_id: string;
  address: string;
  city: string;
  size_m2?: number;
  build_year?: number;
  home_score?: number;
  energy_score?: number;
  created_at: string;
}

export interface MaintenanceRecord {
  id: string;
  property_id: string;
  title: string;
  date: string;
  cost?: number;
  category: string;
  notes?: string;
  photo_url?: string;
  source: 'manual' | 'scan' | 'email' | 'bank';
  created_at: string;
}

export interface Device {
  id: string;
  property_id: string;
  name: string;
  brand?: string;
  installed_year?: string;
  warranty_until?: string;
  status: 'good' | 'warn' | 'fault';
  icon?: string;
  created_at: string;
}

export interface Document {
  id: string;
  property_id: string;
  name: string;
  type: string;
  date: string;
  file_url?: string;
  created_at: string;
}
