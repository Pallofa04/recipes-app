import { useNavigate } from 'react-router-dom';
import { Camera, PenTool, ChefHat, Sparkles, Clock, Users, Star, ImageIcon, Utensils } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <ChefHat className="w-6 h-6" />,
      title: "Recetas Profesionales",
      description: "Generadas por IA especializada en cocina"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Rápido y Fácil",
      description: "Obtén tu receta en segundos"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Para Todos",
      description: "Adaptado a tus gustos y necesidades"
    }
  ];

  const howItWorks = [
    {
      icon: <ImageIcon className="w-8 h-8" />,
      title: "1. Sube tu imagen",
      description: "Captura o sube una foto de tus ingredientes"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "2. IA identifica",
      description: "Nuestra IA reconoce automáticamente los ingredientes"
    },
    {
      icon: <Utensils className="w-8 h-8" />,
      title: "3. Recibe tu receta",
      description: "Obtén una receta personalizada y detallada"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="container pt-8 pb-4">
        <div className="text-center mb-2">
          <h1 className="text-display-2 font-bold text-gray-800 mb-1">
            RecipeGen
          </h1>
        </div>
        <p className="text-center text-gray-600 text-body-lg">
          Generador de Recetas Profesionales con IA
        </p>
      </header>

      {/* Hero Section */}
      <section className="container py-16">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-display-1 mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Transforma tus ingredientes en
            <span className="block bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
              recetas extraordinarias
            </span>
          </h2>
          <p className="text-body-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Descubre el poder de la inteligencia artificial para crear recetas únicas y deliciosas 
            a partir de tus ingredientes favoritos o simplemente una foto.
          </p>
          
          <div className="flex items-center justify-center gap-2 text-secondary-600 mb-12">
            <Sparkles className="w-5 h-5" />
            <span className="text-caption font-medium">Potenciado por IA Avanzada</span>
            <Star className="w-4 h-4 fill-current" />
          </div>
        </div>

        {/* Main Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Upload Image Option */}
          <div className="card card-interactive group animate-fade-in cursor-pointer animate-delay-100ms">
            <div className="card-body text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Camera className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-h2 mb-4 text-gray-800">Subir Imagen del Plato</h3>
              <p className="text-body text-gray-600 mb-6">
                Captura o sube una foto de tu plato y deja que la IA identifique 
                automáticamente cómo se cocina.
              </p>
              <div className="flex items-center justify-center gap-2 text-primary-600 font-medium">
                <span>Comenzar con imagen</span>
                <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <span className="text-white text-sm">→</span>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                📱 Desde móvil o 💻 ordenador
              </div>
            </div>
          </div>

          {/* Manual Input Option */}
          <div className="card card-interactive group animate-fade-in cursor-pointer animate-delay-200ms">
            <div className="card-body text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <PenTool className="w-10 h-10 text-secondary-600" />
              </div>
              <h3 className="text-h2 mb-4 text-gray-800">Escribir Ingredientes</h3>
              <p className="text-body text-gray-600 mb-6">
                Escribe manualmente los ingredientes que tienes disponibles y 
                personaliza tu receta con preferencias específicas.
              </p>
              <div className="flex items-center justify-center gap-2 text-secondary-600 font-medium">
                <span>Escribir ingredientes</span>
                <div className="w-6 h-6 bg-secondary-600 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <span className="text-white text-sm">→</span>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                ⚙️ Personalización completa
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-h1 mb-4 text-gray-800">¿Cómo funciona?</h3>
            <p className="text-body text-gray-600 max-w-xl mx-auto">
              En solo 3 simples pasos tendrás tu receta personalizada
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {howItWorks.map((step, index) => (
              <div 
                key={index}
                // eslint-disable-next-line react/no-inline-styles
                className="text-center animate-fade-in"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-primary-600">{step.icon}</span>
                </div>
                <h4 className="text-h3 mb-3 text-gray-800">{step.title}</h4>
                <p className="text-body-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="text-center mb-12">
          <h3 className="text-h2 mb-8 text-gray-800">¿Por qué elegir RecipeGen?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                // eslint-disable-next-line react/no-inline-styles
                className="card animate-fade-in hover:shadow-lg transition-shadow duration-300"
                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
              >
                <div className="card-body text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary-600">{feature.icon}</span>
                  </div>
                  <h4 className="text-h3 mb-2 text-gray-800">{feature.title}</h4>
                  <p className="text-body-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center animate-fade-in animate-delay-900ms">
          <div className="card bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
            <div className="card-body text-center">
              <h3 className="text-h2 mb-4 text-gray-800">¿Listo para empezar?</h3>
              <p className="text-body text-gray-600 mb-6 max-w-lg mx-auto">
                Únete a miles de usuarios que ya están creando recetas increíbles con RecipeGen
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/upload-image')}
                  className="btn btn-primary px-8"
                >
                  <Camera className="w-4 h-4" />
                  Subir Imagen
                </button>
                <button
                  onClick={() => navigate('/generate-recipe')}
                  className="btn btn-outline px-8"
                >
                  <PenTool className="w-4 h-4" />
                  Escribir Ingredientes
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container py-8 text-center border-t border-gray-200">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <ChefHat className="w-3 h-3 text-white" />
          </div>
          <span className="text-body font-medium text-gray-700">RecipeGen</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;