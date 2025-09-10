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
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

function CrossIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M11 18a7 7 0 1 1 4.59-13.41" />
      <path d="M18 11.01V21" />
      <path d="M21 18h-6" />
    </svg>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push('/');
    }
  }, [user, router]);
  
  if (!user) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            {/* You can add a loading spinner here */}
        </div>
    );
  }

  const showUploadButton = user.role === 'ADMIN' || user.role === 'PASTOR';

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <CrossIcon className="size-6 text-primary" />
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
