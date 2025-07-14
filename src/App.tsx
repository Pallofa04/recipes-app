// src/App.tsx
import { useState, useEffect } from 'react';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Llama a tu backend FastAPI
    fetch('http://localhost:8000/')
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []);

  return (
    <div>
      <h1>Mi App de Recetas</h1>
      <p>Respuesta del backend: {message}</p>
    </div>
  );
}

export default App;