

'use client';
import { notFound, useParams } from "next/navigation";
import { getMockSermons, mockWeeklyContent } from "@/lib/mock-data";
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
      if (foundSermon) {
        // This is mock data lookup. In a real app, you'd fetch this.
        const foundContent = mockWeeklyContent.find(wc => wc.sermonId === foundSermon.id);
        setWeeklyContent(foundContent);
      }
    }
  }, [sermonId]);

  const handleGenerateContent = async () => {
    if (!sermon || !user) return;
    setIsGenerating(true);
    try {
        console.log('[[DEBUG]] Calling generateWeeklyContent');
        const generated = await generateWeeklyContent({ 
            sermonId: sermon.id, 
            tenantId: user.tenantId,
            sermonTranscript: sermon.transcript
        });
        console.log('[[DEBUG]] Received content from generateWeeklyContent', generated);
        
        // For this mock implementation, we'll just create it in memory
        const newContent: WeeklyContent = {
            id: `wc-${Date.now()}`,
            sermonId: sermon.id,
            tenantId: user.tenantId,
            themeImageUrl: generated.themedImageUrl,
            summaryShort: generated.summaryShort,
            summaryLong: generated.summaryLong,
            devotionals: generated.devotionals.map((d, i) => ({ day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][i], content: d })),
            mondayClipUrl: undefined, // Audio is generated separately now
        };
        
        setWeeklyContent(newContent);

        toast({
            title: "Content Generated",
            description: "Weekly content has been successfully generated.",
        });

    } catch (error) {
        console.error("Content generation failed", error);
        toast({
            variant: "destructive",
            title: "Generation Failed",
            description: "An unexpected error occurred while generating content. The AI may be busy or the request may have timed out. Please try again in a moment.",
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
        
        if (result.mondayClipUrl === 'error') {
            throw new Error("Podcast generation failed on the server.");
        }

        const updatedContent = { ...weeklyContent, mondayClipUrl: result.mondayClipUrl };
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
            description: "An unexpected error occurred. The AI may be busy or the request may have timed out. Please try again.",
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
