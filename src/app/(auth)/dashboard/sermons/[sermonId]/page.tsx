'use client';
import { notFound, useParams } from "next/navigation";
import { getMockSermons, mockWeeklyContent } from "@/lib/mock-data";
import { SermonContent } from "./sermon-content";
import { useEffect, useState } from "react";
import { Sermon, WeeklyContent } from "@/lib/types";

export default function SermonDetailPage() {
  const params = useParams();
  const sermonId = params.sermonId as string;
  
  const [sermon, setSermon] = useState<Sermon | null | undefined>(undefined);
  const [weeklyContent, setWeeklyContent] = useState<WeeklyContent | undefined>(undefined);

  useEffect(() => {
    if (sermonId) {
      const foundSermon = getMockSermons().find(s => s.id === sermonId);
      setSermon(foundSermon);
      if (foundSermon) {
        const foundContent = mockWeeklyContent.find(wc => wc.sermonId === foundSermon.id);
        setWeeklyContent(foundContent);
      }
    }
  }, [sermonId]);

  if (sermon === undefined) {
    // Loading state, can show a skeleton here if desired
    return null;
  }

  if (!sermon) {
    notFound();
  }
  
  return <SermonContent sermon={sermon} weeklyContent={weeklyContent} />;
}
