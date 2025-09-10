import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { mockSermons, mockWeeklyContent } from "@/lib/mock-data";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowRight, Gamepad2, MessageSquare, PenSquare } from "lucide-react";
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

export function MemberDashboard() {
  const publishedSermon = mockSermons.find(s => s.status === 'PUBLISHED');
  if (!publishedSermon) return <p>No weekly content published yet.</p>;
  
  const weeklyContent = mockWeeklyContent.find(wc => wc.sermonId === publishedSermon.id);
  if (!weeklyContent) return <p>Content not found for this week's sermon.</p>;

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
                    src={weeklyContent.themeImageUrl} 
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
                    <SheetContent className="w-full sm:w-[540px] p-0 flex flex-col">
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
    </div>
  );
}
