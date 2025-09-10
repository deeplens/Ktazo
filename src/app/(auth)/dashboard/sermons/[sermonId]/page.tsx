import { notFound } from "next/navigation";
import {
  ChevronLeft,
  UploadCloud,
  FileText,
  Sparkles,
  Languages,
  CheckCircle,
  Eye
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
import { getMockSermons, mockWeeklyContent } from "@/lib/mock-data";
import { Label } from "@/components/ui/label";
import { WeeklyContentView } from "@/components/sermons/weekly-content-view";
import { SermonContent } from "./sermon-content";

// Note: This is now a server component to correctly handle params
export default async function SermonDetailPage({ params }: { params: { sermonId: string } }) {
  const sermon = getMockSermons().find(s => s.id === params.sermonId);

  if (!sermon) {
    notFound();
  }

  const weeklyContent = mockWeeklyContent.find(wc => wc.sermonId === sermon.id);
  
  return <SermonContent sermon={sermon} weeklyContent={weeklyContent} />;
}
