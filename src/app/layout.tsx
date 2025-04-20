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
      <body className="bg-yellow-50 min-h-screen bg-fixed" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E\")",
        backgroundSize: "20px 20px"
      }}>
        <ToastProvider>
          <div className="relative z-10 min-h-screen">
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
