

'use client';

import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  UploadCloud,
  FileText,
  Sparkles,
  Languages,
  Eye,
  Loader2,
  Trash2,
  Wand2,
  Mic,
  FilePenLine,
  Palette,
  Upload,
  Bot
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { WeeklyContentView } from "@/components/sermons/weekly-content-view";
import { useAuth } from "@/lib/auth";
import { Sermon, WeeklyContent } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { deleteSermon, getMockWeeklyContent, saveWeeklyContent, updateSermonArtwork, updateSermonDetails, updateSermonStatus, updateSermonTranscript } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { translateTranscript } from "@/ai/flows/translate-transcript";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cleanupTranscript } from "@/ai/flows/cleanup-transcript";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateSermonArtwork } from "@/ai/flows/generate-sermon-artwork";
import { Progress } from "@/components/ui/progress";

type GenerationProgress = {
    step: 'summaries' | 'devotionals' | 'questions' | 'games' | 'engagement' | 'done' | 'error' | 'idle';
    message: string;
};

interface SermonContentProps {
  sermon: Sermon;
  weeklyContent?: WeeklyContent;
  onGenerateContent: (transcript: string, language?: string) => Promise<void>;
  onGenerateAudio: () => Promise<void>;
  onGenerateVideo: () => Promise<void>;
  generationProgress: GenerationProgress;
  isGeneratingAudio: boolean;
  isGeneratingVideo: boolean;
}

const generationSteps = ['summaries', 'devotionals', 'questions', 'games', 'engagement', 'done'];

export function SermonContent({
  sermon: initialSermon,
  weeklyContent: initialWeeklyContent,
  onGenerateContent,
  onGenerateAudio,
  onGenerateVideo,
  generationProgress,
  isGeneratingAudio,
  isGeneratingVideo
}: SermonContentProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [sermon, setSermon] = useState(initialSermon);
  const [weeklyContent, setWeeklyContent] = useState(initialWeeklyContent);
  const [sermonDetails, setSermonDetails] = useState({
      title: initialSermon.title || '',
      speaker: initialSermon.speaker || '',
      series: initialSermon.series || '',
      date: initialSermon.date || '',
  });
  const [isTranslating, setIsTranslating] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isGeneratingArtwork, setIsGeneratingArtwork] = useState(false);
  const [artworkPrompt, setArtworkPrompt] = useState("");
  const [uploadedArtwork, setUploadedArtwork] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(initialSermon.artworkUrl || null);

  const [originalTranscript, setOriginalTranscript] = useState(
    initialSermon.transcript
  );
  const [translatedTranscript, setTranslatedTranscript] = useState<string | null>(
    initialSermon.translatedTranscript || null
  );

  const [activeTab, setActiveTab] = useState<"original" | "spanish">("original");

  useEffect(() => {
    setSermon(initialSermon);
    setSermonDetails({
        title: initialSermon.title || '',
        speaker: initialSermon.speaker || '',
        series: initialSermon.series || '',
        date: initialSermon.date || '',
    });
    setOriginalTranscript(initialSermon.transcript);
    setTranslatedTranscript(initialSermon.translatedTranscript || null);
    setArtworkPreview(initialSermon.artworkUrl || null);
    setWeeklyContent(initialWeeklyContent);
  }, [initialSermon, initialWeeklyContent]);

  const fileToDataURI = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

  const handleArtworkFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setUploadedArtwork(file);
        const previewUrl = await fileToDataURI(file);
        setArtworkPreview(previewUrl);
    }
  }

  const handleSaveArtwork = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!artworkPreview) return;
    
    if (uploadedArtwork) {
        const formData = new FormData();
        formData.append('artworkFile', uploadedArtwork);
    }

    updateSermonArtwork(sermon.id, artworkPreview);
    setSermon(prev => prev ? { ...prev, artworkUrl: artworkPreview } : prev);
    toast({
        title: "Artwork Saved",
        description: "The sermon artwork has been updated."
    });
    setUploadedArtwork(null);
  }

  const handleGenerateArtwork = async () => {
    const prompt = artworkPrompt.trim() || 'A beautiful and generic spiritual or inspirational abstract image. No text.';
    setIsGeneratingArtwork(true);
    try {
        const result = await generateSermonArtwork({ prompt });
        setArtworkPreview(result.artworkUrl);
        toast({
            title: "Artwork Generated",
            description: "A new artwork has been generated. Don't forget to save."
        });
    } catch (error) {
        console.error("[[CLIENT - ERROR]] Artwork generation failed", error);
        toast({
            variant: "destructive",
            title: "Generation Failed",
            description: (error as Error).message || "An error occurred while generating artwork.",
        });
    } finally {
        setIsGeneratingArtwork(false);
    }
  }


  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSermonDetails(prev => ({...prev, [id]: value}));
  };

  const handleSaveDetails = () => {
    updateSermonDetails(sermon.id, sermonDetails);
    setSermon(prev => prev ? { ...prev, ...sermonDetails } : prev);
    toast({
        title: "Details Saved",
        description: "The sermon details have been updated."
    });
  };

  const handleDelete = () => {
    deleteSermon(sermon.id);
    toast({
      title: "Sermon Deleted",
      description: `"${sermon.title}" has been permanently deleted.`,
    });
    router.push("/dashboard/sermons");
    router.refresh(); 
  };

  const handleApprove = () => {
    updateSermonStatus(sermon.id, "APPROVED");
    setSermon((prev) => (prev ? { ...prev, status: "APPROVED" } : prev));
    toast({
      title: "Sermon Approved",
      description: `"${sermon.title}" has been approved and is ready for publication.`,
    });
  };

  const handlePublish = () => {
    updateSermonStatus(sermon.id, "PUBLISHED");
    setSermon((prev) => (prev ? { ...prev, status: "PUBLISHED" } : prev));
    toast({
      title: "Sermon Published",
      description: `"${sermon.title}" has been published and is now live.`,
    });
  };

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      const result = await translateTranscript({
        targetLanguage: "Spanish",
        transcript: originalTranscript,
      });

      const newTranslatedTranscript = result.translatedTranscript;
      setTranslatedTranscript(newTranslatedTranscript);
      updateSermonTranscript(sermon.id, newTranslatedTranscript, "es");

      setSermon(prev => prev ? { ...prev, translatedTranscript: newTranslatedTranscript, languages: [...prev.languages, 'es'] } : prev);


      toast({
        title: "Transcript Translated",
        description:
          "The sermon transcript has been translated to Spanish. You can now view it in the 'Spanish' tab.",
      });
      setActiveTab("spanish");
    } catch (error) {
      console.error("[[CLIENT - ERROR]] Translation failed", error);
      toast({
        variant: "destructive",
        title: "Translation Failed",
        description: (error as Error).message || "An error occurred during translation.",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCleanupTranscript = async () => {
    if (!originalTranscript) return;
    setIsCleaning(true);
    try {
      const result = await cleanupTranscript({ transcript: originalTranscript });
      const cleaned = result.cleanedTranscript;
      setOriginalTranscript(cleaned);
      updateSermonTranscript(sermon.id, cleaned, "en");
      toast({
        title: "Transcript Cleaned",
        description: "The transcript has been formatted for readability.",
      });
    } catch (error) {
      console.error("[[CLIENT - ERROR]] Cleanup failed", error);
      toast({
        variant: "destructive",
        title: "Cleanup Failed",
        description: (error as Error).message || "An error occurred while cleaning the transcript.",
      });
    } finally {
      setIsCleaning(false);
    }
  };

  const downloadTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveOriginalTranscript = () => {
    updateSermonTranscript(sermon.id, originalTranscript, "en");
    toast({
      title: "Success",
      description: "Original transcript has been saved.",
    });
  };

  const handleSaveSpanishTranscript = () => {
    if (translatedTranscript) {
      updateSermonTranscript(sermon.id, translatedTranscript, "es");
      toast({
        title: "Success",
        description: "Spanish transcript has been saved.",
      });
    }
  };

  const handleGenerate = () => {
    if (activeTab === "original") {
      onGenerateContent(originalTranscript, "English");
    } else if (activeTab === "spanish" && translatedTranscript) {
      onGenerateContent(translatedTranscript, "Spanish");
    }
  };

  const canManage =
    user?.role === "ADMIN" || user?.role === "PASTOR" || user?.role === "MASTER";
  const canApprove = canManage;
  const canPublish = canManage;
  const canDelete = canManage;
  const canTranslate = canManage && sermon.status !== "DRAFT" && !sermon.languages.includes('es');
  const canCleanup = canManage && sermon.status !== "DRAFT" && activeTab === "original";
  const showAudioPlayer = sermon.mp3Url && !sermon.mp3Url.startsWith('blob:');

  const generateButtonText =
    activeTab === "spanish"
      ? "Generate Weekly Content in Spanish"
      : "Generate Weekly Content";
    
  const hasGeneratedEnglish = sermon.weeklyContentIds && sermon.weeklyContentIds['en'];
  const hasGeneratedSpanish = sermon.weeklyContentIds && sermon.weeklyContentIds['es'];
  const isGenerating = generationProgress.step !== 'idle' && generationProgress.step !== 'done' && generationProgress.step !== 'error';

  return (
    <div className="mx-auto grid max-w-6xl flex-1 auto-rows-max gap-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href="/dashboard/sermons">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>

        <div className="flex-1 shrink-0">
          <h1 className="whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0 font-headline">
            {sermonDetails.title}
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <Mic className="h-4 w-4" /> {sermonDetails.speaker}
          </p>
        </div>

        <Badge variant="outline" className="ml-auto sm:ml-0">
          {sermon.status.replace(/_/g, " ")}
        </Badge>

        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          {canApprove && sermon.status === "READY_FOR_REVIEW" && (
            <Button onClick={handleApprove}>Approve</Button>
          )}
          {canPublish && sermon.status === "APPROVED" && <Button onClick={handlePublish}>Publish</Button>}
          {sermon.status === "PUBLISHED" && (
            <Button variant="outline" asChild>
              <Link href={`/dashboard/weekly/${sermon.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Published Page
              </Link>
            </Button>
          )}

          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the sermon
                    &quot;{sermon.title}&quot; and all of its associated weekly content.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Confirm Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
         {canManage && (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FilePenLine /> Sermon Details</CardTitle>
                    <CardDescription>Edit the core details of the sermon.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Sermon Title</Label>
                        <Input id="title" value={sermonDetails.title} onChange={handleDetailChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="speaker">Speaker</Label>
                        <Input id="speaker" value={sermonDetails.speaker} onChange={handleDetailChange} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="series">Series</Label>
                            <Input id="series" value={sermonDetails.series} onChange={handleDetailChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input id="date" type="date" value={sermonDetails.date} onChange={handleDetailChange} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveDetails}>Save Details</Button>
                </CardFooter>
             </Card>
         )}

        {canManage && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Palette /> Sermon Artwork</CardTitle>
                    <CardDescription>Upload custom artwork or generate one using AI.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSaveArtwork}>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-full aspect-video rounded-md bg-muted overflow-hidden relative flex items-center justify-center">
                            {artworkPreview ? (
                                <Image src={artworkPreview} alt="Sermon artwork preview" fill objectFit="cover" />
                            ) : (
                                <Palette className="w-12 h-12 text-muted-foreground" />
                            )}
                        </div>
                        <Button type="submit" className="w-full" disabled={!artworkPreview}>Save Artwork</Button>
                    </div>
                    <Tabs defaultValue="upload" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4"/>Upload</TabsTrigger>
                            <TabsTrigger value="generate"><Bot className="mr-2 h-4 w-4"/>Generate</TabsTrigger>
                        </TabsList>
                        <TabsContent value="upload" className="mt-4">
                             <div className="space-y-2">
                                <Label htmlFor="artwork-file">Upload a JPEG</Label>
                                <Input id="artwork-file" type="file" accept=".jpg, .jpeg" onChange={handleArtworkFileChange} />
                             </div>
                        </TabsContent>
                        <TabsContent value="generate" className="mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="artwork-prompt">Artwork Prompt</Label>
                                <Textarea id="artwork-prompt" placeholder="e.g., A stained glass window depicting a shepherd..." value={artworkPrompt} onChange={(e) => setArtworkPrompt(e.target.value)} />
                            </div>
                            <Button onClick={handleGenerateArtwork} disabled={isGeneratingArtwork} className="mt-2 w-full" type="button">
                                {isGeneratingArtwork ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                                Generate
                            </Button>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                </form>
            </Card>
        )}


          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText /> Transcript
              </CardTitle>
              <CardDescription>
                View and edit the sermon transcript. The content below will be used for
                all AI generation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                <div className="flex justify-between items-center mb-4 gap-2">
                  <TabsList className="bg-transparent p-0">
                    <TabsTrigger value="original" className="data-[state=inactive]:bg-muted">
                      Original
                    </TabsTrigger>
                    <TabsTrigger
                      value="spanish"
                      disabled={!translatedTranscript}
                      className="data-[state=inactive]:bg-muted"
                    >
                      Spanish
                    </TabsTrigger>
                  </TabsList>
                  <div className="flex items-center gap-2">
                    {canCleanup && (
                      <Button
                        onClick={handleCleanupTranscript}
                        disabled={isCleaning}
                        variant="outline"
                        size="sm"
                      >
                        {isCleaning ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Wand2 className="mr-2 h-4 w-4" />
                        )}
                        Cleanup Formatting
                      </Button>
                    )}
                    {canTranslate && (
                      <Button
                        onClick={handleTranslate}
                        disabled={isTranslating}
                        variant="outline"
                        size="sm"
                      >
                        {isTranslating ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Languages className="mr-2 h-4 w-4" />
                        )}
                        Translate to Spanish
                      </Button>
                    )}
                  </div>
                </div>

                <TabsContent value="original">
                  <Textarea
                    id="description"
                    value={originalTranscript}
                    onChange={(e) => setOriginalTranscript(e.target.value)}
                    className="min-h-96"
                    disabled={!canManage}
                  />
                  {canManage && (
                    <Button className="mt-4" onClick={handleSaveOriginalTranscript}>
                      Save Transcript
                    </Button>
                  )}
                </TabsContent>

                <TabsContent value="spanish">
                  <Textarea
                    id="description-es"
                    value={translatedTranscript || ""}
                    className="min-h-96"
                    disabled={!canManage}
                    onChange={(e) => setTranslatedTranscript(e.target.value)}
                  />
                  {canManage && (
                    <Button className="mt-4" onClick={handleSaveSpanishTranscript}>
                      Save Spanish Transcript
                    </Button>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles /> Generated Content
              </CardTitle>
              <CardDescription>
                AI-generated summaries, devotionals, and games based on the sermon
                transcript.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {
                (activeTab === 'original' && hasGeneratedEnglish) || (activeTab === 'spanish' && hasGeneratedSpanish) ? (
                    <WeeklyContentView
                    content={activeTab === 'spanish' ? getMockWeeklyContent().find(c => c.id === sermon.weeklyContentIds!['es'])! : weeklyContent!}
                    onGenerateAudio={onGenerateAudio}
                    isGeneratingAudio={isGeneratingAudio}
                    onGenerateVideo={onGenerateVideo}
                    isGeneratingVideo={isGeneratingVideo}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                    {isGenerating ? (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">{generationProgress.message}</p>
                            <Progress value={(generationSteps.indexOf(generationProgress.step) + 1) / generationSteps.length * 100} className="w-full" />
                        </div>
                    ) : (
                        <>
                            <p className="mb-4 text-muted-foreground">
                                No content has been generated for this sermon language yet.
                            </p>
                            <Button
                                onClick={handleGenerate}
                                disabled={
                                sermon.status === "DRAFT" ||
                                isGenerating ||
                                (activeTab === "spanish" && !translatedTranscript)
                                }
                            >
                                <Sparkles className="mr-2 h-4 w-4" />
                                {generateButtonText}
                            </Button>
                            {sermon.status === "DRAFT" && (
                                <p className="text-xs mt-2 text-muted-foreground">
                                Transcription must be complete.
                                </p>
                            )}
                        </>
                    )}
                    </div>
                )
              }
            </CardContent>
          </Card>
        </div>

        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
          {showAudioPlayer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UploadCloud /> Sermon Audio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <audio controls src={sermon.mp3Url} className="w-full">
                  Your browser does not support the audio element.
                </audio>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

    
