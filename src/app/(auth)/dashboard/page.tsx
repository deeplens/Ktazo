
'use client';
import { useAuth } from "@/lib/auth";
import { MemberDashboard } from "@/components/dashboard/member-dashboard";
import { AdminPastorDashboard } from "@/components/dashboard/admin-pastor-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { mockUsers } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Users, Wifi } from "lucide-react";
import Link from "next/link";

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
  const isAdmin = user.role === 'ADMIN' || user.role === 'PASTOR' || user.role === 'MASTER';
  
  // For demonstration: total users and fake online users
  const totalUsers = mockUsers.length;
  const onlineUsers = mockUsers.filter(u => new Date(u.lastLoginAt) > new Date(Date.now() - 60 * 60 * 1000)).length; // online in last hour

  return (
    <div className="flex flex-col gap-8">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">{greeting}</h1>
                <p className="text-muted-foreground">Here's what's happening in your congregation.</p>
            </div>
            <div className="text-right">
                <div className="flex items-center justify-end gap-4">
                    {isAdmin && (
                        <div className="flex items-center gap-2 text-sm">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <span className="font-bold">{totalUsers}</span>
                                <span className="text-muted-foreground"> Registered</span>
                            </div>
                        </div>
                    )}
                     <div className="flex items-center gap-2 text-sm">
                        <Wifi className="h-5 w-5 text-green-500" />
                         <div>
                            <span className="font-bold">{onlineUsers}</span>
                            <span className="text-muted-foreground"> Online</span>
                        </div>
                    </div>
                </div>
                <Button variant="link" className="h-auto p-0 mt-1" asChild>
                    <Link href="/dashboard/admin/members">See Who is Online</Link>
                </Button>
            </div>
        </div>
        
        { isAdmin ? (
            <AdminPastorDashboard />
        ) : (
            <MemberDashboard />
        )}
    </div>
  );
}
