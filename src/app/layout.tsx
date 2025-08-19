import type { Metadata } from 'next';
import './globals.css';
import { PresenceProvider } from '@/presence/PresenceProvider';
import { Toaster } from '@/components/ui/toaster';
import { SWUpdater } from '@/sw/registration';
import { CredentialVaultProvider } from '@/cred/useCredentials';

export const metadata: Metadata = {
  title: 'OmniFlow Studio',
  description: 'An omni-channel flow builder studio.',
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#F0F4F8" />
      </head>
      <body className="font-body antialiased">
        <CredentialVaultProvider>
          <PresenceProvider>
            {children}
            <SWUpdater />
            <Toaster />
          </PresenceProvider>
        </CredentialVaultProvider>
      </body>
    </html>
  );
}
