'use client';

import './globals.css';
import { ReactNode } from 'react';
import { ToastProvider } from './components/ui/Toast';
import { usePathname } from 'next/navigation';

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <head>
        <title>TaskMatrix | Award-Winning Comic-Style Task Management</title>
        <meta name="description" content="A stunning retro comic-themed Kanban-style task management app with advanced UI features" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Bangers&family=Comic+Neue:wght@400;700&family=Permanent+Marker&family=Cabin+Sketch:wght@400;700&family=Architects+Daughter&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-fixed comic-paper-yellow">
        <ToastProvider>
          <div className="relative z-10 min-h-screen">
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
