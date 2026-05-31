import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import PortalLayout from './layouts/PortalLayout';
import HomePage from './pages/public/HomePage';
import PlaceholderPage from './pages/public/PlaceholderPage';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/portal/DashboardPage';
import UsersPage from './pages/portal/UsersPage';
import AuditPage from './pages/portal/AuditPage';
import NotificationsPage from './pages/portal/NotificationsPage';
import ModulePlaceholder from './pages/portal/ModulePlaceholder';

const pub = (el: JSX.Element) => <PublicLayout>{el}</PublicLayout>;
const portal = (el: JSX.Element) => <PortalLayout>{el}</PortalLayout>;

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={pub(<HomePage />)} />
      <Route path="/verify" element={pub(<PlaceholderPage title="Verify Licence / Product" />)} />
      <Route path="/alerts" element={pub(<PlaceholderPage title="Drug & Cosmetic Alerts" />)} />
      <Route path="/registries" element={pub(<PlaceholderPage title="Public Registries" />)} />
      <Route path="/grievance" element={pub(<PlaceholderPage title="File a Grievance" />)} />
      <Route path="/login" element={<LoginPage />} />

      {/* Portal */}
      <Route path="/app" element={portal(<DashboardPage />)} />
      <Route path="/app/applications" element={portal(<ModulePlaceholder title="Applications" />)} />
      <Route path="/app/licenses" element={portal(<ModulePlaceholder title="Licences & Certificates" />)} />
      <Route path="/app/clinical-trials" element={portal(<ModulePlaceholder title="Clinical Trials" />)} />
      <Route path="/app/inspections" element={portal(<ModulePlaceholder title="Inspections" />)} />
      <Route path="/app/enforcement" element={portal(<ModulePlaceholder title="Enforcement" />)} />
      <Route path="/app/vigilance" element={portal(<ModulePlaceholder title="Vigilance & Safety" />)} />
      <Route path="/app/laboratory" element={portal(<ModulePlaceholder title="Laboratory (LIMS)" />)} />
      <Route path="/app/supply-chain" element={portal(<ModulePlaceholder title="Supply Chain" />)} />
      <Route path="/app/returns" element={portal(<ModulePlaceholder title="Returns Filing" />)} />
      <Route path="/app/payments" element={portal(<ModulePlaceholder title="Payments" />)} />
      <Route path="/app/entities" element={portal(<ModulePlaceholder title="Registries" />)} />
      <Route path="/app/products" element={portal(<ModulePlaceholder title="Products" />)} />
      <Route path="/app/grievances" element={portal(<ModulePlaceholder title="Grievances" />)} />
      <Route path="/app/court-cases" element={portal(<ModulePlaceholder title="Court Cases" />)} />
      <Route path="/app/shresth" element={portal(<ModulePlaceholder title="SHRESTH Index" />)} />
      <Route path="/app/analytics" element={portal(<ModulePlaceholder title="Analytics & MIS" />)} />
      <Route path="/app/integrations" element={portal(<ModulePlaceholder title="Integrations" />)} />
      <Route path="/app/users" element={portal(<UsersPage />)} />
      <Route path="/app/audit" element={portal(<AuditPage />)} />
      <Route path="/app/notifications" element={portal(<NotificationsPage />)} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
