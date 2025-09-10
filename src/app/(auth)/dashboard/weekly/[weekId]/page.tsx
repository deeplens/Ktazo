
'use client';
import { notFound } from "next/navigation";
import Image from "next/image";
import { getMockSermons, mockWeeklyContent, mockGames } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Gamepad2, Headphones, MessageCircleQuestion, Users, User, HeartHand, MessageSquare, MicVocal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sermon, WeeklyContent } from "@/lib/types";
import { useEffect, useState } from "react";

export default function WeeklyPage({ params }: { params: { weekId: string } }) {
  const [sermon, setSermon] = useState<Sermon | undefined>(undefined);
  const [weeklyContent, setWeeklyContent] = useState<WeeklyContent | undefined | null>(undefined);

  useEffect(() => {
    const sermons = getMockSermons();
    const currentSermon = sermons.find(s => s.id === params.weekId);
    setSermon(currentSermon);

    if (currentSermon) {
        const content = mockWeeklyContent.find(wc => wc.sermonId === currentSermon.id);
        setWeeklyContent(content);
    }

  }, [params.weekId]);

  if (sermon === undefined || weeklyContent === undefined) {
    return <div>Loading...</div>; // Or a skeleton loader
  }

  if (!sermon || !sermon.weeklyContentId || !weeklyContent) {
    // This is mock, let's create a placeholder if it doesn't exist
     const placeholderContent: WeeklyContent = {
        id: 'wc-placeholder',
        tenantId: 'tenant-1',
        sermonId: sermon?.id || 'sermon-placeholder',
        summaryShort: 'Summary not available.',
        summaryLong: 'Devotional guide not available.',
        devotionals: [],
        reflectionQuestions: [],
    };
    return <WeeklyPageContent sermon={sermon || {} as Sermon} weeklyContent={placeholderContent} />;
  }
  
  return <WeeklyPageContent sermon={sermon} weeklyContent={weeklyContent} />;
}


function WeeklyPageContent({ sermon, weeklyContent }: { sermon: Sermon, weeklyContent: WeeklyContent }) {
  const games = mockGames.filter(g => g.sermonId === sermon.id);

  const getIconForAudience = (audience: string) => {
    switch (audience) {
        case 'Youth': return <User className="h-4 w-4" />;
        case 'Families': return <Users className="h-4 w-4" />;
        case 'Small Groups': return <Users className="h-4 w-4" />;
        case 'Individuals': return <User className="h-4 w-4" />;
        default: return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {weeklyContent.id !== 'wc-placeholder' && (
      <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-8 shadow-lg">
        <Image 
          src={`https://picsum.photos/seed/${sermon.id}/1200/800`}
          alt={`Theme for ${sermon.title}`} 
          fill 
          className="object-cover"
          data-ai-hint="spiritual abstract"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
            <Badge variant="secondary" className="mb-2">Weekly Theme</Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-white font-headline">{sermon.title}</h1>
            <p className="text-white/80 mt-2 flex items-center gap-2">
                <MicVocal className="h-5 w-5"/>
                {sermon.speaker}
            </p>
        </div>
      </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card id="devotionals">
            <CardHeader>
              <CardTitle className="font-headline">Devotional Guide</CardTitle>
              <CardDescription>{weeklyContent.summaryLong}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible defaultValue="item-0">
                {weeklyContent.devotionals.map((devotional: any, index: number) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-lg font-semibold">{devotional.day}</AccordionTrigger>
                    <AccordionContent className="prose prose-stone dark:prose-invert max-w-none">
                      {devotional.day === 'Monday' && weeklyContent.mondayClipUrl ? (
                        <div className="space-y-4">
                            <p>{devotional.content}</p>
                            <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-lg">
                               <Headphones className="h-10 w-10 text-primary"/>
                               <div>
                                    <h4 className="font-bold">Listen to the Monday Audio Overview</h4>
                                    <p className="text-sm text-muted-foreground">A podcast-style discussion of the sermon.</p>
                                    <audio controls src={weeklyContent.mondayClipUrl} className="mt-2 w-full"></audio>
                               </div>
                            </div>
                        </div>
                      ) : (
                        <p>{devotional.content}</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
            <Card id="games">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Gamepad2 /> Interactive Games</CardTitle>
                    <CardDescription>Engage with the sermon in a fun new way.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {games.map(game => (
                        <Dialog key={game.id}>
                            <DialogTrigger asChild>
                                <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{game.title}</CardTitle>
                                        <Badge variant="secondary" className="w-fit">{game.audience}</Badge>
                                    </CardHeader>
                                </Card>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                <DialogTitle>{game.title}</DialogTitle>
                                <DialogDescription>
                                    This is a placeholder for the '{game.type}' game.
                                </DialogDescription>
                                </DialogHeader>
                                <div className="py-8 text-center">
                                    <p>Game content would be loaded here.</p>
                                    <Button className="mt-4">Start Game</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    ))}
                </CardContent>
            </Card>

            <Card id="reflection-questions">
                <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><MessageCircleQuestion /> Reflection Questions</CardTitle>
                <CardDescription>Ponder these questions on your own, or discuss them with your family, friends, or small group.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {weeklyContent.reflectionQuestions.map(group => (
                        <div key={group.audience} className="p-4 bg-background rounded-lg border">
                            <h3 className="font-semibold flex items-center gap-2 mb-2">{getIconForAudience(group.audience)} {group.audience}</h3>
                            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                                {group.questions.map((q, i) => <li key={i}>{q}</li>)}
                            </ul>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><HeartHand /> Feedback</CardTitle>
                    <CardDescription>Share your thoughts on this week's content.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full">
                        <MessageSquare className="mr-2 h-4 w-4"/> Give Feedback
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
