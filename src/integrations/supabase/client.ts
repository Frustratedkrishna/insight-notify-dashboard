
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://oimjhwhxxzuiqtxvxcrs.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pbWpod2h4eHp1aXF0eHZ4Y3JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyMjE2MDEsImV4cCI6MjA1Mzc5NzYwMX0.CvNVpHZ1QkmrrXH016XRODMivdZepKa7JWHFPNdF86Q";

// Initialize the Supabase client with explicit types and timeouts
export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          // Increase timeout for slow connections
          signal: options?.signal || new AbortController().signal
        });
      }
    },
    db: {
      schema: 'public'
    }
  }
);
