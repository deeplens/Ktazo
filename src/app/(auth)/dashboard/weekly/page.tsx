'use client';
import { mockSermons } from "@/lib/mock-data";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// This page will redirect to the latest published week
export default function WeeklyRedirectPage() {
    const router = useRouter();
    useEffect(() => {
        const latestPublished = mockSermons.find(s => s.status === 'PUBLISHED');
        if (latestPublished) {
            router.replace(`/dashboard/weekly/${latestPublished.id}`);
        }
    }, [router]);

    return (
        <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Finding the latest weekly content...</p>
        </div>
    );
}
