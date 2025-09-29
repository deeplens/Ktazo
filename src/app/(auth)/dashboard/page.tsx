
'use client';
import { useAuth } from "@/lib/auth";
import { MemberDashboard } from "@/components/dashboard/member-dashboard";
import { AdminPastorDashboard } from "@/components/dashboard/admin-pastor-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { getGlobalLeaderboard, mockUsers } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Star, Users, Wifi } from "lucide-react";
import Link from "next/link";
import { getLevelForPoints } from "@/lib/levels";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


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
  
  const totalUsers = mockUsers.length;
  const onlineUsers = mockUsers.filter(u => new Date(u.lastLoginAt) > new Date(Date.now() - 60 * 60 * 1000)).length; // online in last hour
  
  const leaderboard = getGlobalLeaderboard();
  const currentUserScore = leaderboard.find(p => p.userId === user.id)?.totalScore || 0;
  const userLevel = getLevelForPoints(currentUserScore);
  const progressPercentage = userLevel.maxPoints === Infinity ? 100 : ((currentUserScore - userLevel.minPoints) / (userLevel.maxPoints - userLevel.minPoints)) * 100;

  return (
    <div className="flex flex-col gap-8">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">{greeting}</h1>
                <p className="text-muted-foreground">Here's what's happening in your congregation.</p>
            </div>
            <div className="text-right">
                <div className="flex items-center justify-end gap-4">
                    {isAdmin ? (
                        <div className="flex items-center gap-2 text-sm">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <span className="font-bold">{totalUsers}</span>
                                <span className="text-muted-foreground"> Registered</span>
                            </div>
                        </div>
                    ) : (
                         <div className="w-64">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger className="w-full text-left">
                                        <div className="text-sm font-semibold flex justify-between mb-1">
                                            <span>{userLevel.stage}: {userLevel.name}</span>
                                            <span className="text-primary">{currentUserScore.toLocaleString()} / {userLevel.maxPoints === Infinity ? '∞' : userLevel.maxPoints.toLocaleString()} pts</span>
                                        </div>
                                        <Progress value={progressPercentage} />
                                    </TooltipTrigger>
                                    <TooltipContent align="end" className="max-w-xs">
                                        <p className="italic">&quot;{userLevel.quote}&quot;</p>
                                        <p className="text-right font-medium">- {userLevel.reference}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
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
                {isAdmin && (
                    <Button variant="link" className="h-auto p-0 mt-1 text-sm" asChild>
                        <Link href="/dashboard/admin/members">See Who is Online</Link>
                    </Button>
                )}
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
