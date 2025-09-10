
'use client';
import { notFound, useRouter } from "next/navigation";
import {
  ChevronLeft,
  UploadCloud,
  FileText,
  Sparkles,
  Languages,
  CheckCircle,
  Eye,
  Loader2,
  MicVocal,
  Trash2,
  Download
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
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { WeeklyContentView } from "@/components/sermons/weekly-content-view";
import { useAuth } from "@/lib/auth.tsx";
import { Sermon, WeeklyContent } from "@/lib/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { addSermon, deleteSermon, updateSermonTranscript } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { translateTranscript } from "@/ai/flows/translate-transcript";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface SermonContentProps {
    sermon: Sermon;
    weeklyContent?: WeeklyContent;
    onGenerateContent: (transcript: string, language?: string) => Promise<void>;
    onGenerateAudio: () => Promise<void>;
    isGenerating: boolean;
    isGeneratingAudio: boolean;
}

export function SermonContent({ sermon, weeklyContent, onGenerateContent, onGenerateAudio, isGenerating, isGeneratingAudio }: SermonContentProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isTranslating, setIsTranslating] = useState(false);

  const [originalTranscript, setOriginalTranscript] = useState(sermon.transcript);
  const [translatedTranscript, setTranslatedTranscript] = useState<string | null>(sermon.translatedTranscript || null);

  const [activeTab, setActiveTab] = useState("original");

  useEffect(() => {
    setOriginalTranscript(sermon.transcript);
    setTranslatedTranscript(sermon.translatedTranscript || null);
  }, [sermon]);


  if (!sermon) {
    notFound();
  }
  
  const handleDelete = () => {
    deleteSermon(sermon.id);
    toast({
      title: "Sermon Deleted",
      description: `"${sermon.title}" has been permanently deleted.`
    })
    router.push('/dashboard/sermons');
    router.refresh(); // To ensure the sermon list is updated
  }

  const handleTranslate = async () => {
    if (!sermon) return;
    setIsTranslating(true);
    try {
        const result = await translateTranscript({
            transcript: originalTranscript,
            targetLanguage: 'Spanish'
        });
        setTranslatedTranscript(result.translatedTranscript);
        // also save to mock data
        updateSermonTranscript(sermon.id, result.translatedTranscript, 'es');
        toast({
            title: "Translation Complete",
            description: "The transcript has been translated to Spanish."
        });
        setActiveTab("spanish");
    } catch (error) {
        console.error("Translation failed", error);
        toast({ variant: "destructive", title: "Translation Failed", description: "An error occurred during transcript translation." });
    } finally {
        setIsTranslating(false);
    }
  }
  
  const downloadTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  const handleSaveOriginalTranscript = () => {
    updateSermonTranscript(sermon.id, originalTranscript, 'en');
    downloadTextFile(originalTranscript, `${sermon.title.toLowerCase().replace(/ /g, '-')}-original.txt`);
    toast({ title: "Success", description: "Original transcript has been saved to your downloads." });
  };

  const handleSaveSpanishTranscript = () => {
    if (translatedTranscript) {
      updateSermonTranscript(sermon.id, translatedTranscript, 'es');
      downloadTextFile(translatedTranscript, `${sermon.title.toLowerCase().replace(/ /g, '-')}-spanish.txt`);
      toast({ title: "Success", description: "Spanish transcript has been saved to your downloads." });
    }
  };


  const handleGenerate = () => {
    if (activeTab === 'original') {
        onGenerateContent(originalTranscript);
    } else if (activeTab === 'spanish' && translatedTranscript) {
        onGenerateContent(translatedTranscript, 'Spanish');
    }
  };


  const canManage = user?.role === 'ADMIN' || user?.role === 'PASTOR' || user?.role === 'MASTER';
  const canApprove = canManage;
  const canPublish = canManage;
  const canDelete = canManage;

  const generateButtonText = activeTab === 'spanish' ? "Generate Weekly Content in Spanish" : "Generate Weekly Content";

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
            {sermon.title}
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                <MicVocal className="h-4 w-4"/> {sermon.speaker}
            </p>
        </div>

        <Badge variant="outline" className="ml-auto sm:ml-0">
          {sermon.status.replace('_', ' ')}
        </Badge>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          {canApprove && sermon.status === 'READY_FOR_REVIEW' && <Button>Approve</Button>}
          {canPublish && sermon.status === 'APPROVED' && <Button>Publish</Button>}
          {sermon.status === 'PUBLISHED' && <Button variant="outline" asChild><Link href={`/dashboard/weekly/${sermon.id}`}><Eye className="mr-2 h-4 w-4"/>View Published Page</Link></Button>}
          {canDelete && (
              <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm"><Trash2 className="mr-2"/>Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                  <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the sermon &quot;{sermon.title}&quot;
                          and all of its associated weekly content.
                      </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Confirm Delete</AlertDialogAction>
                  </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
          )}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText /> Transcript</CardTitle>
              <CardDescription>
                View and edit the sermon transcript. The content below will be used for all AI generation.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex justify-between items-center mb-4">
                        <TabsList className="bg-transparent p-0">
                            <TabsTrigger value="original" className="data-[state=inactive]:bg-muted">Original</TabsTrigger>
                            <TabsTrigger value="spanish" disabled={!translatedTranscript} className="data-[state=inactive]:bg-muted">Spanish</TabsTrigger>
                        </TabsList>
                        {canManage && !translatedTranscript && (
                             <Button onClick={handleTranslate} disabled={isTranslating} variant="outline" size="sm">
                                {isTranslating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Languages className="mr-2 h-4 w-4"/>}
                                Translate to Spanish
                             </Button>
                        )}
                    </div>
                    <TabsContent value="original">
                        <Textarea
                            id="description"
                            value={originalTranscript}
                            onChange={(e) => setOriginalTranscript(e.target.value)}
                            className="min-h-96"
                            disabled={!canManage}
                        />
                         {canManage && <Button className="mt-4" onClick={handleSaveOriginalTranscript}>Save Transcript</Button>}
                    </TabsContent>
                    <TabsContent value="spanish">
                         <Textarea
                            id="description-es"
                            value={translatedTranscript || ''}
                            className="min-h-96"
                            disabled={!canManage}
                            onChange={(e) => setTranslatedTranscript(e.target.value)}
                        />
                         {canManage && <Button className="mt-4" onClick={handleSaveSpanishTranscript}>Save Spanish Transcript</Button>}
                    </TabsContent>
                </Tabs>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles /> Generated Content</CardTitle>
              <CardDescription>
                AI-generated summaries, devotionals, and games based on the sermon transcript.
              </CardDescription>
            </CardHeader>
            <CardContent>
                {weeklyContent ? (
                    <WeeklyContentView 
                        content={weeklyContent} 
                        onGenerateAudio={onGenerateAudio}
                        isGeneratingAudio={isGeneratingAudio}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                        <p className="mb-4 text-muted-foreground">No content has been generated for this sermon yet.</p>
                        <Button 
                          onClick={handleGenerate} 
                          disabled={sermon.status === 'DRAFT' || isGenerating || (activeTab === 'spanish' && !translatedTranscript)}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    {generateButtonText}
                                </>
                            )}
                        </Button>
                         {sermon.status === 'DRAFT' && <p className="text-xs mt-2 text-muted-foreground">Transcription must be complete.</p>}
                    </div>
                )}
            </CardContent>
          </Card>
        </div>
        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Sermon Status</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
                <div className="grid gap-1.5">
                  <p className="text-sm text-muted-foreground">{sermon.status.replace('_', ' ')}</p>
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UploadCloud /> Sermon Audio</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <audio controls src={sermon.mp3Url} className="w-full">
                        Your browser does not support the audio element.
                    </audio>
                    <Button variant="outline" className="w-full" asChild>
                        <a href={sermon.mp3Url} download>
                            <Download className="mr-2 h-4 w-4" />
                            Download MP3
                        </a>
                    </Button>
                </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
