import { supabase } from './supabase/supabase';

export type AppLanguage = 'en' | 'es';

export const getProfileLanguage = async (userId: string): Promise<AppLanguage> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('language')
    .eq('id', userId)
    .single();

  if (error || !data?.language) {
    return 'en';
  }

  return data.language === 'es' ? 'es' : 'en';
};

export const updateProfileLanguage = async (userId: string, language: AppLanguage) => {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, language }, { onConflict: 'id' });

  if (error) {
    throw error;
  }
};