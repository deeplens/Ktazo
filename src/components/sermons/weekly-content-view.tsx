'use client';

import { WeeklyContent } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Headphones } from "lucide-react";

interface WeeklyContentViewProps {
  content: WeeklyContent;
}

export function WeeklyContentView({ content }: WeeklyContentViewProps) {
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
          <Accordion type="single" collapsible className="w-full">
            {content.devotionals.map((devotional, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger>{devotional.day}</AccordionTrigger>
                <AccordionContent>
                  {devotional.day === "Monday" && content.mondayClipUrl ? (
                    <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-lg">
                      <Headphones className="h-10 w-10 text-primary" />
                      <div>
                        <h4 className="font-bold">Monday Podcast Clip</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          A podcast-style discussion of the sermon.
                        </p>
                        <audio controls src={content.mondayClipUrl} className="w-full" />
                      </div>
                    </div>
                  ) : (
                    devotional.content
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
