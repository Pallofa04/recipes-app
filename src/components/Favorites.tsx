import { useAuth } from '../api/AuthContext';
import { Link } from 'react-router-dom';

const Favorites = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Favorites</h1>
      
      {user ? (
        <div className="space-y-4">
          <p className="text-gray-600">
            Your favorite recipes will appear here.
          </p>
          
          {/* Placeholder for favorites list */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold">Chocolate Cake</h2>
            <p className="text-gray-500 text-sm">Added: 2023-10-12</p>
            <Link 
              to="/recipe-result" 
              className="text-green-600 hover:underline mt-2 inline-block"
            >
              View Recipe
            </Link>
          </div>
          
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold">Avocado Toast</h2>
            <p className="text-gray-500 text-sm">Added: 2023-10-08</p>
            <Link 
              to="/recipe-result" 
              className="text-green-600 hover:underline mt-2 inline-block"
            >
              View Recipe
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-gray-600">Please sign in to view your favorites.</p>
      )}
    </div>
  );
};

export default Favorites;