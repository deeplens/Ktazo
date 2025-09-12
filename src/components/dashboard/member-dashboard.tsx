

'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getMockSermons, getMockWeeklyContent, getTenantSettings } from "@/lib/mock-data";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowRight, Gamepad2, MessageSquare, PenSquare, Info, Link as LinkIcon, BookOpenCheck } from "lucide-react";
import { Badge } from "../ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ChatbotPanel } from "../chatbot/chatbot-panel";
import { useEffect, useState } from "react";
import { Sermon, TenantSettings } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useAuth } from "@/lib/auth";

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
  
  const weeklyContent = getMockWeeklyContent().find(wc => wc.sermonId === publishedSermon.id);
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
                <Button asChild variant="secondary">
                  <Link href={`/dashboard/weekly/${publishedSermon.id}`}>View Week <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
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
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-headline"><PenSquare /> Devotionals</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Access your daily devotionals for the week.</p>
            </CardContent>
            <CardFooter>
                 <Button asChild className="w-full">
                  <Link href={`/dashboard/weekly/${publishedSermon.id}#devotionals`}>Start Reading</Link>
                </Button>
            </CardFooter>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-headline"><Gamepad2 /> Games</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Play interactive games based on this week's sermon.</p>
            </CardContent>
            <CardFooter>
                 <Button asChild className="w-full">
                  <Link href={`/dashboard/weekly/${publishedSermon.id}#games`}>Play Now</Link>
                </Button>
            </CardFooter>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-headline"><MessageSquare /> Chatbot</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Ask questions and explore topics from the sermon.</p>
            </CardContent>
            <CardFooter>
                 <Sheet>
                    <SheetTrigger asChild>
                        <Button className="w-full">
                          Launch Companion
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:w-[540px] p-0 flex flex-col h-full">
                        <SheetHeader className="p-4 border-b">
                            <SheetTitle className="font-headline">Ktazo Companion</SheetTitle>
                            <SheetDescription>
                                Your AI assistant for exploring sermon content.
                            </SheetDescription>
                        </SheetHeader>
                        <ChatbotPanel />
                    </SheetContent>
                </Sheet>
            </CardFooter>
        </Card>
      </div>

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
                     <Button asChild variant="secondary">
                        <a href="https://podcasts.apple.com/us/search?term=our%20daily%20bread" target="_blank" rel="noopener noreferrer">
                           Listen Now <LinkIcon className="ml-2 h-4 w-4" />
                        </a>
                    </Button>
                 </div>
            </CardContent>
        </Card>
      )}

    </div>
  );
}
