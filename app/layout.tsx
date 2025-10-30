import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trail - Chrome AI Offline Trip Planner',
  description: 'Plan and navigate trips offline with Chrome Built-in AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

