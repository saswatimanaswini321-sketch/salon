import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LayoutDashboard, Users, CreditCard, Settings2, BarChart3, Settings } from "lucide-react";
import Sidebar from "@/components/Sidebar";

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col md:flex-row h-screen bg-[#f0f2f5] text-[#1c1e21]`}
      >
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#f0f2f5]">
          {children}
        </main>
      </body>
    </html>
  );
}
