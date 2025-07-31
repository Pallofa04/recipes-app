import React, { useState } from 'react';
import { useAuth } from '../api/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function SignUpForm() {
  const { signUp } = useAuth(); // Eliminamos isGuest y migrateGuestData
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

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

    const exists = await checkUserExists(email);
    if (exists) {
      setError('Este usuario ya está registrado. ¿Quieres iniciar sesión?');
      return;
    }

    const { error: signUpError } = await signUp(email, password);
    if (signUpError) {
      setError(signUpError.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
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
          ¡Registro exitoso! Serás redirigido a la página principal.
        </div>
      )}

      <button type="submit" className="btn btn-primary w-full">
        Registrarse
      </button>
    </form>
  );
}