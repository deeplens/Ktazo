
'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addSermon } from "@/lib/mock-data";
import { suggestSermonTitle } from "@/ai/flows/suggest-sermon-title";
import { transcribeYoutubeVideo } from "@/ai/flows/transcribe-youtube-video";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function NewSermonPage() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [series, setSeries] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Transcribing...');
  const [transcript, setTranscript] = useState('');
  const [showTranscriptDialog, setShowTranscriptDialog] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleConfirmSermon = (finalTranscript: string, sourceUrl: string) => {
    const newSermon = {
      id: `sermon-${Date.now()}`,
      tenantId: 'tenant-1',
      title,
      series,
      speaker,
      date,
      mp3Url: sourceUrl,
      transcript: finalTranscript,
      status: 'READY_FOR_REVIEW' as const,
      languages: ['en'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addSermon(newSermon);

    toast({
      title: "Sermon Added",
      description: `"${title}" has been added and is ready for review.`,
    });

    if (showTranscriptDialog) setShowTranscriptDialog(false);
    setIsLoading(false);
    router.push(`/dashboard/sermons/${newSermon.id}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!speaker) {
      toast({
        variant: 'destructive',
        title: "Missing Information",
        description: "Please provide a speaker name.",
      });
      return;
    }
    
    if (!youtubeUrl || !youtubeUrl.includes('youtube.com')) {
         toast({ variant: 'destructive', title: "Invalid URL", description: "Please enter a valid YouTube URL." });
        return;
    }

    setIsLoading(true);
    
    try {
        setLoadingMessage('Transcribing...');
        const transcriptionResult = await transcribeYoutubeVideo({ videoUrl: youtubeUrl });
        const currentTranscript = transcriptionResult.transcript;
        setTranscript(currentTranscript);

        if (!title) {
            setLoadingMessage('Suggesting title...');
            const titleResult = await suggestSermonTitle({ transcript: currentTranscript });
            setTitle(titleResult.suggestedTitle);
        }

        setShowTranscriptDialog(true);

    } catch (error) {
        console.error("[[CLIENT - ERROR]] Processing failed", error);
        toast({
            variant: 'destructive',
            title: "Processing Failed",
            description: (error as Error).message || "An unexpected error occurred.",
        });
        setIsLoading(false);
    }
  };
  
  const isProcessButtonDisabled = () => {
    if (isLoading) return true;
    if (!speaker.trim() || !youtubeUrl.trim()) return true;
    return false;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Upload New Sermon</h1>
        <p className="text-muted-foreground">
          Add a new sermon to your congregation&apos;s library by providing a YouTube URL.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Sermon Details</CardTitle>
            <CardDescription>
              Provide the details for the new sermon. A title will be suggested if left blank.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="youtube-url">YouTube URL</Label>
                <div className="flex items-center gap-2">
                    <LinkIcon className="text-muted-foreground" />
                    <Input
                        id="youtube-url"
                        name="youtubeUrl"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Sermon Title (Optional)</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., The Good Shepherd"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isLoading}
                />
                {isLoading && loadingMessage === 'Suggesting title...' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    <span>Suggesting...</span>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="speaker">Speaker</Label>
              <Input
                id="speaker"
                name="speaker"
                placeholder="e.g., Pastor John Doe"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="series">Series (Optional)</Label>
                <Input
                  id="series"
                  name="series"
                  placeholder="e.g., Psalms"
                  value={series}
                  onChange={(e) => setSeries(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date (Optional)</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <CardFooter className="flex justify-end gap-2 mt-4 px-0">
          <Button variant="outline" type="button" onClick={() => router.back()} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isProcessButtonDisabled()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {loadingMessage}
              </>
            ) : (
              'Process Sermon'
            )}
          </Button>
        </CardFooter>
      </form>

      <AlertDialog open={showTranscriptDialog} onOpenChange={setShowTranscriptDialog}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Sermon Details</AlertDialogTitle>
            <AlertDialogDescription>
              Review the generated transcript and the sermon title below. You can edit these later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="preview-title">Sermon Title</Label>
              <Input id="preview-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Transcript</Label>
              <ScrollArea className="h-72 w-full rounded-md border p-4">
                <pre className="text-sm whitespace-pre-wrap">{transcript}</pre>
              </ScrollArea>
            </div>
          </div>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowTranscriptDialog(false);
                setIsLoading(false);
              }}
            >
              Cancel
            </Button>
            <AlertDialogAction onClick={() => {
                handleConfirmSermon(transcript, youtubeUrl);
            }}>
              Confirm and Add Sermon
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
