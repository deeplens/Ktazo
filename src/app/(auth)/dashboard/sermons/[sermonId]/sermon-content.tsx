'use client';
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  UploadCloud,
  FileText,
  Sparkles,
  Languages,
  CheckCircle,
  Eye,
  Loader2,
  MicVocal
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

interface SermonContentProps {
    sermon: Sermon | null;
    weeklyContent?: WeeklyContent;
    onGenerateContent: () => Promise<void>;
    isGenerating: boolean;
}

export function SermonContent({ sermon, weeklyContent, onGenerateContent, isGenerating }: SermonContentProps) {
  const { user } = useAuth();
  
  if (!sermon) {
    notFound();
  }

  const canManage = user?.role === 'ADMIN' || user?.role === 'PASTOR' || user?.role === 'MASTER';
  const canApprove = canManage;
  const canPublish = canManage;

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
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="description">Sermon Transcript</Label>
                  <Textarea
                    id="description"
                    defaultValue={sermon.transcript}
                    className="min-h-96"
                    disabled={!canManage}
                  />
                </div>
                {canManage && <Button>Save Transcript</Button>}
              </div>
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
                    <WeeklyContentView content={weeklyContent} />
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                        <p className="mb-4 text-muted-foreground">No content has been generated for this sermon yet.</p>
                        <Button 
                          onClick={onGenerateContent} 
                          disabled={sermon.status === 'DRAFT' || isGenerating}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Generate Weekly Content
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
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="status">Status</Label>
                  <p className="text-sm text-muted-foreground">{sermon.status.replace('_', ' ')}</p>
                </div>
              </div>
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

          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Languages /> Translation</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Translate this sermon and its content into another language.</p>
                <Button variant="outline" className="w-full mb-2">Translate to Spanish</Button>
                <Button variant="outline" className="w-full">Translate to Portuguese</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
