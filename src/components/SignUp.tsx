import React, { useState } from 'react';
import { useAuth } from '../api/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function SignUpForm() {
  const { signUp, resendConfirmationEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error: signUpError } = await signUp(email, password);
      
      if (signUpError) {
        throw signUpError;
      }

      // Verificar si el usuario ya existe (typo corregido: identities en lugar de identities)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError('This email is already registered.');
        return;
      }

      setEmailSent(true);
    } catch (err: any) { // Tipo any temporal para evitar errores
      setError(err.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      await resendConfirmationEmail(email);
      alert('Confirmation email resent successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to resend confirmation email');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="max-w-sm mx-auto space-y-4 text-center">
        <h2 className="text-xl font-bold">Verify Your Email</h2>
        <p className="text-gray-600">
          We've sent a confirmation link to <strong>{email}</strong>.
          Please check your inbox and click the link to verify your account.
        </p>
        <p className="text-sm text-gray-500">
          Didn't receive the email? <button 
            onClick={handleResendEmail}
            className="text-green-600 hover:underline"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Resend'}
          </button>
        </p>
        {error && <div className="text-red-600">{error}</div>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
      <h2 className="text-xl font-bold">Sign Up</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input w-full"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input w-full"
        required
      />

      {error && (
        <div className="text-red-600">
          {error}
          {/* Mostrar enlace a Sign In cuando hay error de registro */}
          {(error.includes('already registered') || error.includes('already exists')) && (
            <div className="mt-2">
              <span className="text-gray-600">Already have an account? </span>
              <Link 
                to="/login" 
                className="text-green-600 underline hover:text-green-700"
                onClick={() => navigate('/login', { state: { email } })}
              >
                Sign in here
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
        {isLoading ? 'Processing...' : 'Sign Up'}
      </button>

      <div className="text-center text-gray-600">
        Already have an account?{' '}
        <Link 
          to="/login" 
          className="text-green-600 underline hover:text-green-700"
        >
          Sign in
        </Link>
      </div>
    </form>
  );
}