import './App.css';
import { Login } from '@/pages/login';
import { Dashboard } from '@/pages/dashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SplashScreen } from '@/pages/home';
import { Devices } from '@/pages/devices';
import { Analytics } from '@/pages/analytics';
import { Automation } from '@/pages/automation';
import { Audit } from '@/pages/audit';
import { FAQs } from '@/pages/faqs';
import { Settings } from '@/pages/settings';
import ProfileSettings from '@/pages/profile-settings';
import AnalyticsSettings from '@/pages/analytics-settings';
import AppearanceSettings from '@/pages/appearance-settings';
import PasswordSettings from '@/pages/password-settings';
import { ProtectedRoute } from '@/routes/protected-route';
import { ThemeProvider } from '@/helpers/theme-provider';
import { AuthProvider } from './helpers/auth-provider';

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<SplashScreen />} />
              <Route path="/faqs" element={<FAQs />} />
              <Route path="/sign-up" element={<Login />} />
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/devices" element={<Devices />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/automation" element={<Automation />} />
                <Route path="/audit" element={<Audit />} />
                <Route path="/settings" element={<Settings />}>
                  <Route index element={<ProfileSettings />} />
                  <Route path="analytics" element={<AnalyticsSettings />} />
                  <Route path="appearance" element={<AppearanceSettings />} />
                  <Route path="password" element={<PasswordSettings />} />
                </Route>
              </Route>
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
