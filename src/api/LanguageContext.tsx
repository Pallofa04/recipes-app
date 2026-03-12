import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import i18n from '../i18n';
import { AppLanguage, getProfileLanguage, updateProfileLanguage } from './profiles';

interface LanguageContextType {
  language: AppLanguage;
  setLanguagePreference: (language: AppLanguage) => Promise<void>;
  isLanguageLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user, isGuest, isLoading } = useAuth();
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [isLanguageLoading, setIsLanguageLoading] = useState(true);

  useEffect(() => {
    const syncLanguage = async () => {
      if (isLoading) {
        return;
      }

      if (!user || isGuest) {
        setLanguage('en');
        await i18n.changeLanguage('en');
        setIsLanguageLoading(false);
        return;
      }

      setIsLanguageLoading(true);
      const nextLanguage = await getProfileLanguage(user.id);
      setLanguage(nextLanguage);
      await i18n.changeLanguage(nextLanguage);
      setIsLanguageLoading(false);
    };

    syncLanguage();
  }, [user, isGuest, isLoading]);

  const setLanguagePreference = async (nextLanguage: AppLanguage) => {
    setLanguage(nextLanguage);
    await i18n.changeLanguage(nextLanguage);

    if (user?.id && !isGuest) {
      await updateProfileLanguage(user.id, nextLanguage);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguagePreference, isLanguageLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
}