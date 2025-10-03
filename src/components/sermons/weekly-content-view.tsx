
'use client';

import { Game, ReflectionQuestionGroup, WeeklyContent } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Headphones, Loader2, Sparkles, Users, User, MessageCircleQuestion, Gamepad2, Globe, HeartHandshake, Briefcase, Target, MessageSquareQuote, Video } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { saveWeeklyContent as saveContent } from "@/lib/mock-data";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { useAuth } from "@/lib/auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { mockMissionaries, Missionary } from "@/lib/missionaries";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Switch } from "../ui/switch";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import Image from "next/image";

interface WeeklyContentViewProps {
  content: WeeklyContent;
  onGenerateAudio: () => void;
  isGeneratingAudio: boolean;
  onGenerateVideo: () => void;
  isGeneratingVideo: boolean;
}

export function WeeklyContentView({ content, onGenerateAudio, isGeneratingAudio, onGenerateVideo, isGeneratingVideo }: WeeklyContentViewProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [editableContent, setEditableContent] = useState<WeeklyContent>(JSON.parse(JSON.stringify(content)));
    const [carouselApi, setCarouselApi] = useState<CarouselApi>()
    const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

    useEffect(() => {
        setEditableContent(JSON.parse(JSON.stringify(content)));
        audioRefs.current = audioRefs.current.slice(0, content.videoOverview?.length);
    }, [content]);

    useEffect(() => {
        if (!carouselApi) {
            return;
        }
        
        const onSelect = () => {
            // Stop all other audio elements when a new slide is selected
            audioRefs.current.forEach((audio, index) => {
                if (index !== carouselApi.selectedScrollSnap() && audio) {
                    audio.pause();
                    audio.currentTime = 0;
                }
            });
            // Autoplay the selected slide's audio
            const currentAudio = audioRefs.current[carouselApi.selectedScrollSnap()];
            if (currentAudio) {
                currentAudio.play().catch(e => console.error("Autoplay prevented:", e));
            }
        };

        carouselApi.on("select", onSelect);
        
        // Initial play
        onSelect();

        return () => {
            carouselApi.off("select", onSelect);
        };

    }, [carouselApi]);
    
    const canManage = user?.role === 'ADMIN' || user?.role === 'PASTOR' || user?.role === 'MASTER';

    const handleQuestionChange = (groupIndex: number, questionIndex: number, value: string) => {
        const newContent = { ...editableContent };
        newContent.reflectionQuestions[groupIndex].questions[questionIndex] = value;
        setEditableContent(newContent);
    };

    const handleOutwardFocusChange = (section: 'missionFocus' | 'serviceChallenge' | 'culturalEngagement', field: 'title' | 'description' | 'details', value: string) => {
        const newContent = { ...editableContent };
        (newContent.outwardFocus[section] as any)[field] = value;
        setEditableContent(newContent);
    };

    const handleMissionarySelect = (missionaryId: string) => {
        const selectedMissionary = mockMissionaries.find(m => m.id === missionaryId);
        if (selectedMissionary) {
            const newContent = { ...editableContent };
            newContent.outwardFocus.missionFocus = {
                title: `Spotlight on ${selectedMissionary.name}`,
                description: selectedMissionary.summary,
                details: `**Who they are:** ${selectedMissionary.bio}\n\n**Prayer Requests:**\n${selectedMissionary.prayerRequests.map(p => `- ${p}`).join('\n')}`
            };
            setEditableContent(newContent);
        }
    };
    
    const handleOneLinerChange = (day: 'tuesday' | 'thursday', value: string) => {
        const newContent = { ...editableContent };
        if (!newContent.oneLiners) {
            newContent.oneLiners = { tuesday: '', thursday: '' };
        }
        newContent.oneLiners[day] = value;
        setEditableContent(newContent);
    };

    const handleSendOneLinersChange = (checked: boolean) => {
        const newContent = { ...editableContent, sendOneLiners: checked };
        setEditableContent(newContent);
    };


    const handleSave = () => {
        saveContent(editableContent);
        toast({
            title: "Content Saved",
            description: "Your changes to the weekly content have been saved.",
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

    const handleAudioEnded = (index: number) => {
        if (carouselApi && carouselApi.canScrollNext()) {
            carouselApi.scrollNext();
        }
    };
    
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Summaries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Key Points (Short Summary)</h3>
            <p className="text-muted-foreground text-sm">{content.summaryShort}</p>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-1">Devotional Guide (Long Summary)</h3>
            <p className="text-muted-foreground text-sm">{content.summaryLong}</p>
          </div>
           <Separator />
            <div>
                <h3 className="font-semibold mb-1 flex items-center gap-2"><Video className="h-5 w-5"/> Video Overview</h3>
                {content.videoOverview && content.videoOverview.length > 0 ? (
                    <div className="mt-2 p-4 bg-muted/50 rounded-lg">
                        <Carousel className="w-full max-w-xl mx-auto" setApi={setCarouselApi}>
                            <CarouselContent>
                                {content.videoOverview.map((slide, index) => (
                                    <CarouselItem key={index}>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>{slide.slide_title}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="grid md:grid-cols-2 gap-4 items-center">
                                                <div className="relative aspect-video w-full rounded-md overflow-hidden bg-muted">
                                                    {slide.imageUrl && <Image src={slide.imageUrl} alt={slide.slide_title} fill objectFit="cover" />}
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm font-semibold">Narration:</p>
                                                    <p className="text-sm text-muted-foreground italic h-24 overflow-y-auto">
                                                        {slide.narration_script}
                                                    </p>
                                                    {slide.audioUrl && (
                                                        <audio 
                                                            ref={el => audioRefs.current[index] = el}
                                                            src={slide.audioUrl} 
                                                            onEnded={() => handleAudioEnded(index)}
                                                            controls 
                                                            className="w-full mt-2"
                                                        ></audio>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    </div>
                ) : (
                     <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 mt-2">
                        <p className="text-sm text-muted-foreground">Generate a short, slide-based video overview of the sermon.</p>
                        <Button size="sm" onClick={onGenerateVideo} disabled={isGeneratingVideo}>
                            {isGeneratingVideo ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
                            ) : (
                                <><Sparkles className="mr-2 h-4 w-4" />Generate Video</>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily Devotionals</CardTitle>
          <CardDescription>Generated content for Monday to Friday.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
            {content.devotionals.map((devotional, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger>{devotional.day}</AccordionTrigger>
                <AccordionContent>
                    <div className="prose prose-stone dark:prose-invert max-w-none text-sm">
                        <p>{devotional.content}</p>
                    </div>
                  {devotional.day === "Monday" && (
                     <div className="mt-4 pt-4 border-t">
                        {content.mondayClipUrl ? (
                             <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-lg">
                                <Headphones className="h-10 w-10 text-primary" />
                                <div>
                                    <h4 className="font-bold">Monday Audio Overview</h4>
                                    <p className="text-sm text-muted-foreground mb-2">
                                    A podcast-style discussion of the sermon.
                                    </p>
                                    <audio controls src={content.mondayClipUrl} className="w-full" />
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">Generate a podcast-style audio overview for this devotional.</p>
                                <Button size="sm" onClick={onGenerateAudio} disabled={isGeneratingAudio}>
                                    {isGeneratingAudio ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Generate Audio
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

       {canManage && editableContent.oneLiners && (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquareQuote /> Mid-Week One-Liners</CardTitle>
                <CardDescription>Edit and manage the one-liner notifications that get sent out on Tuesday and Thursday.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="one-liner-tuesday">Tuesday One-Liner</Label>
                    <Input id="one-liner-tuesday" value={editableContent.oneLiners.tuesday} onChange={e => handleOneLinerChange('tuesday', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="one-liner-thursday">Thursday One-Liner</Label>
                    <Input id="one-liner-thursday" value={editableContent.oneLiners.thursday} onChange={e => handleOneLinerChange('thursday', e.target.value)} />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                    <Switch id="send-one-liners" checked={editableContent.sendOneLiners} onCheckedChange={handleSendOneLinersChange} />
                    <Label htmlFor="send-one-liners">Send one-liners for this sermon</Label>
                </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave}>Save One-Liners</Button>
            </CardFooter>
        </Card>
      )}


      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Gamepad2 /> Interactive Games</CardTitle>
           <CardDescription>
            Preview of AI-generated games based on the sermon content. These will be interactive for members.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.games && content.games.length > 0 ? (
            content.games.map((game, index) => (
                <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold">{game.title}</h4>
                        <Badge variant="secondary">{game.audience}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Game Type: {game.type}</p>
                </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
                No games have been generated for this content yet.
            </p>
          )}
        </CardContent>
      </Card>
      
      {canManage && (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Globe /> Outward Focus</CardTitle>
                <CardDescription>Edit the mission focus, service challenge, and cultural engagement sections.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Mission Focus */}
                <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold flex items-center gap-2"><Target /> Mission Focus</h3>
                    <div className="space-y-2">
                        <Label>Select a Missionary (Optional)</Label>
                        <Select onValueChange={handleMissionarySelect}>
                            <SelectTrigger>
                                <SelectValue placeholder="Load missionary data..." />
                            </SelectTrigger>
                            <SelectContent>
                                {mockMissionaries.map(m => (
                                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="mission-title">Title</Label>
                        <Input id="mission-title" value={editableContent.outwardFocus.missionFocus.title} onChange={e => handleOutwardFocusChange('missionFocus', 'title', e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="mission-desc">Short Description</Label>
                        <Textarea id="mission-desc" value={editableContent.outwardFocus.missionFocus.description} onChange={e => handleOutwardFocusChange('missionFocus', 'description', e.target.value)} rows={2} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="mission-details">Details & Prayer Requests</Label>
                        <Textarea id="mission-details" value={editableContent.outwardFocus.missionFocus.details} onChange={e => handleOutwardFocusChange('missionFocus', 'details', e.target.value)} rows={5} />
                    </div>
                </div>

                {/* Service Challenge */}
                <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold flex items-center gap-2"><HeartHandshake /> Service Challenge</h3>
                    <div className="space-y-2">
                        <Label htmlFor="service-title">Title</Label>
                        <Input id="service-title" value={editableContent.outwardFocus.serviceChallenge.title} onChange={e => handleOutwardFocusChange('serviceChallenge', 'title', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="service-details">Details</Label>
                        <Textarea id="service-details" value={editableContent.outwardFocus.serviceChallenge.details} onChange={e => handleOutwardFocusChange('serviceChallenge', 'details', e.target.value)} rows={3} />
                    </div>
                </div>

                {/* Cultural Engagement */}
                 <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold flex items-center gap-2"><Briefcase /> Cultural Engagement</h3>
                    <div className="space-y-2">
                        <Label htmlFor="culture-title">Title</Label>
                        <Input id="culture-title" value={editableContent.outwardFocus.culturalEngagement.title} onChange={e => handleOutwardFocusChange('culturalEngagement', 'title', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="culture-details">Details / Question</Label>
                        <Textarea id="culture-details" value={editableContent.outwardFocus.culturalEngagement.details} onChange={e => handleOutwardFocusChange('culturalEngagement', 'details', e.target.value)} rows={3} />
                    </div>
                </div>
            </CardContent>
             <CardFooter>
              <Button onClick={handleSave}>Save Outward Focus</Button>
            </CardFooter>
        </Card>
      )}

      <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageCircleQuestion /> Reflection Questions</CardTitle>
            <CardDescription>Generated questions for different groups. {canManage && "Edit them as needed."}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {editableContent.reflectionQuestions.map((group, groupIndex) => (
              <div key={`${group.audience}-${groupIndex}`}>
                <h3 className="font-semibold flex items-center gap-2 mb-2 text-sm">{getIconForAudience(group.audience)} {group.audience}</h3>
                <div className="space-y-2 pl-2">
                    {group.questions.map((q, questionIndex) => (
                        <div key={questionIndex} className="space-y-1">
                            <Label htmlFor={`q-${groupIndex}-${questionIndex}`} className="sr-only">Question {questionIndex + 1}</Label>
                            <Textarea 
                                id={`q-${groupIndex}-${questionIndex}`}
                                value={q}
                                onChange={(e) => handleQuestionChange(groupIndex, questionIndex, e.target.value)}
                                className="text-sm"
                                rows={2}
                                disabled={!canManage}
                            />
                        </div>
                    ))}
                </div>
              </div>
            ))}
          </CardContent>
          {canManage && (
            <CardFooter>
                <Button onClick={handleSave}>Save Questions</Button>
            </CardFooter>
          )}
      </Card>
    </div>
  );
}
