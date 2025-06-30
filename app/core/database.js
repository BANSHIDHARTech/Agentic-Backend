import dotenv from 'dotenv';
dotenv.config(); // 💥 This is mandatory to load your .env

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database helper functions
export const dbQuery = async (query, params = []) => {
  try {
    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const dbInsert = async (table, data) => {
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select();
  
  if (error) throw error;
  return result;
};

export const dbUpdate = async (table, id, data) => {
  const { data: result, error } = await supabase
    .from(table)
    .update(data)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return result;
};

export const dbDelete = async (table, id) => {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

// Test database connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
};