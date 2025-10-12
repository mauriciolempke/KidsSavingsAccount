'use client';

import { ReactNode } from 'react';
import '../styles/globals.css';
import '../styles/theme.css';
import { Providers } from './providers';
import Link from 'next/link';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div id="app-root">
            <header className="app-header">
              <div className="header-container">
                <Link href="/" className="app-logo-link">
                  <img 
                    src="/images/piggy-bank.png" 
                    alt="Kids Savings Bank Logo" 
                    className="app-logo-image"
                  />
                  <span className="app-logo-text">Kids Savings Bank</span>
                </Link>
              </div>
            </header>
            <main className="main-content">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
