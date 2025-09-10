'use client';

import { AuthProvider } from "@/lib/auth.tsx";
import { AppShell } from "@/components/dashboard/app-shell";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
        <AppShell>
            {children}
        </AppShell>
    </AuthProvider>
  );
}
