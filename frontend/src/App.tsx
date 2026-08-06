// DYN-08: Cookie-Consent-Banner implementiert
import { Switch, Route, Redirect } from 'wouter';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Layout } from './components/Layout';
import { CookieConsent } from './components/CookieConsent';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';

export default function App() {
  return (
    <AuthProvider>
      <Switch>
        {/* Öffentliche Routen */}
        <Route path="/login"><LoginPage /></Route>
        <Route path="/registrieren"><RegisterPage /></Route>

        {/* Geschützte Routen */}
        <Route path="/dashboard">
          <PrivateRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </PrivateRoute>
        </Route>

        {/* Catch-all: Redirect zum Dashboard */}
        <Route><Redirect to="/dashboard" /></Route>
      </Switch>
      <CookieConsent />
    </AuthProvider>
  );
}
