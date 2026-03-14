import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { addFavorite, removeFavorite, checkIfFavorite } from '../api/favorites';
import { useAuth } from '../api/AuthContext';
import ConfirmDialog from './ConfirmDialog';

interface FavoriteToggleProps {
  recipeId: string;
  showConfirmOnRemove?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onToggle?: (isFavorite: boolean) => void;
}

const FavoriteToggle = ({ 
  recipeId, 
  showConfirmOnRemove = false,
  size = 'md',
  className = '',
  onToggle
}: FavoriteToggleProps) => {
  const { user, isGuest } = useAuth();
  const { t } = useTranslation();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user || isGuest || !recipeId || recipeId.startsWith('guest_')) {
        setChecking(false);
        return;
      }

      try {
        const status = await checkIfFavorite(recipeId, user.id);
        setIsFavorite(status);
      } catch {
        setIsFavorite(false);
      } finally {
        setChecking(false);
      }
    };

    checkFavoriteStatus();
  }, [recipeId, user, isGuest]);

  const handleToggle = async () => {
    if (!user || isGuest || !recipeId || recipeId.startsWith('guest_')) {
      return;
    }

    if (isFavorite && showConfirmOnRemove) {
      setShowConfirm(true);
      return;
    }

    await performToggle();
  };

  const performToggle = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      if (isFavorite) {
        await removeFavorite(recipeId, user.id);
        setIsFavorite(false);
        onToggle?.(false);
      } else {
        await addFavorite(recipeId, user.id);
        setIsFavorite(true);
        onToggle?.(true);
      }
    } catch {
      alert(t('favoriteToggle.updateError'));
    } finally {
      setLoading(false);
    }
  };

  if (isGuest || !user || recipeId.startsWith('guest_')) {
    return null;
  }

  if (checking) {
    return (
      <button
        disabled
        className={`btn btn-ghost ${className}`}
        title={t('favoriteToggle.checking')}
      >
        <Star className={`${sizeClasses[size]} text-gray-400 animate-pulse`} />
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`btn btn-ghost transition-all ${className}`}
        title={isFavorite ? t('favoriteToggle.remove') : t('favoriteToggle.add')}
      >
        <Star 
          className={`${sizeClasses[size]} transition-all ${
            isFavorite 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-gray-400 hover:text-yellow-400'
          } ${loading ? 'animate-pulse' : ''}`}
        />
      </button>

      <ConfirmDialog
        isOpen={showConfirm}
        title={t('favoriteToggle.dialogTitle')}
        message={t('favoriteToggle.dialogMessage')}
        confirmText={t('favoriteToggle.dialogConfirm')}
        cancelText={t('favoriteToggle.dialogCancel')}
        onConfirm={() => {
          setShowConfirm(false);
          performToggle();
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
};

export default FavoriteToggle;

