

'use client';
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import { getMockSermons, getMockWeeklyContent, getAnswersForSermon, saveAnswersForSermon, getGameScoresForSermon, saveGameScore, getGlobalLeaderboard } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Gamepad2, Headphones, MessageCircleQuestion, Users, User, HeartHandshake, MessageSquare, MicVocal, Languages, BookOpen, HandHeart, Sparkles, Globe, Target, Briefcase, Flower, Puzzle, Search, Brackets, Binary, WholeWord, KeyRound, Type, CheckSquare, Brain, Quote, ListChecks, Star, Wrench, Trophy, Award, Info, Heart, Smile, PiggyBank, Leaf, Scale, Cross, ArrowLeft, Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Sermon, WeeklyContent, Game, VerseScrambleItem, BibleReadingPlanItem, SpiritualPractice, OutwardFocusItem, JeopardyCategory, FlourishingCategoryName, FlourishingQuestionSet, JourneyQuestion } from "@/lib/types";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GamePlayer } from "@/components/games/game-player";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { MemoryVerseCard } from "@/components/sermons/memory-verse-card";
import { PrayerWall } from "@/components/sermons/prayer-wall";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ServiceWall } from "@/components/sermons/service-wall";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getLevelForPoints, faithLevels } from "@/lib/levels";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { flourishingQuestions } from "@/lib/flourishing-questions";
import { MyJourney } from "@/components/sermons/my-journey";

export default function WeeklyPage() {
  const params = useParams();
  const weekId = params.weekId as string;
  const { user } = useAuth();
  const [sermon, setSermon] = useState<Sermon | undefined>(undefined);
  const [allContent, setAllContent] = useState<Record<string, WeeklyContent | undefined>>({});
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [gameScores, setGameScores] = useState<Record<string, number>>({});
  const [leaderboard, setLeaderboard] = useState<{ userId: string, userName: string, userPhotoUrl?: string, totalScore: number }[]>([]);
  
  const weeklyContent = allContent[selectedLanguage];

  useEffect(() => {
    if (weekId) {
        const sermons = getMockSermons();
        const currentSermon = sermons.find(s => s.id === weekId);
        setSermon(currentSermon);
        setLeaderboard(getGlobalLeaderboard());

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
    return <WeeklyPageContent sermon={placeholderSermon || {} as Sermon} weeklyContent={placeholderContent} answers={{}} setAnswers={setAnswers} gameScores={{}} setGameScores={() => {}} availableLanguages={[]} selectedLanguage="en" onSelectLanguage={() => {}} leaderboard={[]} setLeaderboard={setLeaderboard} />;
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
    leaderboard={leaderboard}
    setLeaderboard={setLeaderboard}
    />;
}


function WeeklyPageContent({ sermon, weeklyContent, answers, setAnswers, gameScores, setGameScores, availableLanguages, selectedLanguage, onSelectLanguage, leaderboard, setLeaderboard }: { sermon: Sermon, weeklyContent: WeeklyContent, answers: Record<string, string>, setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>, gameScores: Record<string, number>, setGameScores: React.Dispatch<React.SetStateAction<Record<string, number>>>, availableLanguages: string[], selectedLanguage: string, onSelectLanguage: (lang: string) => void, leaderboard: { userId: string, userName: string, userPhotoUrl?: string, totalScore: number }[], setLeaderboard: React.Dispatch<React.SetStateAction<{ userId: string, userName: string, userPhotoUrl?: string, totalScore: number }[]>> }) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedFlourishingArea, setSelectedFlourishingArea] = useState<FlourishingCategoryName | null>(null);
  const [flourishingStep, setFlourishingStep] = useState<'ring' | 'objective' | 'subjective' | 'finished'>('ring');
  const [objectiveAnswer, setObjectiveAnswer] = useState<string | null>(null);
  const [subjectiveAnswer, setSubjectiveAnswer] = useState('');
  const [completedAreas, setCompletedAreas] = useState<Set<FlourishingCategoryName>>(new Set());
  
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
        const oldScores = getGameScoresForSermon(user.id, sermon.id);
        const oldGameScore = oldScores[gameTitle] || 0;
        const scoreDifference = newScore - oldGameScore;

        if (scoreDifference > 0) {
            const currentGlobalScores = getGlobalLeaderboard();
            const userTotalScore = currentGlobalScores.find(p => p.userId === user.id)?.totalScore || 0;
            const oldLevel = getLevelForPoints(userTotalScore);
            
            saveGameScore(user.id, sermon.id, gameTitle, newScore);
            setGameScores(prev => ({ ...prev, [gameTitle]: newScore }));

            const updatedGlobalScores = getGlobalLeaderboard();
            setLeaderboard(updatedGlobalScores);

            const newUserTotalScore = updatedGlobalScores.find(p => p.userId === user.id)?.totalScore || 0;
            const newLevel = getLevelForPoints(newUserTotalScore);

            if (newLevel.name !== oldLevel.name && newUserTotalScore > userTotalScore) {
                toast({
                    title: `Level Up! ${newLevel.icon}`,
                    description: newLevel.celebrationMessage,
                    duration: 5000,
                });
            }
        }
    }
  };

  const totalPoints = Object.values(gameScores).reduce((sum, score) => sum + score, 0);

  const totalPossiblePoints = weeklyContent.games?.reduce((total, game) => {
    if (game.type === 'Jeopardy' && Array.isArray(game.data)) {
      const jeopardyPoints = (game.data as JeopardyCategory[]).flatMap(c => c.questions).reduce((sum, q) => sum + q.points, 0);
      return total + jeopardyPoints;
    }
    // Most other games are worth 100 points
    return total + 100;
  }, 0);

  const handleAreaSelect = (area: FlourishingCategoryName) => {
    setSelectedFlourishingArea(area);
    setFlourishingStep('objective');
  };

  const resetFlourishing = () => {
    setSelectedFlourishingArea(null);
    setFlourishingStep('ring');
    setObjectiveAnswer(null);
    setSubjectiveAnswer('');
  };

  const handleAreaSubmit = () => {
    // Here you would save the answers for the specific area
    if (!selectedFlourishingArea) return;
    console.log({
        area: selectedFlourishingArea,
        objective: objectiveAnswer,
        subjective: subjectiveAnswer,
    });
    setCompletedAreas(prev => new Set(prev).add(selectedFlourishingArea));
    setFlourishingStep('finished');
  };

  const handleFinalSubmit = () => {
      // Logic to submit all collected anonymous data
      toast({
          title: "Assessment Submitted",
          description: "Thank you for providing your valuable feedback."
      });
  }


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

  if (!weeklyContent || !user) {
    return <div>No content available for this week.</div>
  }
  
  const currentUserScore = leaderboard.find(p => p.userId === user.id)?.totalScore || 0;
  const userLevel = getLevelForPoints(currentUserScore);
  const progressPercentage = userLevel.maxPoints === Infinity ? 100 : ((currentUserScore - userLevel.minPoints) / (userLevel.maxPoints - userLevel.minPoints)) * 100;

  const groupedLevels = faithLevels.reduce((acc, level) => {
    const stageKey = level.stage;
    if (!acc[stageKey]) {
      acc[stageKey] = [];
    }
    acc[stageKey].push(level);
    return acc;
  }, {} as Record<string, typeof faithLevels>);

  const stageOrder = [
    'Stage 1 – Foundation',
    'Stage 2 – Growth',
    'Stage 3 – Strengthening',
    'Stage 4 – Deepening',
    'Stage 5 – Builders',
    'Stage 6 – Overcomers',
    'Stage 7 – Eternal Legacy'
  ];

  const heroImage = sermon.artworkUrl || `https://picsum.photos/seed/${sermon.id}/1200/800`;
  const showLanguageSwitcher = availableLanguages.length > 1;

  const verseScrambleGame = weeklyContent.games?.find(g => g.type === 'Verse Scramble') as Game | undefined;
  const verseData = verseScrambleGame?.data as VerseScrambleItem | undefined;

  const flourishingAreas: { name: FlourishingCategoryName, icon: React.ElementType }[] = [
      { name: 'Character', icon: Scale },
      { name: 'Relationships', icon: Heart },
      { name: 'Happiness', icon: Smile },
      { name: 'Meaning', icon: Brain },
      { name: 'Health', icon: Leaf },
      { name: 'Finances', icon: PiggyBank },
      { name: 'Faith', icon: Cross },
  ];
  
  const allAreasCompleted = flourishingAreas.length === completedAreas.size;

  const renderFlourishingContent = () => {
    const questions = selectedFlourishingArea ? flourishingQuestions[selectedFlourishingArea]?.questions : null;

    switch (flourishingStep) {
        case 'ring':
            return (
                <>
                <DialogHeader>
                    <DialogTitle>Flourishing Self-Assessment</DialogTitle>
                    <DialogDescription>In which area of your life would you like to focus on growth today?</DialogDescription>
                </DialogHeader>
                <div className="relative flex-1 flex items-center justify-center h-80">
                    {flourishingAreas.map((area, index) => {
                        const angle = (index / flourishingAreas.length) * 2 * Math.PI - (Math.PI / 2);
                        const radius = 120; // adjust for size
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;
                        const Icon = area.icon;

                        return (
                            <div
                                key={area.name}
                                className="absolute flex flex-col items-center justify-center"
                                style={{
                                    transform: `translate(${x}px, ${y}px)`
                                }}
                            >
                                <Button variant="outline" className="w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1 shadow-lg hover:scale-105 transition-transform" onClick={() => handleAreaSelect(area.name)}>
                                    <Icon className={cn("w-8 h-8", completedAreas.has(area.name) ? 'text-green-500' : 'text-primary')} />
                                    <span className="text-xs">{area.name}</span>
                                    {completedAreas.has(area.name) && <CheckSquare className="w-4 h-4 text-green-500 absolute top-1 right-1" />}
                                </Button>
                            </div>
                        );
                    })}
                </div>
                </>
            );
        case 'objective':
            if (!questions) return null;
            return (
                <>
                    <DialogHeader>
                        <DialogTitle>{selectedFlourishingArea} - Objective Question</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="whitespace-pre-wrap">{questions.objective.question}</p>
                        <RadioGroup value={objectiveAnswer || ''} onValueChange={setObjectiveAnswer}>
                            {questions.objective.options.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <RadioGroupItem value={String(index)} id={`option-${index}`} />
                                    <Label htmlFor={`option-${index}`}>{option}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={resetFlourishing}>Back to Areas</Button>
                        <Button onClick={() => setFlourishingStep('subjective')} disabled={objectiveAnswer === null}>Next</Button>
                    </DialogFooter>
                </>
            );
        case 'subjective':
            if (!questions) return null;
            return (
                 <>
                    <DialogHeader>
                        <DialogTitle>{selectedFlourishingArea} - Subjective Reflection</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>{questions.subjective.prompt1}</Label>
                            <Label className="text-muted-foreground">{questions.subjective.prompt2}</Label>
                        </div>
                        <Textarea 
                            placeholder="Share your thoughts here..."
                            rows={8}
                            value={subjectiveAnswer}
                            onChange={(e) => setSubjectiveAnswer(e.target.value)}
                        />
                    </div>
                     <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setFlourishingStep('objective')}>Back</Button>
                        <Button onClick={handleAreaSubmit} disabled={!subjectiveAnswer.trim()}>Submit</Button>
                    </DialogFooter>
                </>
            );
        case 'finished':
            return (
                <>
                    <DialogHeader className="text-center items-center">
                        <CheckSquare className="w-16 h-16 text-green-500" />
                        <DialogTitle>Thank You for your response for '{selectedFlourishingArea}'!</DialogTitle>
                        <DialogDescription>Your anonymous response has been recorded.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="justify-center">
                         <Button onClick={resetFlourishing}>Back to Assessment</Button>
                    </DialogFooter>
                </>
            )
        default: return null;
    }
  }

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
                    <CardTitle className="font-headline flex items-center gap-2"><Wrench /> Service Wall</CardTitle>
                    <CardDescription>Offer or request help from your church community.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <a href="#service-wall">
                            Go to Service Wall
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
                     <Dialog onOpenChange={(open) => !open && resetFlourishing()}>
                        <DialogTrigger asChild>
                            <Button className="w-full" variant="outline">
                                Start Flourishing Assessment
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl min-h-[600px] flex flex-col">
                            {renderFlourishingContent()}
                            {flourishingStep === 'ring' && (
                                <DialogFooter>
                                    <Button onClick={handleFinalSubmit} disabled={!allAreasCompleted}>
                                        Submit Assessment ({completedAreas.size}/{flourishingAreas.length} Completed)
                                    </Button>
                                </DialogFooter>
                            )}
                             <div className="text-xs text-muted-foreground p-4 bg-muted rounded-md mt-auto">
                                <p>These questions are intended to assess the current state of human flourishing in congregations. Your answers will not include your name. All your responses are anonymous. These results may be used to provide Gloo with insight into larger trends in human flourishing.</p>
                            </div>
                        </DialogContent>
                    </Dialog>
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
                        <TabsTrigger value="mission" className={cn('data-[state=active]:bg-gray-200 dark:data-[state=active]:bg-gray-700')}><Target className="w-4 h-4 mr-2"/>Mission</TabsTrigger>
                        <TabsTrigger value="service" className={cn('data-[state=active]:bg-gray-200 dark:data-[state=active]:bg-gray-700')}><HeartHandshake className="w-4 h-4 mr-2"/>Service</TabsTrigger>
                        <TabsTrigger value="culture" className={cn('data-[state=active]:bg-gray-200 dark:data-[state=active]:bg-gray-700')}><Briefcase className="w-4 h-4 mr-2"/>Culture</TabsTrigger>
                    </TabsList>
                    <TabsContent value="mission" className="mt-4 prose prose-stone dark:prose-invert max-w-none p-4 rounded-b-lg">
                        <h3 className="font-bold">{weeklyContent.outwardFocus.missionFocus.title}</h3>
                        <p className="text-sm">{weeklyContent.outwardFocus.missionFocus.description}</p>
                        <p className="text-sm text-muted-foreground">{weeklyContent.outwardFocus.missionFocus.details}</p>
                    </TabsContent>
                    <TabsContent value="service" className="mt-4 prose prose-stone dark:prose-invert max-w-none p-4 rounded-b-lg">
                        <h3 className="font-bold">{weeklyContent.outwardFocus.serviceChallenge.title}</h3>
                         <p className="text-sm">{weeklyContent.outwardFocus.serviceChallenge.description}</p>
                        <p className="text-sm text-muted-foreground">{weeklyContent.outwardFocus.serviceChallenge.details}</p>
                    </TabsContent>
                    <TabsContent value="culture" className="mt-4 prose prose-stone dark:prose-invert max-w-none p-4 rounded-b-lg">
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
            <div className="flex justify-between items-start gap-4">
              <div>
                <CardTitle className="font-headline flex items-center gap-2"><Gamepad2 /> Interactive Games</CardTitle>
                <CardDescription>Engage with the sermon in a fun new way and earn points!</CardDescription>
              </div>
               <div className="text-right space-y-1">
                <div className="flex items-center gap-2 text-xl font-bold text-primary">
                    <Star className="text-yellow-400 fill-yellow-400" />
                    <span>{totalPoints} / {totalPossiblePoints} Points This Week</span>
                </div>
                <div className="flex items-center justify-end gap-2">
                    <div className="w-64">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger className="w-full text-left">
                                    <div className="text-sm font-semibold flex justify-between mb-1">
                                        <span>{userLevel.stage.split(' – ')[1]}: {userLevel.name}</span>
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
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Info className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Faith Journey Game Levels</DialogTitle>
                                <DialogDescription>
                                    This progression rewards long-term play, keeps people encouraged, and reinforces scripture at every milestone.
                                </DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="max-h-[60vh] pr-6">
                                <div className="space-y-6">
                                    {stageOrder.map((stageKey) => {
                                        const levels = groupedLevels[stageKey];
                                        if (!levels) return null;
                                        
                                        return (
                                            <div key={stageKey}>
                                                <h3 className="text-lg font-semibold mb-2 border-b pb-1">{stageKey.replace('–', ':')}</h3>
                                                <div className="space-y-4">
                                                    {levels.map(level => (
                                                        <div key={level.name}>
                                                            <p className="font-bold">{level.minPoints.toLocaleString()} - {level.maxPoints === Infinity ? '∞' : level.maxPoints.toLocaleString()} pts → {level.name}</p>
                                                            <blockquote className="pl-4 border-l-2 ml-2 mt-1">
                                                                <p className="text-sm italic text-muted-foreground">&quot;{level.quote}&quot; — {level.reference}</p>
                                                            </blockquote>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </ScrollArea>
                        </DialogContent>
                    </Dialog>
                </div>
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="link" size="sm" className="h-auto p-0 justify-end">
                            <Trophy className="mr-2 h-4 w-4" />
                            View Overall Leaderboard
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Overall Leaderboard</DialogTitle>
                            <DialogDescription>Top scores from all weeks.</DialogDescription>
                        </DialogHeader>
                         <div className="space-y-4 pt-4">
                            {leaderboard.map((player, index) => (
                                <div key={player.userId} className={cn("flex items-center gap-4 p-3 rounded-lg", index < 3 ? 'bg-accent/50' : '')}>
                                    <div className="flex items-center gap-2 w-10">
                                        {index < 3 ? (
                                            <Trophy className={cn("h-6 w-6", 
                                                index === 0 && "text-yellow-500",
                                                index === 1 && "text-gray-400",
                                                index === 2 && "text-amber-700"
                                            )} />
                                        ) : (
                                            <span className="text-center w-6 text-muted-foreground font-semibold">{index + 1}</span>
                                        )}
                                    </div>
                                    <Avatar className="h-10 w-10 border">
                                        <AvatarImage src={player.userPhotoUrl} />
                                        <AvatarFallback>{player.userName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <p className="font-semibold flex-1">{player.userName}</p>
                                    <p className="font-bold text-primary">{player.totalScore} pts</p>
                                </div>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
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
                        <DialogHeader>
                            <DialogTitle>{game.title}</DialogTitle>
                            <DialogDescription>An interactive '{game.type}' game for {game.audience}.</DialogDescription>
                        </DialogHeader>
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
          <CardContent>
            <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                {weeklyContent.reflectionQuestions.map((group, groupIndex) => (
                  <AccordionItem value={`item-${groupIndex}`} key={`${group.audience}-${groupIndex}`}>
                      <AccordionTrigger>
                          <h3 className="font-semibold flex items-center gap-2 text-lg">{getIconForAudience(group.audience)} {group.audience}</h3>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-6">
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
                      </AccordionContent>
                  </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
          <CardFooter>
              <Button onClick={handleSaveAnswers}>Save Answers</Button>
          </CardFooter>
      </Card>

      {weeklyContent.journeyQuestions && weeklyContent.journeyQuestions.length > 0 && (
        <MyJourney questions={weeklyContent.journeyQuestions} sermonTitle={sermon.title} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PrayerWall sermonId={sermon.id} />
        <ServiceWall sermonId={sermon.id} />
      </div>
    </div>
  );
}
