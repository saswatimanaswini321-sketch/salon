import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Super Admin | AI Salon",
  description: "Platform management for AI Salon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex h-screen bg-gray-50 text-gray-900`}
      >
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 text-white flex flex-col h-full shrink-0 shadow-lg">
          <div className="p-6 text-2xl font-bold tracking-tight border-b border-gray-800">
            AI Salon Admin
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link href="/dashboard" className="block px-4 py-3 rounded-md hover:bg-gray-800 transition">Dashboard</Link>
            <Link href="/salons" className="block px-4 py-3 rounded-md hover:bg-gray-800 transition">Salons & Tenants</Link>
            <Link href="/subscriptions" className="block px-4 py-3 rounded-md hover:bg-gray-800 transition">Subscriptions</Link>
            <Link href="/ai-settings" className="block px-4 py-3 rounded-md hover:bg-gray-800 transition">AI Engine Settings</Link>
            <Link href="/reports" className="block px-4 py-3 rounded-md hover:bg-gray-800 transition">Reports & Analytics</Link>
            <Link href="/settings" className="block px-4 py-3 rounded-md hover:bg-gray-800 transition">Platform Settings</Link>
          </nav>
          <div className="p-4 border-t border-gray-800 text-sm text-gray-400">
            Super Admin Account
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
