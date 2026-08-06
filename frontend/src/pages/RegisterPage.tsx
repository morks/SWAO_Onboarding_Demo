// DYN-05 FIX: autocomplete-Attribute auf allen Eingabefeldern
import { useState, FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { Trophy, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }

    if (password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }

    setIsLoading(true);
    const err = await register(email, password);
    setIsLoading(false);

    if (err) {
      setError(err);
    } else {
      navigate('/dashboard');
    }
  };

  const passwordStrength = (): { label: string; color: string } => {
    if (password.length === 0) return { label: '', color: '' };
    if (password.length < 8)   return { label: 'Schwach', color: 'text-red-500' };
    if (password.length < 12)  return { label: 'Mittel', color: 'text-yellow-500' };
    return { label: 'Stark', color: 'text-green-600' };
  };

  const strength = passwordStrength();

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
          <h1 className="text-2xl font-bold text-gray-900">Konto erstellen</h1>
          <p className="text-gray-500 mt-1">Registrieren Sie sich für das Sommergewinnspiel 2024</p>
        </div>

        {/* Vorteile */}
        <div className="flex justify-center gap-6 mb-6 text-sm text-gray-600">
          {['Kostenlos', 'Tolle Preise', 'Sofort teilnehmen'].map((item) => (
            <div key={item} className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{item}</span>
            </div>
          ))}
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
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ihre@email.de"
                autoComplete="email"
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="input-label">Passwort</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mindestens 8 Zeichen"
                autoComplete="new-password"
                className="input-field"
                required
              />
              {strength.label && (
                <p className={`text-xs mt-1 ${strength.color}`}>
                  Passwortstärke: {strength.label}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="passwordConfirm" className="input-label">Passwort bestätigen</label>
              <input
                id="passwordConfirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Passwort wiederholen"
                autoComplete="new-password"
                className="input-field"
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Registrierung läuft…
                </>
              ) : (
                'Kostenlos registrieren'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Bereits ein Konto?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Jetzt anmelden
          </Link>
        </p>
      </div>
    </div>
  );
}
