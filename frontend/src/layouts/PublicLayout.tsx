import { ReactNode } from 'react';
import GovHeader from '../components/GovHeader';
import Footer from '../components/Footer';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <GovHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
