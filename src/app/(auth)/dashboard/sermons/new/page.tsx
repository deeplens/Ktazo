'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockSermons } from "@/lib/mock-data";

export default function NewSermonPage() {
    const [title, setTitle] = useState('');
    const [series, setSeries] = useState('');
    const [date, setDate] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !title) {
            toast({
                variant: 'destructive',
                title: "Missing Information",
                description: "Please provide a title and select an MP3 file.",
            });
            return;
        }

        setIsLoading(true);
        // Simulate upload and processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Add to mock data
        const newSermon = {
            id: `sermon-${mockSermons.length + 1}`,
            tenantId: 'tenant-1',
            title,
            series,
            date,
            mp3Url: `path/to/${file.name}`,
            transcript: '',
            status: 'DRAFT' as const,
            languages: ['en'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        mockSermons.unshift(newSermon);

        setIsLoading(false);
        toast({
            title: "Sermon Uploaded",
            description: `"${title}" is now in your drafts.`,
        });

        router.push('/dashboard/sermons');
    };

    return (
        <div className="max-w-4xl mx-auto">
             <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Upload New Sermon</h1>
                <p className="text-muted-foreground">Add a new sermon to your congregation's library.</p>
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
                        <div className="space-y-2">
                            <Label htmlFor="audio-file">Audio File (MP3)</Label>
                             <div className="flex items-center justify-center w-full">
                                <Label htmlFor="audio-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-accent">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground">
                                            {file ? 
                                            <span className="font-semibold">{file.name}</span> : 
                                            <><span className="font-semibold">Click to upload</span> or drag and drop</>}
                                        </p>
                                        <p className="text-xs text-muted-foreground">MP3 audio file</p>
                                    </div>
                                    <Input id="audio-file" type="file" className="hidden" accept=".mp3" onChange={(e) => setFile(e.target.files?.[0] || null)} disabled={isLoading} />
                                </Label>
                            </div> 
                        </div>
                    </CardContent>
                </Card>
                <CardFooter className="flex justify-end gap-2 mt-4 px-0">
                    <Button variant="outline" type="button" onClick={() => router.back()} disabled={isLoading}>Cancel</Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save and Upload
                    </Button>
                </CardFooter>
            </form>
        </div>
    );
}
