import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import UploadImagePage from './pages/UploadImagePage';
import GenerateRecipePage from './pages/GenerateRecipePage';
import RecipeResultPage from './pages/RecipeResultPage';
import DishResultsPage from './pages/DishResultsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload-image" element={<UploadImagePage />} />
        <Route path="/dish-results" element={<DishResultsPage />} />
        <Route path="/generate-recipe" element={<GenerateRecipePage />} />
        <Route path="/recipe-result" element={<RecipeResultPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;