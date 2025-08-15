import { useAuth } from '../api/AuthContext';
import { Link } from 'react-router-dom';

const MyRecipes = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Recipes</h1>
      
      {user ? (
        <div className="space-y-4">
          <p className="text-gray-600">
            Welcome back, {user.email}! Here are your saved recipes.
          </p>
          
          {/* Placeholder for recipes list */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold">Spaghetti Carbonara</h2>
            <p className="text-gray-500 text-sm">Created: 2023-10-15</p>
            <Link 
              to="/recipe-result" 
              className="text-green-600 hover:underline mt-2 inline-block"
            >
              View Recipe
            </Link>
          </div>
          
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold">Vegetable Curry</h2>
            <p className="text-gray-500 text-sm">Created: 2023-10-10</p>
            <Link 
              to="/recipe-result" 
              className="text-green-600 hover:underline mt-2 inline-block"
            >
              View Recipe
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-gray-600">Please sign in to view your recipes.</p>
      )}
    </div>
  );
};

export default MyRecipes;