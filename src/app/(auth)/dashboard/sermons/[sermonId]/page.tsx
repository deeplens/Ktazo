
'use client';
import { notFound, useParams } from "next/navigation";
import { getMockSermons, getMockWeeklyContent, saveWeeklyContent, updateSermonWeeklyContentId } from "@/lib/mock-data";
import { SermonContent } from "./sermon-content";
import { useEffect, useState } from "react";
import { Sermon, WeeklyContent } from "@/lib/types";
import { generateWeeklyContent } from "@/ai/flows/generate-weekly-content";
import { generateMondayClip } from "@/ai/flows/generate-monday-clip";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export const maxDuration = 300; // 5 minutes

export default function SermonDetailPage() {
  const params = useParams();
  const sermonId = params.sermonId as string;
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [sermon, setSermon] = useState<Sermon | null | undefined>(undefined);
  const [weeklyContent, setWeeklyContent] = useState<WeeklyContent | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  useEffect(() => {
    if (sermonId) {
      const foundSermon = getMockSermons().find(s => s.id === sermonId);
      setSermon(foundSermon);
      if (foundSermon && foundSermon.weeklyContentIds && foundSermon.weeklyContentIds['en']) {
        const contentId = foundSermon.weeklyContentIds['en'];
        const foundContent = getMockWeeklyContent().find(wc => wc.id === contentId);
        setWeeklyContent(foundContent);
      } else {
        setWeeklyContent(undefined);
      }
    }
  }, [sermonId]);

  const handleGenerateContent = async (transcript: string, language?: string) => {
    if (!sermon || !user) return;
    setIsGenerating(true);
    const targetLang = language || 'English';
    const langCode = targetLang.toLowerCase().startsWith('span') ? 'es' : 'en';

    try {
        console.log('[[CLIENT - DEBUG]] Calling generateWeeklyContent');
        const generated = await generateWeeklyContent({ 
            sermonId: sermon.id, 
            tenantId: user.tenantId,
            sermonTranscript: transcript,
            targetLanguage: targetLang
        });
        console.log('[[CLIENT - DEBUG]] Received content from generateWeeklyContent', generated);
        
        const newContent: WeeklyContent = {
            id: `wc-${sermon.id}-${langCode}-${Date.now()}`,
            sermonId: sermon.id,
            tenantId: user.tenantId,
            language: langCode,
            summaryShort: generated.summaryShort,
            summaryLong: generated.summaryLong,
            oneLiners: generated.oneLiners,
            sendOneLiners: true, // Default to true
            devotionals: [
                { day: 'Monday', content: generated.devotionals.monday },
                { day: 'Tuesday', content: generated.devotionals.tuesday },
                { day: 'Wednesday', content: generated.devotionals.wednesday },
                { day: 'Thursday', content: generated.devotionals.thursday },
                { day: 'Friday', content: generated.devotionals.friday },
            ],
            reflectionQuestions: generated.reflectionQuestions,
            games: generated.games,
            bibleReadingPlan: generated.bibleReadingPlan,
            spiritualPractices: generated.spiritualPractices,
            outwardFocus: generated.outwardFocus,
            mondayClipUrl: undefined,
        };
        
        saveWeeklyContent(newContent);
        if (langCode === 'en') {
          setWeeklyContent(newContent);
        }
        updateSermonWeeklyContentId(sermon.id, newContent.id, langCode);
        const updatedSermon = getMockSermons().find(s => s.id === sermon.id);
        if(updatedSermon) setSermon(updatedSermon);


        toast({
            title: "Content Generated",
            description: `Weekly content has been successfully generated in ${targetLang}.`,
        });

    } catch (error) {
        console.error("Content generation failed", error);
        toast({
            variant: "destructive",
            title: "Generation Failed",
            description: (error as Error).message || "An unexpected error occurred while generating content. Please try again in a moment.",
        });
    } finally {
        setIsGenerating(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!sermon || !weeklyContent) return;
    setIsGeneratingAudio(true);
    try {
        const result = await generateMondayClip({ summaryLong: weeklyContent.summaryLong });
        
        const updatedContent = { ...weeklyContent, mondayClipUrl: result.mondayClipUrl };
        saveWeeklyContent(updatedContent);
        setWeeklyContent(updatedContent);

        toast({
            title: "Audio Generated",
            description: "The Monday audio overview has been successfully generated.",
        });

    } catch (error) {
        console.error("Audio generation failed", error);
        toast({
            variant: "destructive",
            title: "Audio Generation Failed",
            description: (error as Error).message || "An unexpected error occurred. Please try again.",
        });
    } finally {
        setIsGeneratingAudio(false);
    }
  };


  if (sermon === undefined) {
    // Loading state, can show a skeleton here if desired
    return null;
  }

  if (!sermon) {
    notFound();
  }
  
  return <SermonContent 
            sermon={sermon} 
            weeklyContent={weeklyContent} 
            onGenerateContent={handleGenerateContent}
            onGenerateAudio={handleGenerateAudio}
            isGenerating={isGenerating}
            isGeneratingAudio={isGeneratingAudio}
         />;
}
