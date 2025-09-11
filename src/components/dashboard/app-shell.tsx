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

function SermonSeedIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M12 22v-8" />
      <path d="M6 14h12" />
      <path d="M12 14a6 6 0 0 0 6-6V6a6 6 0 0 0-12 0v2a6 6 0 0 0 6 6Z" />
      <circle cx="8" cy="7" r="1" fill="currentColor" />
      <circle cx="16"cy="7" r="1" fill="currentColor" />
      <circle cx="12" cy="3" r="1" fill="currentColor" />
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
            <SermonSeedIcon className="size-6 text-primary" />
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
