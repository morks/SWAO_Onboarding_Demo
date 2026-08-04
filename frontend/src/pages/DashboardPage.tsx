// SWAO DYN-05: Keine autocomplete-Attribute auf PII-Feldern — intentional
// SWAO DATA: PII-Formular mit Name, Adresse, Geburtsdatum, Telefon
import { useState, useEffect, FormEvent } from 'react';
import {
  Trophy,
  Gift,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';

interface Profile {
  id?: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  consent: boolean;
}

interface SweepstakesEntry {
  id: number;
  campaignId: string;
  enteredAt: string;
}

interface PrizeData {
  description: string;
  symbol: string;
  currentValue: string;
  change: string;
  changePercent: string;
  lastRefreshed: string;
  source: string;
}

const emptyProfile: Profile = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  phone: '',
  street: '',
  postalCode: '',
  city: '',
  country: 'DE',
  consent: false,
};

export function DashboardPage() {
  const { user, token } = useAuth();

  // Profile state
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sweepstakes state
  const [entries, setEntries] = useState<SweepstakesEntry[]>([]);
  const [entering, setEntering] = useState(false);
  const [entryMsg, setEntryMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [prize, setPrize] = useState<PrizeData | null>(null);

  // Profil laden
  useEffect(() => {
    if (!token) return;
    api.get<{ profile: Profile | null }>('/profile', token).then((res) => {
      if (res.data?.profile) {
        const p = res.data.profile as Profile & { dateOfBirth: string };
        setProfile({
          ...p,
          dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
        });
      }
      setProfileLoading(false);
    });
  }, [token]);

  // Teilnahmen laden
  useEffect(() => {
    if (!token) return;
    api.get<{ entries: SweepstakesEntry[] }>('/sweepstakes/entries', token).then((res) => {
      if (res.data?.entries) setEntries(res.data.entries);
    });
  }, [token]);

  // Preis laden (EGR-01: Alphavantage)
  useEffect(() => {
    if (!token) return;
    api.get<{ prize: PrizeData }>('/sweepstakes/prize', token).then((res) => {
      if (res.data?.prize) setPrize(res.data.prize);
    });
  }, [token]);

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileSaving(true);

    const res = await api.put('/profile', profile, token!);
    setProfileSaving(false);

    if (res.error) {
      setProfileMsg({ type: 'error', text: res.error });
    } else {
      setProfileMsg({ type: 'success', text: 'Profil erfolgreich gespeichert!' });
    }
  };

  const handleEnter = async () => {
    setEntryMsg(null);
    setEntering(true);

    const res = await api.post<{ entry: SweepstakesEntry; message: string }>(
      '/sweepstakes/enter',
      { campaignId: 'SUMMER2024' },
      token!
    );
    setEntering(false);

    if (res.error) {
      setEntryMsg({ type: 'error', text: res.error });
    } else if (res.data) {
      setEntryMsg({ type: 'success', text: res.data.message || 'Erfolgreich teilgenommen!' });
      setEntries((prev) => [res.data!.entry, ...prev]);
    }
  };

  const hasEntered = entries.some((e) => e.campaignId === 'SUMMER2024');

  return (
    <div className="space-y-6">
      {/* Willkommen */}
      <div className="bg-gradient-to-r from-brand-700 to-brand-500 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-300 flex-shrink-0" />
          <div>
            <h1 className="text-xl font-bold">
              Willkommen, {user?.email.split('@')[0]}!
            </h1>
            <p className="text-brand-100 text-sm mt-0.5">
              Großes Sommergewinnspiel 2024 — Jetzt mitmachen und gewinnen!
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Gewinnspiel-Teilnahme */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-brand-600" />
            <h2 className="font-semibold text-gray-900">Gewinnspiel</h2>
          </div>

          {/* Preis-Info (SWAO EGR-01: Daten von Alphavantage) */}
          {prize && (
            <div className="bg-brand-50 rounded-lg p-3 mb-4 border border-brand-100">
              <p className="text-xs text-brand-600 font-medium uppercase tracking-wide mb-1">
                Aktueller Hauptpreis
              </p>
              <p className="font-semibold text-gray-900">{prize.description}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-brand-700">{prize.currentValue}</span>
                <span className={`text-sm font-medium ${
                  prize.change.startsWith('-') ? 'text-red-500' : 'text-green-600'
                }`}>
                  {prize.change} ({prize.changePercent})
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Kurs: {prize.lastRefreshed} · Quelle: {prize.source}
              </p>
            </div>
          )}

          {entryMsg && (
            <div className={entryMsg.type === 'success' ? 'success-box mb-3' : 'error-box mb-3'}>
              {entryMsg.type === 'success'
                ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              <span>{entryMsg.text}</span>
            </div>
          )}

          {hasEntered ? (
            <div className="success-box">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>Sie nehmen bereits am Gewinnspiel teil!</span>
            </div>
          ) : (
            <button
              onClick={handleEnter}
              className="btn-primary"
              disabled={entering || !profile.consent}
            >
              {entering ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Wird verarbeitet…
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4" />
                  Jetzt teilnehmen
                </>
              )}
            </button>
          )}

          {!profile.consent && !hasEntered && (
            <p className="text-xs text-gray-400 mt-2 text-center">
              Bitte füllen Sie erst Ihr Profil aus und stimmen Sie zu.
            </p>
          )}
        </div>

        {/* Card 2: Profil-Formular (PII) */}
        <div className="card lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-brand-600" />
            <h2 className="font-semibold text-gray-900">Mein Profil</h2>
          </div>

          {profileLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {profileMsg && (
                <div className={profileMsg.type === 'success' ? 'success-box' : 'error-box'}>
                  {profileMsg.type === 'success'
                    ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              {/* Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Vorname *</label>
                  {/* SWAO DYN-05: Kein autocomplete="given-name" — intentional */}
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    placeholder="Max"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Nachname *</label>
                  {/* SWAO DYN-05: Kein autocomplete="family-name" — intentional */}
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    placeholder="Mustermann"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              {/* Geburtsdatum & Telefon */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Geburtsdatum *
                    </span>
                  </label>
                  {/* SWAO DYN-05: Kein autocomplete="bday" — intentional */}
                  <input
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="input-label">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      Telefon
                    </span>
                  </label>
                  {/* SWAO DYN-05: Kein autocomplete="tel" — intentional */}
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+49 123 456789"
                    className="input-field"
                  />
                </div>
              </div>

              {/* Adresse */}
              <div>
                <label className="input-label">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    Straße & Hausnummer
                  </span>
                </label>
                {/* SWAO DYN-05: Kein autocomplete="street-address" — intentional */}
                <input
                  type="text"
                  value={profile.street}
                  onChange={(e) => setProfile({ ...profile, street: e.target.value })}
                  placeholder="Musterstraße 42"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="input-label">PLZ</label>
                  {/* SWAO DYN-05: Kein autocomplete="postal-code" — intentional */}
                  <input
                    type="text"
                    value={profile.postalCode}
                    onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })}
                    placeholder="12345"
                    className="input-field"
                  />
                </div>
                <div className="col-span-2">
                  <label className="input-label">Stadt</label>
                  {/* SWAO DYN-05: Kein autocomplete="address-level2" — intentional */}
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    placeholder="Berlin"
                    className="input-field"
                  />
                </div>
              </div>

              {/* E-Mail Anzeige */}
              <div>
                <label className="input-label">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    E-Mail-Adresse
                  </span>
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
                  disabled
                />
              </div>

              {/* Einwilligung */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  type="checkbox"
                  id="consent"
                  checked={profile.consent}
                  onChange={(e) => setProfile({ ...profile, consent: e.target.checked })}
                  className="mt-0.5 w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                />
                <label htmlFor="consent" className="text-sm text-gray-600 cursor-pointer">
                  Ich stimme den{' '}
                  <a href="#" className="text-brand-600 hover:underline">Teilnahmebedingungen</a>{' '}
                  zu und erkläre mich mit der Verarbeitung meiner personenbezogenen Daten
                  gemäß der{' '}
                  <a href="#" className="text-brand-600 hover:underline">Datenschutzerklärung</a>{' '}
                  einverstanden. *
                </label>
              </div>

              <button type="submit" className="btn-primary" disabled={profileSaving}>
                {profileSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Wird gespeichert…
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    Profil speichern
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Card 3: Meine Teilnahmen */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-brand-600" />
          <h2 className="font-semibold text-gray-900">Meine Teilnahmen</h2>
          <span className="ml-auto text-sm text-gray-400">{entries.length} Eintrag/Einträge</span>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Gift className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>Noch keine Teilnahmen vorhanden.</p>
            <p className="text-sm">Füllen Sie Ihr Profil aus und nehmen Sie teil!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-sm text-gray-900">
                    Kampagne: {entry.campaignId}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(entry.enteredAt).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
