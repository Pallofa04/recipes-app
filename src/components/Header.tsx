import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../api/AuthContext';

export default function Header() {
  const { user, isGuest, signOut, isEmailVerified} = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm py-3 px-6 flex justify-between items-center sticky top-0 z-50">
      {/* Logo */}
      <Link to="/home" className="text-xl font-bold text-primary-600">
        RecipeGen
      </Link>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Si es invitado o no hay usuario */}
        {(!user || isGuest) && (
          <div className="flex items-center gap-3">
            {isGuest && <span className="text-gray-500 italic">Guest</span>}
            <Link
              to="/signup"
              className="px-3 py-1 border rounded-lg hover:bg-gray-50 text-sm"
            >
              Sign up
            </Link>
            <Link
              to="/login"
              className="px-3 py-1 border rounded-lg hover:bg-gray-50 text-sm"
            >
              Sign in
            </Link>
          </div>
        )}

        {/* Si hay usuario logueado */}
        {user && !isGuest && isEmailVerified &&(
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1 hover:bg-gray-200"
            >
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-primary-500 text-white font-bold">
                {user.email?.charAt(0).toUpperCase()}
              </span>
              <span className="hidden sm:inline">{user.email}</span>
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <Link
                  to="/profile"
                  className="block px-4 py-2 hover:bg-gray-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/my-recipes"
                  className="block px-4 py-2 hover:bg-gray-50"
                  onClick={() => setMenuOpen(false)}
                >
                  My Recipes
                </Link>
                <Link
                  to="/favorites"
                  className="block px-4 py-2 hover:bg-gray-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Favorites
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
