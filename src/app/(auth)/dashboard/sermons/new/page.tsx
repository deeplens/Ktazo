
'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, Loader2, FileText, Sparkles, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addSermon } from "@/lib/mock-data";
import { transcribeSermon } from "@/ai/flows/transcribe-sermon";
import { suggestSermonTitle } from "@/ai/flows/suggest-sermon-title";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function NewSermonPage() {
  const [title, setTitle] = useState('');
  const [series, setSeries] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [date, setDate] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [textFile, setTextFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Transcribing...');
  const [transcript, setTranscript] = useState('');
  const [showTranscriptDialog, setShowTranscriptDialog] = useState(false);
  const [uploadType, setUploadType] = useState<'audio' | 'text'>('audio');
  const router = useRouter();
  const { toast } = useToast();

  // Cleanup any object URL on unmount (and before changing to a new one)
  useEffect(() => {
    return () => {
      if (audioBlobUrl) URL.revokeObjectURL(audioBlobUrl);
    };
  }, [audioBlobUrl]);

  const fileToDataURI = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  }

  const fileToText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleAudioFileChange = async (file: File | null) => {
    setAudioFile(file);
    if (audioBlobUrl) {
      URL.revokeObjectURL(audioBlobUrl);
      setAudioBlobUrl(null);
    }

    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setAudioBlobUrl(blobUrl);
      if (!title && file.name) {
        // Pre-fill title from filename, removing extension
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

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

    setIsLoading(true);
    let sourceForSermon = '';
    let audioDataUrlForTranscription = '';

    try {
        if (uploadType === 'audio') {
            if (!audioFile) {
                toast({ variant: 'destructive', title: "Missing File", description: "Please select an MP3 file to upload." });
                setIsLoading(false);
                return;
            }
            const audioDataUrl = await fileToDataURI(audioFile);
            sourceForSermon = audioBlobUrl || audioDataUrl; // Use blob for playback, data for processing
            audioDataUrlForTranscription = audioDataUrl;
        } else { // Text tab
            if (!textFile) {
                toast({ variant: 'destructive', title: "Missing Transcript File", description: "Please upload a text file for the transcript." });
                setIsLoading(false);
                return;
            }
            const textContent = await fileToText(textFile);
            setTranscript(textContent);
            setLoadingMessage('Suggesting title...');
            if (!title) {
                const titleResult = await suggestSermonTitle({ transcript: textContent });
                setTitle(titleResult.suggestedTitle);
            }
            setShowTranscriptDialog(true);
            return; // Skip transcription
        }

        setLoadingMessage('Transcribing...');
        const transcriptionResult = await transcribeSermon({ audioDataUri: audioDataUrlForTranscription });
        const currentTranscript = transcriptionResult.transcript;
        setTranscript(currentTranscript);

        if (!title) {
            setLoadingMessage('Suggesting title...');
            const titleResult = await suggestSermonTitle({ transcript: currentTranscript });
            setTitle(titleResult.suggestedTitle);
        }

        setShowTranscriptDialog(true);

    } catch (error) {
        console.error("Processing failed", error);
        toast({
            variant: 'destructive',
            title: "Processing Failed",
            description: (error as Error).message || "An unexpected error occurred.",
        });
        setIsLoading(false);
    }
  };

  const handleDrop = (
    e: React.DragEvent<HTMLLabelElement>,
    fileSetter: (file: File | null) => void,
    fileType: 'audio' | 'text'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const acceptedAudioTypes = ['audio/mpeg'];
      const acceptedTextTypes = ['text/plain', 'text/markdown'];

      if (fileType === 'audio' && (acceptedAudioTypes.includes(file.type) || file.name.endsWith('.mp3'))) {
        handleAudioFileChange(file);
      } else if (
        fileType === 'text' &&
        (acceptedTextTypes.includes(file.type) || file.name.endsWith('.txt') || file.name.endsWith('.md'))
      ) {
        setTextFile(file);
        if (!title && file.name) {
          setTitle(file.name.replace(/\.[^/.]+$/, ""));
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: `Please drop a valid ${fileType === 'audio' ? '.mp3' : '.txt or .md'} file.`,
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const isProcessButtonDisabled = () => {
    if (isLoading) return true;
    if (!speaker.trim()) return true;
    switch (uploadType) {
        case 'audio':
            return !audioFile;
        case 'text':
            return !textFile;
        default:
            return true;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Upload New Sermon</h1>
        <p className="text-muted-foreground">
          Add a new sermon to your congregation&apos;s library by providing a URL or uploading a file.
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
              <Label htmlFor="title">Sermon Title</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="title"
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
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <Label>Sermon Source</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={uploadType === 'audio' ? 'default' : 'outline'}
                  onClick={() => setUploadType('audio')}
                  disabled={isLoading}
                >
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Audio File
                </Button>
                <Button
                  type="button"
                  variant={uploadType === 'text' ? 'default' : 'outline'}
                  onClick={() => setUploadType('text')}
                  disabled={isLoading}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Transcript
                </Button>
              </div>

              {uploadType === 'audio' && (
                <div className="space-y-2">
                  <Label htmlFor="audio-file">Audio File (MP3)</Label>
                  <div className="flex items-center justify-center w-full">
                    <Label
                      htmlFor="audio-file"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-accent"
                      onDrop={(e) => handleDrop(e, handleAudioFileChange, 'audio')}
                      onDragOver={handleDragOver}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          {audioFile ? (
                            <span className="font-semibold">{audioFile.name}</span>
                          ) : (
                            <>
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">MP3 audio file</p>
                      </div>
                      <Input
                        id="audio-file"
                        type="file"
                        className="hidden"
                        accept=".mp3,audio/mpeg"
                        onChange={(e) => handleAudioFileChange(e.target.files?.[0] || null)}
                        disabled={isLoading}
                      />
                    </Label>
                  </div>
                  {audioBlobUrl && (
                    <div className="pt-2">
                      <Label>Audio Preview</Label>
                      <audio controls src={audioBlobUrl} className="w-full mt-2">
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                </div>
              )}

              {uploadType === 'text' && (
                <div className="space-y-2">
                  <Label htmlFor="text-file">Transcript File</Label>
                  <div className="flex items-center justify-center w-full">
                    <Label
                      htmlFor="text-file"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-accent"
                      onDrop={(e) => handleDrop(e, setTextFile, 'text')}
                      onDragOver={handleDragOver}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FileText className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          {textFile ? (
                            <span className="font-semibold">{textFile.name}</span>
                          ) : (
                            <>
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">TXT or MD file</p>
                      </div>
                      <Input
                        id="text-file"
                        type="file"
                        className="hidden"
                        accept=".txt,.md"
                        onChange={(e) => setTextFile(e.target.files?.[0] || null)}
                        disabled={isLoading}
                      />
                    </Label>
                  </div>
                </div>
              )}
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
                const sourceUrl = uploadType === 'audio' && audioBlobUrl ? audioBlobUrl : '';
                handleConfirmSermon(transcript, sourceUrl);
            }}>
              Confirm and Add Sermon
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
