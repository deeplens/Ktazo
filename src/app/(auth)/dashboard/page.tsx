'use client';
import { useAuth } from "@/lib/auth.tsx";
import { MemberDashboard } from "@/components/dashboard/member-dashboard";
import { AdminPastorDashboard } from "@/components/dashboard/admin-pastor-dashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-1/4" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-40 rounded-lg" />
                <Skeleton className="h-40 rounded-lg" />
                <Skeleton className="h-40 rounded-lg" />
            </div>
        </div>
    );
  }
  
  const greeting = `Welcome back, ${user.name}!`;

  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">{greeting}</h1>
            <p className="text-muted-foreground">Here's what's happening in your congregation.</p>
        </div>
        
        { (user.role === 'ADMIN' || user.role === 'PASTOR' || user.role === 'MASTER') ? (
            <AdminPastorDashboard />
        ) : (
            <MemberDashboard />
        )}
    </div>
  );
}
