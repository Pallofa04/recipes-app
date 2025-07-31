import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import Home from './pages/Home';
import UploadImagePage from './pages/UploadImagePage';
import GenerateRecipePage from './pages/GenerateRecipePage';
import RecipeResultPage from './pages/RecipeResultPage';
import DishResultsPage from './pages/DishResultsPage';
import LoginForm from './components/Login';
import SignUpForm from './components/SignUp';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/upload-image" element={<UploadImagePage />} />
        <Route path="/dish-results" element={<DishResultsPage />} />
        <Route path="/generate-recipe" element={<GenerateRecipePage />} />
        <Route path="/recipe-result" element={<RecipeResultPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;