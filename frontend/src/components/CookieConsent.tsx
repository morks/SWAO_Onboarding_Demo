// DYN-08 FIX: Cookie-Consent-Banner gemäß DSGVO Art.7 / ePrivacy-Richtlinie
import { useState, useEffect } from 'react';
import { Shield, X } from 'lucide-react';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_consent', JSON.stringify({
      accepted: true,
      timestamp: new Date().toISOString(),
      version: '1.0',
    }));
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookie_consent', JSON.stringify({
      accepted: false,
      timestamp: new Date().toISOString(),
      version: '1.0',
    }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie-Einwilligung"
      className="fixed bottom-0 inset-x-0 z-50 p-4 bg-white border-t-2 border-brand-200 shadow-xl"
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Shield className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 text-sm text-gray-600">
          <p className="font-medium text-gray-800 mb-0.5">Datenschutz-Einstellungen</p>
          <p>
            Wir verwenden technisch notwendige Cookies für Authentifizierung und Session-Verwaltung.
            Weitere Informationen finden Sie in unserer{' '}
            <a href="#" className="text-brand-600 hover:underline">Datenschutzerklärung</a>.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={decline}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Ablehnen
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
          >
            Akzeptieren
          </button>
        </div>
      </div>
    </div>
  );
}
