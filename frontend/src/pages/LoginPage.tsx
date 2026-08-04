// SWAO DYN-05: Keine autocomplete-Attribute auf E-Mail/Passwort-Feldern — intentional
import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const err = await login(email, password);
    setIsLoading(false);

    if (err) {
      setError(err);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Trophy className="w-9 h-9 text-yellow-300" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Willkommen zurück!</h1>
          <p className="text-gray-500 mt-1">Melden Sie sich an, um am Gewinnspiel teilzunehmen</p>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="error-box">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="input-label">E-Mail-Adresse</label>
              {/* SWAO DYN-05: Kein autocomplete="email" — intentional */}
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ihre@email.de"
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="input-label">Passwort</label>
              {/* SWAO DYN-05: Kein autocomplete="current-password" — intentional */}
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Anmeldung läuft…
                </>
              ) : (
                'Anmelden'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Noch kein Konto?{' '}
          <Link to="/registrieren" className="font-medium text-brand-600 hover:text-brand-700">
            Jetzt registrieren
          </Link>
        </p>
      </div>
    </div>
  );
}
