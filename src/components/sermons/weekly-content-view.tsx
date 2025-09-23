
'use client';

import { Game, ReflectionQuestionGroup, WeeklyContent } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Headphones, Loader2, Sparkles, Users, User, MessageCircleQuestion, Gamepad2 } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { saveWeeklyContent as saveContent } from "@/lib/mock-data";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";

interface WeeklyContentViewProps {
  content: WeeklyContent;
  onGenerateAudio: () => void;
  isGeneratingAudio: boolean;
}

export function WeeklyContentView({ content, onGenerateAudio, isGeneratingAudio }: WeeklyContentViewProps) {
    const { toast } = useToast();
    const [editableQuestions, setEditableQuestions] = useState<ReflectionQuestionGroup[]>(JSON.parse(JSON.stringify(content.reflectionQuestions)));

    const handleQuestionChange = (groupIndex: number, questionIndex: number, value: string) => {
        const newQuestions = [...editableQuestions];
        newQuestions[groupIndex].questions[questionIndex] = value;
        setEditableQuestions(newQuestions);
    };

    const handleSaveQuestions = () => {
        const updatedContent = { ...content, reflectionQuestions: editableQuestions };
        saveContent(updatedContent);
        toast({
            title: "Questions Saved",
            description: "Your reflection questions have been updated.",
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
      
      <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageCircleQuestion /> Reflection Questions</CardTitle>
            <CardDescription>Generated questions for different groups. Edit them as needed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {editableQuestions.map((group, groupIndex) => (
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
                            />
                        </div>
                    ))}
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter>
              <Button onClick={handleSaveQuestions}>Save Questions</Button>
          </CardFooter>
      </Card>
    </div>
  );
}
