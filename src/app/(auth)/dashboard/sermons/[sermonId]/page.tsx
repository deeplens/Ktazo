


'use client';
import { notFound, useParams } from "next/navigation";
import { getMockSermons, getMockWeeklyContent, saveWeeklyContent, updateSermonWeeklyContentId } from "@/lib/mock-data";
import { SermonContent } from "./sermon-content";
import { useEffect, useState } from "react";
import { Sermon, WeeklyContent } from "@/lib/types";
import { generateSummaries } from "@/ai/flows/generate-summaries";
import { generateDevotionals } from "@/ai/flows/generate-devotionals";
import { generateReflectionQuestions } from "@/ai/flows/generate-reflection-questions";
import { generateGames } from "@/ai/flows/generate-games";
import { generateEngagementContent } from "@/ai/flows/generate-engagement-content";
import { generateJourneyContent } from "@/ai/flows/generate-journey-content";
import { generateMondayClip } from "@/ai/flows/generate-monday-clip";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { generatePresentationVideo } from "@/ai/flows/generate-presentation-video";

export const maxDuration = 300; // 5 minutes

type GenerationProgress = {
    step: 'summaries' | 'devotionals' | 'questions' | 'journey' | 'games' | 'engagement' | 'done' | 'error' | 'idle';
    message: string;
};

export default function SermonDetailPage() {
  const params = useParams();
  const sermonId = params.sermonId as string;
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [sermon, setSermon] = useState<Sermon | null | undefined>(undefined);
  const [weeklyContent, setWeeklyContent] = useState<WeeklyContent | undefined>(undefined);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({ step: 'idle', message: '' });
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

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
    const targetLang = language || 'English';
    const langCode = targetLang.toLowerCase().startsWith('span') ? 'es' : 'en';

    try {
        // Step 1: Summaries
        setGenerationProgress({ step: 'summaries', message: 'Generating summaries and one-liners...' });
        const summaries = await generateSummaries({ sermonTranscript: transcript, targetLanguage: targetLang });

        // Step 2: Devotionals
        setGenerationProgress({ step: 'devotionals', message: 'Generating daily devotionals...' });
        const devotionals = await generateDevotionals({ sermonTranscript: transcript, summaryLong: summaries.summaryLong, targetLanguage: targetLang });

        // Step 3: Reflection Questions
        setGenerationProgress({ step: 'questions', message: 'Generating reflection questions...' });
        const questions = await generateReflectionQuestions({ sermonTranscript: transcript, targetLanguage: targetLang });

        // Step 4: Journey Questions
        setGenerationProgress({ step: 'journey', message: 'Generating My Journey questions...' });
        const journey = await generateJourneyContent({ sermonTranscript: transcript, targetLanguage: targetLang });

        // Step 5: Games
        setGenerationProgress({ step: 'games', message: 'Generating interactive games...' });
        const games = await generateGames({ sermonTranscript: transcript, targetLanguage: targetLang });

        // Step 6: Engagement Content
        setGenerationProgress({ step: 'engagement', message: 'Generating engagement content...' });
        const engagement = await generateEngagementContent({ sermonTranscript: transcript, targetLanguage: targetLang });


        setGenerationProgress({ step: 'done', message: 'Finalizing content...' });
        
        const newContent: WeeklyContent = {
            id: `wc-${sermon.id}-${langCode}-${Date.now()}`,
            sermonId: sermon.id,
            tenantId: user.tenantId,
            language: langCode,
            summaryShort: summaries.summaryShort,
            summaryLong: summaries.summaryLong,
            oneLiners: summaries.oneLiners,
            sendOneLiners: true, // Default to true
            devotionals: [
                { day: 'Monday', content: devotionals.devotionals.monday },
                { day: 'Tuesday', content: devotionals.devotionals.tuesday },
                { day: 'Wednesday', content: devotionals.devotionals.wednesday },
                { day: 'Thursday', content: devotionals.devotionals.thursday },
                { day: 'Friday', content: devotionals.devotionals.friday },
            ],
            reflectionQuestions: questions.reflectionQuestions,
            journeyQuestions: journey.journeyQuestions,
            games: games.games,
            bibleReadingPlan: engagement.bibleReadingPlan,
            spiritualPractices: engagement.spiritualPractices,
            outwardFocus: engagement.outwardFocus,
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
        setGenerationProgress({ step: 'error', message: (error as Error).message || "An unexpected error occurred." });
        toast({
            variant: "destructive",
            title: "Generation Failed",
            description: (error as Error).message || "An unexpected error occurred while generating content. Please try again in a moment.",
        });
    } finally {
        setTimeout(() => setGenerationProgress({ step: 'idle', message: '' }), 5000);
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
  
  const handleGenerateVideo = async () => {
    if (!sermon || !sermon.transcript) return;
    setIsGeneratingVideo(true);
    try {
        const result = await generatePresentationVideo({ sermonTranscript: sermon.transcript });
        
        const currentContent = weeklyContent || {
             id: `wc-${sermon.id}-en-${Date.now()}`,
             sermonId: sermon.id,
             tenantId: user!.tenantId,
             language: 'en',
             summaryShort: '',
             summaryLong: '',
             oneLiners: { tuesday: '', thursday: '' },
             sendOneLiners: false,
             devotionals: [],
             reflectionQuestions: [],
             games: [],
             bibleReadingPlan: [],
             spiritualPractices: [],
             outwardFocus: { missionFocus: { title: '', description: '', details: '' }, serviceChallenge: { title: '', description: '', details: '' }, culturalEngagement: { title: '', description: '', details: '' } },
        };
        
        const updatedContent = { ...currentContent, videoOverview: result.slides };
        
        saveWeeklyContent(updatedContent);
        setWeeklyContent(updatedContent);
        
        if (!sermon.weeklyContentIds?.['en']) {
             updateSermonWeeklyContentId(sermon.id, updatedContent.id, 'en');
        }

        toast({
            title: "Video Generated",
            description: "The sermon video overview has been successfully generated.",
        });

    } catch (error) {
        console.error("Video generation failed", error);
        toast({
            variant: "destructive",
            title: "Video Generation Failed",
            description: (error as Error).message || "An unexpected error occurred. Please try again.",
        });
    } finally {
        setIsGeneratingVideo(false);
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
            onGenerateVideo={handleGenerateVideo}
            generationProgress={generationProgress}
            isGeneratingAudio={isGeneratingAudio}
            isGeneratingVideo={isGeneratingVideo}
         />;
}
