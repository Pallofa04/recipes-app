import React, { useState } from 'react';
import { useAuth } from '../api/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const { error } = await signIn(email, password);

    if (error) {
      // Normalize and map errors to user-friendly messages
      const errorText = error.message.toLowerCase();

      if (errorText.includes('invalid login credentials')) {
        setError('Incorrect email or password.');
      } else if (errorText.includes('user not found') || errorText.includes('no user')) {
        setError('No account found with that email.');
      } else if (errorText.includes('email not confirmed')) {
        setError('Please confirm your email before logging in.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } else {
      navigate('/home');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
      <h2 className="text-xl font-bold">Sign in</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="input w-full"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="input w-full"
        required
      />

      {error && <div className="text-red-600">{error}</div>}

      <button type="submit" className="btn btn-primary w-full">
        Sign in
      </button>

      <div className="text-center text-gray-600">
        Don't you have an account?{' '}
        <Link 
          to="/signUp" 
          className="text-green-600 underline hover:text-green-700"
        >
          Sign Up
        </Link>
      </div>
      
    </form>
  );
}
