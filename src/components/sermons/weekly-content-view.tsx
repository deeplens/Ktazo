'use client';

import { WeeklyContent } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Headphones, Loader2, Sparkles } from "lucide-react";
import { Button } from "../ui/button";

interface WeeklyContentViewProps {
  content: WeeklyContent;
  onGenerateAudio: () => void;
  isGeneratingAudio: boolean;
}

export function WeeklyContentView({ content, onGenerateAudio, isGeneratingAudio }: WeeklyContentViewProps) {
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Reflection Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Generated questions for different groups...
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Interactive Games</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configurations for generated games...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
