import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './api/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';

// Pages
import WelcomePage from './pages/WelcomePage';
import Home from './pages/Home';
import UploadImagePage from './pages/UploadImagePage';
import GenerateRecipePage from './pages/GenerateRecipePage';
import RecipeResultPage from './pages/RecipeResultPage';
import DishResultsPage from './pages/DishResultsPage';

// Components
import LoginForm from './components/Login';
import SignUpForm from './components/SignUp';
import Header from './components/Header';
import EmailConfirmed from './components/EmailConfirmed';
import Profile from './components/Profile.tsx';
import MyRecipes from './components/MyRecipes';
import Favorites from './components/Favorites';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Ruta de bienvenida - sin header - redirige si ya está logueado */}
            <Route 
              path="/" 
              element={
                <PublicRoute>
                  <WelcomePage />
                </PublicRoute>
              } 
            />

            {/* Ruta especial para confirmación de email - sin header */}
            <Route path="/email-confirmed" element={<EmailConfirmed />} />

            {/* Todas las demás rutas - CON header */}
            <Route
              path="*"
              element={
                <>
                  <Header />
                  <Routes>
                    {/* Rutas públicas con header - redirigen si ya está logueado */}
                    <Route 
                      path="/login" 
                      element={
                        <PublicRoute>
                          <LoginForm />
                        </PublicRoute>
                      } 
                    />
                    <Route 
                      path="/signup" 
                      element={
                        <PublicRoute>
                          <SignUpForm />
                        </PublicRoute>
                      } 
                    />

                    {/* Rutas protegidas - requieren autenticación (permiten guest) */}
                    <Route 
                      path="/home" 
                      element={
                        <ProtectedRoute requireAuth={false}>
                          <Home />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/upload-image" 
                      element={
                        <ProtectedRoute requireAuth={false}>
                          <UploadImagePage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/dish-results" 
                      element={
                        <ProtectedRoute requireAuth={false}>
                          <DishResultsPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/generate-recipe" 
                      element={
                        <ProtectedRoute requireAuth={false}>
                          <GenerateRecipePage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/recipe-result" 
                      element={
                        <ProtectedRoute requireAuth={false}>
                          <RecipeResultPage />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Rutas que requieren usuario real (no guest) */}
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute requireAuth={true}>
                          <Profile />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/my-recipes" 
                      element={
                        <ProtectedRoute requireAuth={true}>
                          <MyRecipes />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/favorites" 
                      element={
                        <ProtectedRoute requireAuth={true}>
                          <Favorites />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Ruta por defecto */}
                    <Route path="*" element={<Navigate to="/home" replace />} />
                  </Routes>
                </>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;