import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../api/AuthContext';
import { ChefHat, LogOut } from 'lucide-react';

export default function Header() {
  const { user, isGuest, signOut, isEmailVerified} = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white border-b border-gray-200 py-2 px-4 flex justify-between items-center sticky top-0 z-50">
      {/* Logo */}
      <Link to="/home" className="flex items-center gap-2 font-semibold text-gray-800 hover:text-primary-600 transition-colors">
        <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
          <ChefHat className="w-4 h-4 text-white" />
        </div>
        <span className="text-base">RecipeGen</span>
      </Link>

      {/* Navigation - только для залогиненных */}
      {user && !isGuest && isEmailVerified && (
        <nav className="hidden md:flex items-center gap-1 text-sm">
          <Link
            to="/home"
            className={`px-3 py-1.5 rounded-md transition-colors ${
              isActive('/home') ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t('common.home')}
          </Link>
          <Link
            to="/my-recipes"
            className={`px-3 py-1.5 rounded-md transition-colors ${
              isActive('/my-recipes') ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t('common.recipes')}
          </Link>
          <Link
            to="/favorites"
            className={`px-3 py-1.5 rounded-md transition-colors ${
              isActive('/favorites') ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t('common.favorites')}
          </Link>
        </nav>
      )}

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Guest or no user */}
        {(!user || isGuest) && (
          <div className="flex items-center gap-2">
            {isGuest && <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">{t('common.guest')}</span>}
            <Link to="/signup" className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              {t('header.register')}
            </Link>
            <Link to="/login" className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
              {t('common.signIn')}
            </Link>
          </div>
        )}

        {/* Unverified email */}
        {user && !isGuest && !isEmailVerified && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-yellow-700 px-2 py-1 bg-yellow-50 rounded">{t('header.emailNotVerified')}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center gap-1"
            >
              <LogOut className="w-3 h-3" />
              {t('common.logout')}
            </button>
          </div>
        )}

        {/* Verified user */}
        {user && !isGuest && isEmailVerified && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1.5 hover:bg-gray-200 transition-colors"
            >
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary-600 text-white text-xs font-semibold">
                {user.email?.charAt(0).toUpperCase()}
              </span>
              <span className="hidden sm:inline text-sm text-gray-700">{user.email?.split('@')[0]}</span>
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <Link
                  to="/profile"
                  className="block px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {t('common.profile')}
                </Link>
                <div className="md:hidden">
                  <Link
                    to="/my-recipes"
                    className="block px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('common.myRecipes')}
                  </Link>
                  <Link
                    to="/favorites"
                    className="block px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('common.favorites')}
                  </Link>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 border-t border-gray-100 transition-colors"
                >
                  {t('common.logout')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
