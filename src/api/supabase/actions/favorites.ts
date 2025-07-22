import { supabase } from '../supabase'; 

// Añadir un favorito
export const addFavorite = async (userId: string, itemId: string) => {
  const { data, error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, item_id: itemId });

  if (error) throw new Error(error.message);
  return data;
};

// Eliminar un favorito
export const removeFavorite = async (userId: string, itemId: string) => {
  const { data, error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('item_id', itemId);

  if (error) throw new Error(error.message);
  return data;
};

// Obtener todos los favoritos de un usuario
export const getFavorites = async (userId: string) => {
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return data;
};