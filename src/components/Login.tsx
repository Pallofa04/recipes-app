import React, { useState } from 'react';
import { useAuth } from '../api/AuthContext';
import { Link } from 'react-router-dom';

export default function LoginForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const { error } = await signIn(email, password);
    if (error) setError(error.message);
  };

  const showRegisterLink = error && (
    error.toLowerCase().includes('user') ||
    error.toLowerCase().includes('not found') ||
    error.toLowerCase().includes('no user') ||
    error.toLowerCase().includes('invalid login credentials')
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
      <h2 className="text-xl font-bold">Iniciar sesión</h2>
      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="input w-full"
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="input w-full"
        required
      />
      {error && <div className="text-red-600">{error}</div>}
      {showRegisterLink && (
        <div className="text-blue-600">
          ¿No tienes cuenta? <Link to="/signup" className="underline">Regístrate aquí</Link>
        </div>
      )}
      <button type="submit" className="btn btn-primary w-full">Entrar</button>
    </form>
  );
}