
'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Link as LinkIcon, Search, Youtube, UploadCloud, FileText, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addSermon, getTenantSettings } from "@/lib/mock-data";
import { suggestSermonTitle } from "@/ai/flows/suggest-sermon-title";
import { transcribeYoutubeVideo } from "@/ai/flows/transcribe-youtube-video";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";
import { searchYouTube, YouTubeVideoResult, YouTubeSearchOutput } from "@/ai/flows/search-youtube";
import { useAuth } from "@/lib/auth";
import { checkYoutubeCaptions } from "@/ai/flows/check-youtube-captions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { transcribeSermon } from "@/ai/flows/transcribe-sermon";

const sampleVideos: YouTubeVideoResult[] = [
    {
        id: 'KMU0tzLwhbE',
        title: 'Sermon: The Parable of the Sower',
        channel: 'Grace Community Church',
        thumbnailUrl: 'https://i.ytimg.com/vi/KMU0tzLwhbE/hqdefault.jpg'
    },
    {
        id: 'O1bEa-O5s-A',
        title: 'Hope in Times of Trouble - Psalm 46',
        channel: 'Citylight Church',
        thumbnailUrl: 'https://i.ytimg.com/vi/O1bEa-O5s-A/hqdefault.jpg'
    },
    {
        id: 'T8h3f0iW4lY',
        title: 'Living a Life of Purpose',
        channel: 'Redemption Church',
        thumbnailUrl: 'https://i.ytimg.com/vi/T8h3f0iW4lY/hqdefault.jpg'
    },
    {
        id: 'Y8ayP6d3P8w',
        title: 'The Sermon on the Mount: The Beatitudes',
        channel: 'Faith Chapel',
        thumbnailUrl: 'https://i.ytimg.com/vi/Y8ayP6d3P8w/hqdefault.jpg'
    }
];

export default function NewSermonPage() {
  const { user } = useAuth();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [series, setSeries] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Transcribing...');
  const [transcript, setTranscript] = useState('');
  const [showTranscriptDialog, setShowTranscriptDialog] = useState(false);
  const [showYouTubeBrowseDialog, setShowYouTubeBrowseDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<YouTubeSearchOutput>({ videos: [] });
  const [suggestedVideo, setSuggestedVideo] = useState<YouTubeVideoResult | null>(null);
  const [captionStatus, setCaptionStatus] = useState<'idle' | 'checking' | 'enabled' | 'disabled'>('idle');
  const [uploadTab, setUploadTab] = useState('youtube');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [pastedTranscript, setPastedTranscript] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [configuredChannelId, setConfiguredChannelId] = useState<string | null>(null);


  const router = useRouter();
  const { toast } = useToast();

  const handleCaptionCheck = async (videoUrl: string) => {
    if (!videoUrl || !videoUrl.includes('youtube.com')) {
      setCaptionStatus('idle');
      return;
    }
    setCaptionStatus('checking');
    try {
      const result = await checkYoutubeCaptions({ videoUrl });
      setCaptionStatus(result.captionsEnabled ? 'enabled' : 'disabled');
    } catch (error) {
      console.error("[[CLIENT - ERROR]] Caption check failed", error);
      setCaptionStatus('disabled');
    }
  };
  
  useEffect(() => {
    const timer = setTimeout(() => {
        handleCaptionCheck(youtubeUrl);
    }, 500); // Debounce check
    return () => clearTimeout(timer);
  }, [youtubeUrl]);

  useEffect(() => {
    const fetchAndSearchChannel = async () => {
        if (!user) return;
        const settings = getTenantSettings(user.tenantId);
        if (settings.youtubeChannelUrl) {
            const urlParts = settings.youtubeChannelUrl.split('/');
            const identifier = urlParts.find(part => part.startsWith('@') || part.startsWith('UC'));
            
            if (identifier) {
                // Determine if it's a channel ID or a handle that needs to be resolved
                let channelId = identifier.startsWith('UC') ? identifier : undefined;
                if (!channelId) {
                    // It's a handle, we need to find the channelId
                    const channelSearchResult = await searchYouTube({query: identifier, type: 'channel'});
                    if (channelSearchResult.channels && channelSearchResult.channels.length > 0) {
                        channelId = channelSearchResult.channels[0].id;
                    }
                }
                
                if (channelId) {
                    setConfiguredChannelId(channelId);
                    try {
                        const results = await searchYouTube({ query: '', type: 'video', channelId: channelId });
                        if (results.videos && results.videos.length > 0) {
                            const latestVideo = results.videos[0];
                            setYoutubeUrl(`https://www.youtube.com/watch?v=${latestVideo.id}`);
                            setTitle(latestVideo.title);
                            setSuggestedVideo(latestVideo);
                            toast({
                                title: "Sermon Suggested",
                                description: `The latest video from your channel, "${latestVideo.title}", has been pre-filled.`
                            });
                        }
                    } catch (error: any) {
                         console.error('[[CLIENT - ERROR]] YouTube video search failed on load', error);
                         const description = error.message.includes('quota')
                            ? 'The daily limit for YouTube searches has been reached. Please try again tomorrow.'
                            : error.message.includes('API key not valid')
                            ? 'The provided YouTube API key is invalid. Please check your .env file.'
                            : error.message || 'Could not fetch videos from your configured channel.';
                         toast({
                            variant: 'destructive',
                            title: 'Auto-Search Failed',
                            description: description
                        });
                    }
                }
            }
        }
    };
    fetchAndSearchChannel();
  }, [user, toast]);

  const handleConfirmSermon = (finalTranscript: string) => {
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

  const openBrowseDialog = async () => {
    setIsSearching(true);
    setShowYouTubeBrowseDialog(true);
    if (configuredChannelId) {
        try {
            const results = await searchYouTube({ query: '', type: 'video', channelId: configuredChannelId });
            setSearchResults(results);
        } catch (error) {
            console.error("[[CLIENT - ERROR]] Failed to fetch channel videos for browse dialog.", error);
            setSearchResults({ videos: sampleVideos }); // Fallback
        }
    } else {
        setSearchResults({ videos: sampleVideos });
    }
    setIsSearching(false);
  }

  const handleSearch = async () => {
      if (!searchQuery.trim()) return;
      setIsSearching(true);
      try {
        const results = await searchYouTube({ query: searchQuery, type: 'video' });
        setSearchResults(results);
      } catch (error: any) {
        console.error('[[CLIENT - ERROR]] YouTube video search failed', error);
        const description = error.message.includes('quota') 
            ? 'The daily limit for YouTube searches has been reached. Please try again tomorrow.'
            : error.message.includes('API key not valid')
            ? 'The provided YouTube API key is invalid. Please check your .env file.'
            : error.message || 'Could not fetch YouTube videos.';
        toast({
            variant: 'destructive',
            title: 'Search Failed',
            description: description
        });
      } finally {
        setIsSearching(false);
      }
  }

  const handleSelectVideo = (video: YouTubeVideoResult) => {
    setYoutubeUrl(`https://www.youtube.com/watch?v=${video.id}`);
    setTitle(video.title);
    setSuggestedVideo(video);
    setShowYouTubeBrowseDialog(false);
  };
  
  const fileToDataURI = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  }

  const handleTranscriptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTranscriptFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPastedTranscript(ev.target?.result as string);
      };
      reader.readAsText(file);
    }
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
    let currentTranscript = '';
    
    try {
      if (uploadTab === 'youtube') {
        if (!youtubeUrl || !youtubeUrl.includes('youtube.com')) {
          toast({ variant: 'destructive', title: "Invalid URL", description: "Please enter a valid YouTube URL." });
          setIsLoading(false);
          return;
        }
        setSourceUrl(youtubeUrl);
        setLoadingMessage('Transcribing from YouTube...');
        const transcriptionResult = await transcribeYoutubeVideo({ videoUrl: youtubeUrl });
        currentTranscript = transcriptionResult.transcript;
      } else { // File Upload
        if (!audioFile && !pastedTranscript && !transcriptFile) {
            toast({ variant: 'destructive', title: "Missing Input", description: "Please upload an audio/transcript file or paste a transcript." });
            setIsLoading(false);
            return;
        }

        if (pastedTranscript) {
            currentTranscript = pastedTranscript;
            // If there's an audio file, it's just for reference, not transcription
            if(audioFile) {
                const audioDataUri = await fileToDataURI(audioFile);
                setSourceUrl(audioDataUri);
            } else {
                setSourceUrl('');
            }
        } else if (audioFile) {
            setLoadingMessage('Transcribing audio file...');
            const audioDataUri = await fileToDataURI(audioFile);
            setSourceUrl(audioDataUri);
            const transcriptionResult = await transcribeSermon({ mediaUri: audioDataUri });
            currentTranscript = transcriptionResult.transcript;
        }
      }
      
      setTranscript(currentTranscript);
      
      if (!title && currentTranscript) {
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
    if (isLoading || !speaker.trim()) return true;
    if (uploadTab === 'youtube' && !youtubeUrl.trim()) return true;
    if (uploadTab === 'file' && !audioFile && !pastedTranscript.trim() && !transcriptFile) return true;
    return false;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Upload New Sermon</h1>
        <p className="text-muted-foreground">
          Add a new sermon to your congregation&apos;s library.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="youtube" className="mt-8" onValueChange={setUploadTab}>
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="youtube"><Youtube className="mr-2"/> From YouTube</TabsTrigger>
                <TabsTrigger value="file"><UploadCloud className="mr-2"/> From File</TabsTrigger>
            </TabsList>
            <TabsContent value="youtube">
                <Card>
                    <CardHeader>
                        <CardTitle>YouTube Import</CardTitle>
                        <CardDescription>Provide a link to a YouTube video. If captions are available, they will be used. Otherwise, the audio will be transcribed by AI.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {suggestedVideo && (
                            <Card className="overflow-hidden">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-4">
                                    <div className="md:col-span-1 relative min-h-[150px] md:min-h-0">
                                        <Image src={suggestedVideo.thumbnailUrl} alt={suggestedVideo.title} fill className="object-cover" />
                                    </div>
                                    <div className="md:col-span-2 p-4 flex flex-col justify-between">
                                        <div>
                                            <CardDescription>Suggested Sermon</CardDescription>
                                            <CardTitle className="text-xl leading-tight">{suggestedVideo.title}</CardTitle>
                                            <p className="text-sm text-muted-foreground mt-1">{suggestedVideo.channel}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm mt-2">
                                            {captionStatus === 'checking' && <><Loader2 className="h-4 w-4 animate-spin"/> Checking for captions...</>}
                                            {captionStatus === 'enabled' && <><CheckCircle2 className="h-4 w-4 text-green-500"/> Captions Enabled</>}
                                            {captionStatus === 'disabled' && <><XCircle className="h-4 w-4 text-destructive"/> Captions Disabled (AI Fallback)</>}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}
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
                            <Dialog open={showYouTubeBrowseDialog} onOpenChange={setShowYouTubeBrowseDialog}>
                            <DialogTrigger asChild>
                                <Button type="button" variant="outline" disabled={isLoading} onClick={openBrowseDialog}>
                                <Youtube className="mr-2" /> Browse
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                <DialogTitle>Browse YouTube Sermons</DialogTitle>
                                <DialogDescription>{configuredChannelId ? "Recent videos from your channel. Or search all of YouTube." : "Select a sample sermon video or search for one."}</DialogDescription>
                                </DialogHeader>
                                <div className="flex w-full items-center space-x-2">
                                    <Input 
                                        type="search" 
                                        placeholder="Search for sermons..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <Button type="button" onClick={handleSearch} disabled={isSearching}>
                                        {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                                        Search
                                    </Button>
                                </div>
                                <ScrollArea className="h-96">
                                    <div className="space-y-4 pr-6">
                                        {searchResults.videos?.map(video => (
                                            <div key={video.id} className="flex items-center gap-4 hover:bg-accent/50 p-2 rounded-lg cursor-pointer" onClick={() => handleSelectVideo(video)}>
                                                <Image src={video.thumbnailUrl} alt={video.title} width={120} height={90} className="rounded-md" />
                                                <div>
                                                    <p className="font-semibold">{video.title}</p>
                                                    <p className="text-sm text-muted-foreground">{video.channel}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {isSearching && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
                                        {!isSearching && !searchResults.videos?.length && <div className="text-center text-muted-foreground p-8">No videos found.</div>}
                                    </div>
                                </ScrollArea>
                            </DialogContent>
                            </Dialog>
                        </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="file">
                <Card>
                    <CardHeader>
                        <CardTitle>File Upload</CardTitle>
                        <CardDescription>Upload an MP3 for transcription, or provide the transcript directly.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="audio-file" className="flex items-center gap-2"><UploadCloud/> Upload Audio File (MP3)</Label>
                            <Input
                                id="audio-file"
                                type="file"
                                accept=".mp3"
                                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                                disabled={isLoading || !!pastedTranscript.trim()}
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">Or</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="transcript-file" className="flex items-center gap-2"><FileText/> Upload Transcript File (.txt)</Label>
                            <Input
                                id="transcript-file"
                                type="file"
                                accept=".txt"
                                onChange={handleTranscriptFileChange}
                                disabled={isLoading || !!audioFile}
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">Or</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pasted-transcript" className="flex items-center gap-2"><FileText/> Paste Transcript</Label>
                            <Textarea
                                id="pasted-transcript"
                                placeholder="Paste the full sermon transcript here..."
                                rows={8}
                                value={pastedTranscript}
                                onChange={(e) => setPastedTranscript(e.target.value)}
                                disabled={isLoading || !!audioFile || !!transcriptFile}
                            />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Sermon Details</CardTitle>
            <CardDescription>
              Provide the details for the new sermon. A title will be suggested if left blank.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Sermon Title (Optional)</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., The Good Shepherd"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isLoading}
                />
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
                handleConfirmSermon(transcript);
            }}>
              Confirm and Add Sermon
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    