import { supabase } from '../supabase';

// Añadir item al historial
export const addToHistory = async (userId: string, itemId: string) => {
  const { data, error } = await supabase
    .from('history')
    .insert({ user_id: userId, item_id: itemId, viewed_at: new Date() });

  if (error) throw new Error(error.message);
  return data;
};

// Obtener historial de un usuario
export const getHistory = async (userId: string) => {
  const { data, error } = await supabase
    .from('history')
    .select('*')
    .eq('user_id', userId)
    .order('viewed_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};