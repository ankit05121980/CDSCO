import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import PortalLayout from './layouts/PortalLayout';
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/portal/DashboardPage';
import UsersPage from './pages/portal/UsersPage';
import AuditPage from './pages/portal/AuditPage';
import NotificationsPage from './pages/portal/NotificationsPage';
import EntitiesPage from './pages/portal/EntitiesPage';
import ProductsPage from './pages/portal/ProductsPage';
import LaboratoriesPage from './pages/portal/LaboratoriesPage';
import TechnicalPersonsPage from './pages/portal/TechnicalPersonsPage';
import ApplicationsPage from './pages/portal/ApplicationsPage';
import ApplicationDetailPage from './pages/portal/ApplicationDetailPage';
import LicensesPage from './pages/portal/LicensesPage';
import PaymentsPage from './pages/portal/PaymentsPage';
import VerifyPage from './pages/public/VerifyPage';
import AlertsPage from './pages/public/AlertsPage';
import InspectionsPage from './pages/portal/InspectionsPage';
import EnforcementPage from './pages/portal/EnforcementPage';
import LaboratoryPage from './pages/portal/LaboratoryPage';
import ClinicalTrialsPage from './pages/portal/ClinicalTrialsPage';
import VigilancePage from './pages/portal/VigilancePage';
import SupplyChainPage from './pages/portal/SupplyChainPage';
import ReturnsPage from './pages/portal/ReturnsPage';
import GrievancesPage from './pages/portal/GrievancesPage';
import IntegrationsPage from './pages/portal/IntegrationsPage';
import GrievancePage from './pages/public/GrievancePage';
import RegistriesPage from './pages/public/RegistriesPage';
import ShresthPage from './pages/portal/ShresthPage';
import AnalyticsPage from './pages/portal/AnalyticsPage';
import KnowledgePage from './pages/public/KnowledgePage';

const pub = (el: JSX.Element) => <PublicLayout>{el}</PublicLayout>;
const portal = (el: JSX.Element) => <PortalLayout>{el}</PortalLayout>;

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={pub(<HomePage />)} />
      <Route path="/verify" element={pub(<VerifyPage />)} />
      <Route path="/alerts" element={pub(<AlertsPage />)} />
      <Route path="/registries" element={pub(<RegistriesPage />)} />
      <Route path="/grievance" element={pub(<GrievancePage />)} />
      <Route path="/knowledge" element={pub(<KnowledgePage />)} />
      <Route path="/login" element={<LoginPage />} />

      {/* Portal */}
      <Route path="/app" element={portal(<DashboardPage />)} />
      <Route path="/app/applications" element={portal(<ApplicationsPage />)} />
      <Route path="/app/applications/:id" element={portal(<ApplicationDetailPage />)} />
      <Route path="/app/licenses" element={portal(<LicensesPage />)} />
      <Route path="/app/clinical-trials" element={portal(<ClinicalTrialsPage />)} />
      <Route path="/app/inspections" element={portal(<InspectionsPage />)} />
      <Route path="/app/enforcement" element={portal(<EnforcementPage />)} />
      <Route path="/app/vigilance" element={portal(<VigilancePage />)} />
      <Route path="/app/laboratory" element={portal(<LaboratoryPage />)} />
      <Route path="/app/supply-chain" element={portal(<SupplyChainPage />)} />
      <Route path="/app/returns" element={portal(<ReturnsPage />)} />
      <Route path="/app/payments" element={portal(<PaymentsPage />)} />
      <Route path="/app/entities" element={portal(<EntitiesPage />)} />
      <Route path="/app/products" element={portal(<ProductsPage />)} />
      <Route path="/app/laboratories" element={portal(<LaboratoriesPage />)} />
      <Route path="/app/technical-persons" element={portal(<TechnicalPersonsPage />)} />
      <Route path="/app/grievances" element={portal(<GrievancesPage />)} />
      <Route path="/app/court-cases" element={portal(<EnforcementPage />)} />
      <Route path="/app/shresth" element={portal(<ShresthPage />)} />
      <Route path="/app/analytics" element={portal(<AnalyticsPage />)} />
      <Route path="/app/integrations" element={portal(<IntegrationsPage />)} />
      <Route path="/app/users" element={portal(<UsersPage />)} />
      <Route path="/app/audit" element={portal(<AuditPage />)} />
      <Route path="/app/notifications" element={portal(<NotificationsPage />)} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
