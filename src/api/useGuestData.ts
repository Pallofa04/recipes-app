import { useAuth } from './AuthContext';

export const useGuestData = () => {
  const { isGuest } = useAuth();

  const saveGuestData = (key: string, data: any) => {
    if (isGuest) {
      localStorage.setItem(`guest_${key}`, JSON.stringify(data));
      return true;
    }
    return false;
  };

  const loadGuestData = (key: string) => {
    if (isGuest) {
      const data = localStorage.getItem(`guest_${key}`);
      return data ? JSON.parse(data) : null;
    }
    return null;
  };

  const clearGuestData = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('guest_')) {
        localStorage.removeItem(key);
      }
    });
  };

  return { saveGuestData, loadGuestData, clearGuestData };
};