
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
  Trash2
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
import { addSermon, deleteSermon } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { translateTranscript } from "@/ai/flows/translate-transcript";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface SermonContentProps {
    sermon: Sermon | null;
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
  const [translatedTranscript, setTranslatedTranscript] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("original");

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
            transcript: sermon.transcript,
            targetLanguage: 'Spanish'
        });
        setTranslatedTranscript(result.translatedTranscript);
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

  const handleGenerate = () => {
    if (activeTab === 'original') {
        onGenerateContent(sermon.transcript);
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
                            defaultValue={sermon.transcript}
                            className="min-h-96"
                            disabled={!canManage}
                        />
                         {canManage && <Button className="mt-4">Save Transcript</Button>}
                    </TabsContent>
                    <TabsContent value="spanish">
                         <Textarea
                            id="description-es"
                            value={translatedTranscript || ''}
                            className="min-h-96"
                            disabled={!canManage}
                            onChange={(e) => setTranslatedTranscript(e.target.value)}
                        />
                         {canManage && <Button className="mt-4">Save Spanish Transcript</Button>}
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
              <CardTitle>Sermon Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label>Status</Label>
                  <p className="text-sm text-muted-foreground">{sermon.status.replace('_', ' ')}</p>
                </div>
                 {canDelete && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="w-full"><Trash2 className="mr-2"/>Delete Sermon</Button>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UploadCloud /> Sermon Audio</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center p-4 border border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground">sermon_audio.mp3</p>
                    <Button variant="link" size="sm">Download</Button>
                </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
