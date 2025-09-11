
'use client';
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import { getMockSermons, getMockWeeklyContent } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Gamepad2, Headphones, MessageCircleQuestion, Users, User, HeartHandshake, MessageSquare, MicVocal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sermon, WeeklyContent, Game } from "@/lib/types";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GamePlayer } from "@/components/games/game-player";
import { useToast } from "@/hooks/use-toast";

export default function WeeklyPage() {
  const params = useParams();
  const weekId = params.weekId as string;

  const [sermon, setSermon] = useState<Sermon | undefined>(undefined);
  const [weeklyContent, setWeeklyContent] = useState<WeeklyContent | undefined | null>(undefined);

  useEffect(() => {
    if (weekId) {
        const sermons = getMockSermons();
        const currentSermon = sermons.find(s => s.id === weekId);
        setSermon(currentSermon);

        if (currentSermon) {
            const content = getMockWeeklyContent().find(wc => wc.sermonId === currentSermon.id);
            setWeeklyContent(content);
        }
    }

  }, [weekId]);

  if (sermon === undefined || weeklyContent === undefined) {
    return <div>Loading...</div>; // Or a skeleton loader
  }

  if (!sermon || !weeklyContent) {
     const placeholderSermon = getMockSermons().find(s => s.id === weekId);
     const placeholderContent: WeeklyContent = {
        id: 'wc-placeholder',
        tenantId: 'tenant-1',
        sermonId: placeholderSermon?.id || 'sermon-placeholder',
        summaryShort: 'Summary not available.',
        summaryLong: 'Devotional guide not available.',
        devotionals: [],
        reflectionQuestions: [],
        games: [],
    };
    return <WeeklyPageContent sermon={placeholderSermon || {} as Sermon} weeklyContent={placeholderContent} />;
  }
  
  return <WeeklyPageContent sermon={sermon} weeklyContent={weeklyContent} />;
}


function WeeklyPageContent({ sermon, weeklyContent }: { sermon: Sermon, weeklyContent: WeeklyContent }) {
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSaveAnswers = () => {
    // In a real app, this would save to a database.
    // For now, we'll just show a confirmation toast.
    console.log("Saving answers:", answers);
    toast({
      title: "Answers Saved",
      description: "Your reflections have been saved.",
    });
  };

  const getIconForAudience = (audience: string) => {
    switch (audience) {
        case 'Youth': return <User className="h-4 w-4" />;
        case 'Families': return <Users className="h-4 w-4" />;
        case 'Small Groups': return <Users className="h-4 w-4" />;
        case 'Individuals': return <User className="h-4 w-4" />;
        default: return <Users className="h-4 w-4" />;
    }
  };

  if (!weeklyContent) {
    return <div>No content available for this week.</div>
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {weeklyContent.id !== 'wc-placeholder' && (
      <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg">
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
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><HeartHandshake /> Feedback</CardTitle>
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

      <Card id="games">
          <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><Gamepad2 /> Interactive Games</CardTitle>
              <CardDescription>Engage with the sermon in a fun new way.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weeklyContent.games?.map((game: Game, index: number) => (
                  <Dialog key={index}>
                      <DialogTrigger asChild>
                          <Card className="hover:bg-accent/50 cursor-pointer transition-colors flex flex-col h-full">
                              <CardHeader className="flex-grow">
                                  <CardTitle className="text-lg">{game.title}</CardTitle>
                                  <CardDescription>Game Type: {game.type}</CardDescription>
                              </CardHeader>
                              <CardFooter>
                                <Badge variant="secondary" className="w-fit">{game.audience}</Badge>
                              </CardFooter>
                          </Card>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                          <DialogHeader>
                          <DialogTitle>{game.title}</DialogTitle>
                          <DialogDescription>
                              An interactive '{game.type}' game for {game.audience}.
                          </DialogDescription>
                          </DialogHeader>
                          <GamePlayer game={game} />
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
          <CardContent className="space-y-6">
              {weeklyContent.reflectionQuestions.map((group, groupIndex) => (
                  <div key={group.audience}>
                      <h3 className="font-semibold flex items-center gap-2 mb-4 text-lg border-b pb-2">{getIconForAudience(group.audience)} {group.audience}</h3>
                      <div className="space-y-6">
                          {group.questions.map((q, i) => {
                            const questionId = `q-${groupIndex}-${i}`;
                            return (
                                <div key={i} className="grid w-full gap-2">
                                    <Label htmlFor={questionId} className="text-base">{q}</Label>
                                    <Textarea 
                                        placeholder="Type your answer here..." 
                                        id={questionId} 
                                        rows={4}
                                        value={answers[questionId] || ''}
                                        onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                                    />
                                </div>
                            )
                          })}
                      </div>
                  </div>
              ))}
          </CardContent>
          <CardFooter>
              <Button onClick={handleSaveAnswers}>Save Answers</Button>
          </CardFooter>
      </Card>
    </div>
  );
}

    