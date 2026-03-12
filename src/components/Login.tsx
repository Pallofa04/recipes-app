import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../api/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const { signIn } = useAuth();
  const { t } = useTranslation();
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
        setError(t('login.invalidCredentials'));
      } else if (errorText.includes('user not found') || errorText.includes('no user')) {
        setError(t('login.noAccountFound'));
      } else if (errorText.includes('email not confirmed')) {
        setError(t('login.emailNotConfirmed'));
      } else {
        setError(t('login.unexpectedError'));
      }
    } else {
      navigate('/home');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
      <h2 className="text-xl font-bold">{t('login.title')}</h2>

      <input
        type="email"
        placeholder={t('login.email')}
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="input w-full"
        required
      />

      <input
        type="password"
        placeholder={t('login.password')}
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="input w-full"
        required
      />

      {error && <div className="text-red-600">{error}</div>}

      <button type="submit" className="btn btn-primary w-full">
        {t('common.signIn')}
      </button>

      <div className="text-center text-gray-600">
        {t('login.noAccount')}{' '}
        <Link 
          to="/signup" 
          className="text-green-600 underline hover:text-green-700"
        >
          {t('common.signUp')}
        </Link>
      </div>
      
    </form>
  );
}
