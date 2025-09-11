'use client';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { MainNav } from './main-nav';
import { UserNav } from './user-nav';
import { useAuth } from '@/lib/auth.tsx';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function ChurchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 7.35a1.5 1.5 0 0 0-3 0V11h-3V7.35a1.5 1.5 0 0 0-3 0V11H6V7.35a1.5 1.5 0 0 0-3 0V21h18V7.35z" />
      <path d="M12 2v2.35" />
      <path d="M10.5 4.35h3" />
      <path d="M12 15.5c-1.55 0-2.8 1.4-2.8 3 0 1.55 1.25 2.8 2.8 2.8s2.8-1.25 2.8-2.8c0-1.6-1.25-3-2.8-3z" />
    </svg>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);
  
  if (loading || !user) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  const showUploadButton = user.role === 'ADMIN' || user.role === 'PASTOR';

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <ChurchIcon className="size-6 text-primary" />
            <h1 className="text-xl font-semibold font-headline">Ktazo Weekly</h1>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-4">
            {showUploadButton && (
                <div className="mb-4">
                    <Button asChild className="w-full">
                        <Link href="/dashboard/sermons/new"><PlusCircle /> Upload Sermon</Link>
                    </Button>
                </div>
            )}
          <MainNav role={user.role} />
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex w-full items-center justify-end gap-4">
            <UserNav />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
