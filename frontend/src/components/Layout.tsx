import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-brand-700 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <Trophy className="w-7 h-7 text-yellow-300" />
            <div>
              <span className="font-bold text-lg leading-none">Sommergewinnspiel</span>
              <span className="block text-xs text-brand-200">2024</span>
            </div>
          </Link>

          {user && (
            <nav className="flex items-center gap-1">
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                           text-brand-100 hover:text-white hover:bg-brand-600 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{user.email.split('@')[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                           text-brand-100 hover:text-white hover:bg-brand-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Abmelden</span>
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      {/* SWAO DYN-08: Kein Cookie-Consent-Banner — intentional für SWAO-Finding */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Shield className="w-3.5 h-3.5" />
            {/* SWAO DYN-08: Footer erwähnt DSGVO aber kein Cookie-Banner vorhanden */}
            <span>Datenschutz gemäß DSGVO · Impressum</span>
          </div>
          <span className="text-xs text-gray-400">© 2024 Gewinnspiel Demo GmbH</span>
        </div>
      </footer>
    </div>
  );
}
