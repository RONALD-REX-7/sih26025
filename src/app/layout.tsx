import type { Metadata } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth/auth-context';
import { TooltipProvider } from '@/components/ui/tooltip';

const ibmPlexSans = IBM_Plex_Sans({
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  display: 'swap',
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
});

export const metadata: Metadata = {
  title: 'SIH26025 — Real-Time Underground Mine Subsidence Monitoring & Early Warning System',
  description:
    'AI-enabled low-cost real-time mine subsidence monitoring, multi-sensor fusion, and early warning platform for Indian coal mines (DGMS compliant prototype).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col bg-[#F4F6F5] text-[#1D2933] font-sans">
        <AuthProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
