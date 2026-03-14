import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../api/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function SignUpForm() {
  const { signUp, resendConfirmationEmail } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError(t('signup.passwordMismatch'));
      return;
    }

    // Validar longitud mínima de contraseña
    if (password.length < 6) {
      setError(t('signup.passwordShort'));
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: signUpError } = await signUp(email, password);
      
      if (signUpError) {
        throw signUpError;
      }

      // Verificar si el usuario ya existe
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError(t('signup.emailAlreadyRegistered'));
        return;
      }

      setEmailSent(true);
    } catch {
      setError(t('signup.signupError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      await resendConfirmationEmail(email);
      alert(t('signup.resent'));
    } catch {
      setError(t('signup.resendError'));
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="max-w-sm mx-auto space-y-4 text-center">
        <h2 className="text-xl font-bold">{t('signup.verificationTitle')}</h2>
        <p className="text-gray-600">
          {t('signup.verificationMessage')} <strong>{email}</strong>. {t('signup.verificationInstruction')}
        </p>
        <p className="text-sm text-gray-500">
          {t('signup.noEmail')} <button 
            onClick={handleResendEmail}
            className="text-green-600 hover:underline"
            disabled={isLoading}
          >
            {isLoading ? t('signup.sending') : t('signup.resend')}
          </button>
        </p>
        {error && <div className="text-red-600">{error}</div>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
      <h2 className="text-xl font-bold">{t('signup.title')}</h2>
      
      <div>
        <input
          type="email"
          placeholder={t('signup.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input w-full"
          required
        />
      </div>

      <div>
        <input
          type="password"
          placeholder={t('signup.password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input w-full"
          required
          minLength={6}
        />
      </div>

      <div>
        <input
          type="password"
          placeholder={t('signup.confirmPassword')}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="input w-full"
          required
          minLength={6}
        />
      </div>

      {error && (
        <div className="text-red-600">
          {error}
          {/* Mostrar enlace a Sign In cuando hay error de registro */}
          {(error.includes('ya está registrado') || error.includes('already exists')) && (
            <div className="mt-2">
              <span className="text-gray-600">{t('signup.alreadyHaveAccount')} </span>
              <Link 
                to="/login" 
                className="text-green-600 underline hover:text-green-700"
                onClick={() => navigate('/login', { state: { email } })}
              >
                {t('signup.signInHere')}
              </Link>
            </div>
          )}
        </div>
      )}

      <button 
        type="submit" 
        className="btn w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? t('signup.processing') : t('common.signUp')}
      </button>

      <div className="text-center text-gray-600">
        {t('signup.alreadyHaveAccount')}{' '}
        <Link 
          to="/login" 
          className="text-green-600 underline hover:text-green-700"
        >
          {t('common.signIn')}
        </Link>
      </div>
    </form>
  );
}