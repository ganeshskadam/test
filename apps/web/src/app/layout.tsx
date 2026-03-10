import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FlowQueue – Work Management Platform',
  description: 'Submit, track, and manage projects with admin approval workflow.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
