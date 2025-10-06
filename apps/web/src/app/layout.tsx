'use client';

import { ReactNode } from 'react';
import '../styles/globals.css';
import '../styles/theme.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Providers } from './providers';

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Don't show navigation on welcome/onboarding
  const showNav = pathname !== '/' || typeof window !== 'undefined' && window.localStorage.getItem('PARENT.txt');

  return (
    <html lang="en">
      <body>
        <Providers>
          <div id="app-root">
            {showNav && (
              <nav className="main-nav">
                <div className="nav-container">
                  <Link href="/" className="nav-brand">
                    Kids Savings Bank
                  </Link>
                  <div className="nav-links">
                    <Link 
                      href="/" 
                      className={pathname === '/' ? 'nav-link active' : 'nav-link'}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/settings" 
                      className={pathname === '/settings' ? 'nav-link active' : 'nav-link'}
                    >
                      Settings
                    </Link>
                  </div>
                </div>
              </nav>
            )}
            <main className="main-content">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
