import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import HomePage from './pages/public/HomePage';
import PlaceholderPage from './pages/public/PlaceholderPage';

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicLayout>
            <HomePage />
          </PublicLayout>
        }
      />
      <Route
        path="/verify"
        element={
          <PublicLayout>
            <PlaceholderPage title="Verify Licence / Product" />
          </PublicLayout>
        }
      />
      <Route
        path="/alerts"
        element={
          <PublicLayout>
            <PlaceholderPage title="Drug & Cosmetic Alerts" />
          </PublicLayout>
        }
      />
      <Route
        path="/registries"
        element={
          <PublicLayout>
            <PlaceholderPage title="Public Registries" />
          </PublicLayout>
        }
      />
      <Route
        path="/grievance"
        element={
          <PublicLayout>
            <PlaceholderPage title="File a Grievance" />
          </PublicLayout>
        }
      />
      <Route
        path="/login"
        element={
          <PublicLayout>
            <PlaceholderPage title="Login / Register" />
          </PublicLayout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
