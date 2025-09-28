

'use client';
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import { getMockSermons, getMockWeeklyContent, getAnswersForSermon, saveAnswersForSermon, getGameScoresForSermon, saveGameScore } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Gamepad2, Headphones, MessageCircleQuestion, Users, User, HeartHandshake, MessageSquare, MicVocal, Languages, BookOpen, HandHeart, Sparkles, Globe, Target, Briefcase, Flower, Puzzle, Search, Brackets, Binary, WholeWord, KeyRound, Type, CheckSquare, Brain, Quote, ListChecks, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sermon, WeeklyContent, Game, VerseScrambleItem, BibleReadingPlanItem, SpiritualPractice, OutwardFocusItem } from "@/lib/types";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GamePlayer } from "@/components/games/game-player";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { MemoryVerseCard } from "@/components/sermons/memory-verse-card";
import { PrayerWall } from "@/components/sermons/prayer-wall";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function WeeklyPage() {
  const params = useParams();
  const weekId = params.weekId as string;
  const { user } = useAuth();
  const [sermon, setSermon] = useState<Sermon | undefined>(undefined);
  const [allContent, setAllContent] = useState<Record<string, WeeklyContent | undefined>>({});
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [gameScores, setGameScores] = useState<Record<string, number>>({});
  
  const weeklyContent = allContent[selectedLanguage];

  useEffect(() => {
    if (weekId) {
        const sermons = getMockSermons();
        const currentSermon = sermons.find(s => s.id === weekId);
        setSermon(currentSermon);

        if (currentSermon?.weeklyContentIds) {
            const allMockContent = getMockWeeklyContent();
            const contents: Record<string, WeeklyContent | undefined> = {};
            for (const lang in currentSermon.weeklyContentIds) {
                const contentId = currentSermon.weeklyContentIds[lang];
                contents[lang] = allMockContent.find(wc => wc.id === contentId);
            }
            setAllContent(contents);
            setSelectedLanguage(contents['en'] ? 'en' : Object.keys(contents)[0] || 'en');
        }
        
        if (user && weekId) {
            const savedAnswers = getAnswersForSermon(user.id, weekId);
            setAnswers(savedAnswers);
            const savedGameScores = getGameScoresForSermon(user.id, weekId);
            setGameScores(savedGameScores);
        }
    }
  }, [weekId, user]);

  if (sermon === undefined || Object.keys(allContent).length === 0) {
    return <div>Loading...</div>;
  }

  if (!sermon || !weeklyContent) {
     const placeholderSermon = getMockSermons().find(s => s.id === weekId);
     const placeholderContent: WeeklyContent = {
        id: 'wc-placeholder',
        tenantId: 'tenant-1',
        sermonId: placeholderSermon?.id || 'sermon-placeholder',
        language: 'en',
        summaryShort: 'Summary not available.',
        summaryLong: 'Devotional guide not available.',
        oneLiners: { tuesday: '', thursday: '' },
        sendOneLiners: false,
        devotionals: [],
        reflectionQuestions: [],
        games: [],
        bibleReadingPlan: [],
        spiritualPractices: [],
        outwardFocus: {
            missionFocus: { title: 'Not available', description: '', details: '' },
            serviceChallenge: { title: 'Not available', description: '', details: '' },
            culturalEngagement: { title: 'Not available', description: '', details: '' },
        },
    };
    return <WeeklyPageContent sermon={placeholderSermon || {} as Sermon} weeklyContent={placeholderContent} answers={{}} setAnswers={setAnswers} gameScores={{}} setGameScores={() => {}} availableLanguages={[]} selectedLanguage="en" onSelectLanguage={() => {}} />;
  }
  
  return <WeeklyPageContent 
    sermon={sermon} 
    weeklyContent={weeklyContent} 
    answers={answers} 
    setAnswers={setAnswers} 
    gameScores={gameScores}
    setGameScores={setGameScores}
    availableLanguages={Object.keys(allContent)}
    selectedLanguage={selectedLanguage}
    onSelectLanguage={setSelectedLanguage}
    />;
}


function WeeklyPageContent({ sermon, weeklyContent, answers, setAnswers, gameScores, setGameScores, availableLanguages, selectedLanguage, onSelectLanguage }: { sermon: Sermon, weeklyContent: WeeklyContent, answers: Record<string, string>, setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>, gameScores: Record<string, number>, setGameScores: React.Dispatch<React.SetStateAction<Record<string, number>>>, availableLanguages: string[], selectedLanguage: string, onSelectLanguage: (lang: string) => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSaveAnswers = () => {
    if (user) {
        saveAnswersForSermon(user.id, sermon.id, answers);
        toast({
        title: "Answers Saved",
        description: "Your reflections have been saved.",
        });
    } else {
        toast({
            variant: "destructive",
            title: "Not Logged In",
            description: "You must be logged in to save your answers."
        });
    }
  };

  const handleGameScoreChange = (gameTitle: string, newScore: number) => {
    if (user) {
        setGameScores(prev => ({ ...prev, [gameTitle]: newScore }));
        saveGameScore(user.id, sermon.id, gameTitle, newScore);
    }
  };

  const totalPoints = Object.values(gameScores).reduce((sum, score) => sum + score, 0);

  const getIconForAudience = (audience: string) => {
    switch (audience) {
        case 'Youth': return <User className="h-4 w-4" />;
        case 'Families': return <Users className="h-4 w-4" />;
        case 'Small Groups': return <Users className="h-4 w-4" />;
        case 'Individuals': return <User className="h-4 w-4" />;
        default: return <Users className="h-4 w-4" />;
    }
  };

  const getIconForGame = (gameType: Game['type']) => {
    switch (gameType) {
        case 'Quiz': return <ListChecks className="w-8 h-8 text-primary" />;
        case 'Word Search': return <Search className="w-8 h-8 text-primary" />;
        case 'Fill in the Blank': return <Brackets className="w-8 h-8 text-primary" />;
        case 'Matching': return <Puzzle className="w-8 h-8 text-primary" />;
        case 'Word Guess': return <Brain className="w-8 h-8 text-primary" />;
        case 'Wordle': return <WholeWord className="w-8 h-8 text-primary" />;
        case 'Jeopardy': return <Binary className="w-8 h-8 text-primary" />;
        case 'Verse Scramble': return <Type className="w-8 h-8 text-primary" />;
        case 'True/False': return <CheckSquare className="w-8 h-8 text-primary" />;
        case 'Word Cloud Hunt': return <Quote className="w-8 h-8 text-primary" />;
        case 'Two Truths and a Lie': return <Puzzle className="w-8 h-8 text-primary" />;
        case 'Sermon Escape Room': return <KeyRound className="w-8 h-8 text-primary" />;
        default: return <Gamepad2 className="w-8 h-8 text-primary" />;
    }
  }

  if (!weeklyContent) {
    return <div>No content available for this week.</div>
  }

  const heroImage = sermon.artworkUrl || `https://picsum.photos/seed/${sermon.id}/1200/800`;
  const showLanguageSwitcher = availableLanguages.length > 1;

  const verseScrambleGame = weeklyContent.games?.find(g => g.type === 'Verse Scramble') as Game | undefined;
  const verseData = verseScrambleGame?.data as VerseScrambleItem | undefined;


  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {weeklyContent.id !== 'wc-placeholder' && (
      <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg">
        <Image 
          src={heroImage}
          alt={`Theme for ${sermon.title}`} 
          fill 
          className="object-cover"
          data-ai-hint="spiritual abstract"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute top-4 right-4 z-10">
            {showLanguageSwitcher && (
                <div className="flex items-center gap-1 bg-black/50 p-1 rounded-full">
                    <Button size="sm" variant={selectedLanguage === 'en' ? 'secondary' : 'ghost'} className="rounded-full" onClick={() => onSelectLanguage('en')}>EN</Button>
                    <Button size="sm" variant={selectedLanguage === 'es' ? 'secondary' : 'ghost'} className="rounded-full" onClick={() => onSelectLanguage('es')}>ES</Button>
                </div>
            )}
        </div>
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

           {weeklyContent.bibleReadingPlan && weeklyContent.bibleReadingPlan.length > 0 && (
            <Card id="reading-plan">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><BookOpen /> Bible Reading Plan</CardTitle>
                    <CardDescription>Explore passages related to this week's sermon theme.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {weeklyContent.bibleReadingPlan.map((item: BibleReadingPlanItem, index: number) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger className="text-lg font-semibold">{item.theme}</AccordionTrigger>
                                <AccordionContent className="space-y-4">
                                    {item.passages.map((passage, pIndex) => (
                                        <div key={pIndex} className="p-4 rounded-lg bg-muted/50">
                                            <h4 className="font-bold text-primary">{passage.reference}</h4>
                                            <p className="text-sm text-muted-foreground mt-1">{passage.explanation}</p>
                                        </div>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
           )}

            {weeklyContent.spiritualPractices && weeklyContent.spiritualPractices.length > 0 && (
            <Card id="spiritual-practices">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><HandHeart /> Spiritual Practice Challenges</CardTitle>
                    <CardDescription>Put this week's sermon into action with these practical challenges.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {weeklyContent.spiritualPractices.map((item: SpiritualPractice, index: number) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger className="text-lg font-semibold">{item.title}</AccordionTrigger>
                                <AccordionContent className="prose prose-stone dark:prose-invert max-w-none">
                                    <p>{item.description}</p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
           )}

        </div>

        <div className="space-y-8">
            {verseData && verseScrambleGame && <MemoryVerseCard verse={verseData.verse} reference={verseData.reference} game={verseScrambleGame} onScoreChange={(score) => handleGameScoreChange('Verse Scramble', score)} initialScore={gameScores['Verse Scramble'] || 0} />}
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Sparkles /> God Stories</CardTitle>
                    <CardDescription>Share how God is working in your life through this week's theme.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <a href={`mailto:stories@ktazo.com?subject=My Story: Week of ${sermon.title}`}>
                            <MessageSquare className="mr-2 h-4 w-4"/> Share Your Story
                        </a>
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><HeartHandshake /> Prayer Requests</CardTitle>
                    <CardDescription>Join our community in prayer. View requests or share your own.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <a href="#prayer-wall">
                            Go to Prayer Wall
                        </a>
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Flower /> Self-Assessment</CardTitle>
                    <CardDescription>Reflect on your spiritual growth and well-being.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full" disabled>
                        Flourishing
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>

       {weeklyContent.outwardFocus && (
        <Card id="outward-focus">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Globe /> Outward Focus</CardTitle>
                <CardDescription>Apply the sermon's message beyond the church walls.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="mission" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="mission"><Target className="w-4 h-4 mr-2"/>Mission</TabsTrigger>
                        <TabsTrigger value="service"><HeartHandshake className="w-4 h-4 mr-2"/>Service</TabsTrigger>
                        <TabsTrigger value="culture"><Briefcase className="w-4 h-4 mr-2"/>Culture</TabsTrigger>
                    </TabsList>
                    <TabsContent value="mission" className="mt-4 prose prose-stone dark:prose-invert max-w-none p-4 border-t-4 border-red-500 rounded-b-lg">
                        <h3 className="font-bold">{weeklyContent.outwardFocus.missionFocus.title}</h3>
                        <p className="text-sm">{weeklyContent.outwardFocus.missionFocus.description}</p>
                        <p className="text-sm text-muted-foreground">{weeklyContent.outwardFocus.missionFocus.details}</p>
                    </TabsContent>
                    <TabsContent value="service" className="mt-4 prose prose-stone dark:prose-invert max-w-none p-4 border-t-4 border-pink-500 rounded-b-lg">
                        <h3 className="font-bold">{weeklyContent.outwardFocus.serviceChallenge.title}</h3>
                         <p className="text-sm">{weeklyContent.outwardFocus.serviceChallenge.description}</p>
                        <p className="text-sm text-muted-foreground">{weeklyContent.outwardFocus.serviceChallenge.details}</p>
                    </TabsContent>
                    <TabsContent value="culture" className="mt-4 prose prose-stone dark:prose-invert max-w-none p-4 border-t-4 border-amber-600 rounded-b-lg">
                        <h3 className="font-bold">{weeklyContent.outwardFocus.culturalEngagement.title}</h3>
                         <p className="text-sm">{weeklyContent.outwardFocus.culturalEngagement.description}</p>
                        <p className="text-sm text-muted-foreground">{weeklyContent.outwardFocus.culturalEngagement.details}</p>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
       )}

      <Card id="games">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="font-headline flex items-center gap-2"><Gamepad2 /> Interactive Games</CardTitle>
              <div className="flex items-center gap-2 text-xl font-bold text-primary">
                  <Star className="text-yellow-400 fill-yellow-400" />
                  <span>{totalPoints} Points</span>
              </div>
            </div>
            <CardDescription>Engage with the sermon in a fun new way and earn points!</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weeklyContent.games?.map((game: Game, index: number) => (
                  <Dialog key={`${game.title}-${index}`}>
                      <DialogTrigger asChild>
                          <Card className="hover:bg-accent/50 cursor-pointer transition-colors flex flex-col h-full">
                              <CardHeader className="flex-grow">
                                <div className="flex justify-between items-start gap-4">
                                  <div>
                                    <CardTitle className="text-lg">{game.title}</CardTitle>
                                    <CardDescription>Game Type: {game.type}</CardDescription>
                                  </div>
                                  {getIconForGame(game.type)}
                                </div>
                              </CardHeader>
                              <CardFooter className="flex justify-between items-center">
                                <Badge variant="secondary" className="w-fit">{game.audience}</Badge>
                                {gameScores[game.title] > 0 && (
                                    <div className="flex items-center gap-1 text-sm font-semibold text-yellow-500">
                                        <Star className="h-4 w-4 fill-current" />
                                        <span>{gameScores[game.title]}</span>
                                    </div>
                                )}
                              </CardFooter>
                          </Card>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                          <GamePlayer game={game} onScoreChange={(score) => handleGameScoreChange(game.title, score)} initialScore={gameScores[game.title] || 0} />
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
                  <div key={`${group.audience}-${groupIndex}`}>
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

      <PrayerWall sermonId={sermon.id} />
    </div>
  );
}
