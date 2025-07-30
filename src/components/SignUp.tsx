import React, { useState } from 'react';
import { useAuth } from '../api/AuthContext';
import { Link } from 'react-router-dom';

export default function SignUpForm() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Función para verificar si el usuario ya existe
  const checkUserExists = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `http://localhost:8000/auth/check-user?email=${encodeURIComponent(email)}`
      );
      const data = await response.json();
      return data.exists;
    } catch (err) {
      console.error('Error checking user:', err);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Verificar si el usuario ya existe antes de registrarlo
    const exists = await checkUserExists(email);
    if (exists) {
      setError('Este usuario ya está registrado. ¿Quieres iniciar sesión?');
      return;
    }

    // Si no existe, procedemos con el registro
    const { error } = await signUp(email, password);
    if (error) {
      setError(error.message);
      setSuccess(false);
    } else {
      setSuccess(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
      <h2 className="text-xl font-bold">Registrarse</h2>
      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input w-full"
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input w-full"
        required
      />

      {error && (
        <div className="text-red-600">
          {error}
          {error.includes('iniciar sesión') && (
            <div className="text-blue-600 mt-2">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="underline">
                Inicia sesión aquí
              </Link>
            </div>
          )}
        </div>
      )}

      {success && (
        <div className="text-green-600">
          ¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.
        </div>
      )}

      <button type="submit" className="btn btn-primary w-full">
        Registrarse
      </button>
    </form>
  );
}
