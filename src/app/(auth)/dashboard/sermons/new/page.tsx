
'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, Loader2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addSermon } from "@/lib/mock-data";
import { transcribeSermon } from "@/ai/flows/transcribe-sermon";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function NewSermonPage() {
    const [title, setTitle] = useState('');
    const [series, setSeries] = useState('');
    const [date, setDate] = useState('');
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [textFile, setTextFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [showTranscriptDialog, setShowTranscriptDialog] = useState(false);
    const [uploadType, setUploadType] = useState<'audio' | 'text'>('audio');
    const router = useRouter();
    const { toast } = useToast();

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

    const handleConfirmSermon = (finalTranscript: string, source: 'audio' | 'text') => {
         const newSermon = {
            id: `sermon-${Date.now()}`,
            tenantId: 'tenant-1',
            title,
            series,
            date,
            mp3Url: source === 'audio' && audioFile ? `path/to/${audioFile.name}` : '',
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
        
        if(showTranscriptDialog) setShowTranscriptDialog(false);
        router.push('/dashboard/sermons');
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) {
            toast({
                variant: 'destructive',
                title: "Missing Title",
                description: "Please provide a sermon title.",
            });
            return;
        }

        setIsLoading(true);

        if (uploadType === 'audio') {
            if (!audioFile) {
                 toast({
                    variant: 'destructive',
                    title: "Missing File",
                    description: "Please select an MP3 file to upload.",
                });
                setIsLoading(false);
                return;
            }
             try {
                const audioDataUri = await fileToDataURI(audioFile);
                const transcriptionResult = await transcribeSermon({ mp3Url: audioDataUri });
                setTranscript(transcriptionResult.transcript);
                setShowTranscriptDialog(true);
            } catch (error) {
                console.error("Transcription failed", error);
                toast({
                    variant: 'destructive',
                    title: "Transcription Failed",
                    description: "There was an error processing your audio file. Please try again.",
                });
            } finally {
                setIsLoading(false);
            }
        } else { // Text tab
            if (!textFile) {
                 toast({
                    variant: 'destructive',
                    title: "Missing Transcript File",
                    description: "Please upload a text file for the transcript.",
                });
                setIsLoading(false);
                return;
            }
            try {
                const textContent = await fileToText(textFile);
                handleConfirmSermon(textContent, 'text');
            } catch (error) {
                 console.error("File read failed", error);
                toast({
                    variant: 'destructive',
                    title: "File Read Error",
                    description: "There was an error reading the transcript file.",
                });
                setIsLoading(false);
            }
        }
    };


    return (
        <div className="max-w-4xl mx-auto">
             <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Upload New Sermon</h1>
                <p className="text-muted-foreground">Add a new sermon to your congregation's library by uploading an audio or transcript file.</p>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Sermon Details</CardTitle>
                        <CardDescription>Provide the details for the new sermon.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Sermon Title</Label>
                            <Input id="title" placeholder="e.g., The Good Shepherd" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={isLoading} />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="series">Series (Optional)</Label>
                                <Input id="series" placeholder="e.g., Psalms" value={series} onChange={(e) => setSeries(e.target.value)} disabled={isLoading} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Date (Optional)</Label>
                                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={isLoading} />
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
                                    <UploadCloud className="mr-2 h-4 w-4"/>Upload Audio
                                </Button>
                                <Button 
                                    type="button"
                                    variant={uploadType === 'text' ? 'default' : 'outline'}
                                    onClick={() => setUploadType('text')}
                                    disabled={isLoading}
                                >
                                    <FileText className="mr-2 h-4 w-4"/>Upload Transcript
                                </Button>
                             </div>
                             
                             {uploadType === 'audio' ? (
                                <div className="space-y-2">
                                    <Label htmlFor="audio-file">Audio File (MP3)</Label>
                                    <div className="flex items-center justify-center w-full">
                                        <Label htmlFor="audio-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-accent">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                                <p className="mb-2 text-sm text-muted-foreground">
                                                    {audioFile ? 
                                                    <span className="font-semibold">{audioFile.name}</span> : 
                                                    <><span className="font-semibold">Click to upload</span> or drag and drop</>}
                                                </p>
                                                <p className="text-xs text-muted-foreground">MP3 audio file</p>
                                            </div>
                                            <Input id="audio-file" type="file" className="hidden" accept=".mp3" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} disabled={isLoading} />
                                        </Label>
                                    </div> 
                                </div>
                             ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="text-file">Transcript File</Label>
                                     <div className="flex items-center justify-center w-full">
                                        <Label htmlFor="text-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-accent">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <FileText className="w-8 h-8 mb-4 text-muted-foreground" />
                                                <p className="mb-2 text-sm text-muted-foreground">
                                                    {textFile ? 
                                                    <span className="font-semibold">{textFile.name}</span> : 
                                                    <><span className="font-semibold">Click to upload</span> or drag and drop</>}
                                                </p>
                                                <p className="text-xs text-muted-foreground">TXT, MD, or DOCX file</p>
                                            </div>
                                            <Input id="text-file" type="file" className="hidden" accept=".txt,.md,.docx" onChange={(e) => setTextFile(e.target.files?.[0] || null)} disabled={isLoading} />
                                        </Label>
                                    </div> 
                                </div>
                             )}

                        </div>

                    </CardContent>
                </Card>
                <CardFooter className="flex justify-end gap-2 mt-4 px-0">
                    <Button variant="outline" type="button" onClick={() => router.back()} disabled={isLoading}>Cancel</Button>
                    <Button type="submit" disabled={isLoading || !title || (uploadType === 'audio' && !audioFile) || (uploadType === 'text' && !textFile)}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {uploadType === 'audio' ? 'Transcribing...' : 'Adding...'}
                            </>
                        ) : (
                             uploadType === 'audio' ? 'Upload and Transcribe' : 'Add Sermon'
                        )}
                    </Button>
                </CardFooter>
            </form>
            
            <AlertDialog open={showTranscriptDialog} onOpenChange={setShowTranscriptDialog}>
                <AlertDialogContent className="max-w-3xl">
                    <AlertDialogHeader>
                    <AlertDialogTitle>Transcription Result</AlertDialogTitle>
                    <AlertDialogDescription>
                        Review the generated transcript below. You can edit it later from the sermon detail page.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <ScrollArea className="h-96 w-full rounded-md border p-4">
                        <pre className="text-sm whitespace-pre-wrap">{transcript}</pre>
                    </ScrollArea>
                    <AlertDialogFooter>
                        <Button variant="outline" onClick={() => setShowTranscriptDialog(false)}>Cancel</Button>
                        <AlertDialogAction onClick={() => handleConfirmSermon(transcript, 'audio')}>Confirm and Add Sermon</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
