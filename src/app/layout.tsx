import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { FirestoreProvider } from "@/contexts/FirestoreContext";
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: "ChemStock",
  description: "Inventory Management for Chemical Laboratories",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/media/app_logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/media/app_logo.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/media/app_logo.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/media/app_logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <AuthProvider>
            <FirestoreProvider>
              {children}
              <Toaster />
            </FirestoreProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
