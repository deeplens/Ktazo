

'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getMockSermons, getMockWeeklyContent, getTenantSettings } from "@/lib/mock-data";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowRight, Info, BookOpenCheck } from "lucide-react";
import { Badge } from "../ui/badge";
import { useEffect, useState } from "react";
import { Sermon, TenantSettings } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useAuth } from "@/lib/auth";
import ApplePodcastsButtonODB from "../ApplePodcastsButtonODB";

export function MemberDashboard() {
  const { user } = useAuth();
  const [publishedSermon, setPublishedSermon] = useState<Sermon | null | undefined>(undefined);
  const [settings, setSettings] = useState<TenantSettings | null>(null);

  useEffect(() => {
    const sermons = getMockSermons();
    const foundSermon = sermons.find(s => s.status === 'PUBLISHED');
    setPublishedSermon(foundSermon || null); // Set to null if not found
    
    if (user) {
        const tenantSettings = getTenantSettings(user.tenantId);
        setSettings(tenantSettings);
    }
  }, [user]);

  if (publishedSermon === undefined) {
    // Loading state
    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4 mb-2" />
                    <Skeleton className="h-8 w-3/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="w-full aspect-[16/9] rounded-lg mb-4" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-5/6 mt-2" />
                </CardContent>
            </Card>
        </div>
    );
  }

  if (publishedSermon === null) {
    return (
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Weekly Content Available</AlertTitle>
            <AlertDescription>
                There is no content published for this week yet. Please check back later.
            </AlertDescription>
        </Alert>
    );
  }
  
  const weeklyContent = getMockWeeklyContent().find(wc => wc.sermonId === publishedSermon.id && wc.language === 'en');
  if (!weeklyContent) {
    return (
        <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertTitle>Content Error</AlertTitle>
            <AlertDescription>
                Weekly content for &quot;{publishedSermon.title}&quot; could not be loaded. Please contact an administrator.
            </AlertDescription>
        </Alert>
    );
  }

  const heroImage = publishedSermon.artworkUrl || `https://picsum.photos/seed/${publishedSermon.id}/1200/800`;
  const showOdb = settings?.optionalServices?.ourDailyBread;

  return (
    <div className="grid gap-6">
      <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <Badge variant="outline" className="mb-2">This Week</Badge>
                    <CardTitle className="font-headline">{publishedSermon.title}</CardTitle>
                    <CardDescription>{publishedSermon.series}</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden mb-4">
                <Image 
                    src={heroImage} 
                    alt={`Theme image for ${publishedSermon.title}`} 
                    fill
                    className="object-cover"
                    data-ai-hint="spiritual abstract"
                />
            </div>
            <p className="text-muted-foreground">{weeklyContent.summaryShort}</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
                <Link href={`/dashboard/weekly/${publishedSermon.id}`}>View This Week's Content <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardFooter>
      </Card>
      
       {showOdb && (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><BookOpenCheck /> Additional Resources</CardTitle>
                <CardDescription>Explore other resources to supplement your faith journey.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <h3 className="font-semibold">Our Daily Bread</h3>
                        <p className="text-sm text-muted-foreground">Listen to the daily podcast devotional.</p>
                    </div>
                    <ApplePodcastsButtonODB />
                 </div>
            </CardContent>
        </Card>
      )}

    </div>
  );
}
