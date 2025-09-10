'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMockSermons } from "@/lib/mock-data";
import Link from "next/link";
import { ArrowRight, CheckCircle, Edit, FileText, UploadCloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sermon } from "@/lib/types";
import { useEffect, useState } from "react";

const statusInfo: any = {
  DRAFT: { icon: Edit, label: "Draft", color: "bg-gray-500" },
  READY_FOR_REVIEW: { icon: FileText, label: "Ready for Review", color: "bg-yellow-500" },
  APPROVED: { icon: CheckCircle, label: "Approved", color: "bg-blue-500" },
  PUBLISHED: { icon: CheckCircle, label: "Published", color: "bg-green-500" },
};

export function AdminPastorDashboard() {
  const [sermons, setSermons] = useState<Sermon[]>([]);

  useEffect(() => {
    setSermons(getMockSermons());
  }, []);

  const sermonsToReview = sermons.filter((s) => s.status === "READY_FOR_REVIEW");
  const drafts = sermons.filter((s) => s.status === "DRAFT");

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <UploadCloud /> Sermon Pipeline
            </CardTitle>
            <CardDescription>
              Manage your weekly sermon content from upload to publication.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/sermons">View All Sermons</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Sermons for Review</CardTitle>
            <CardDescription>
              Sermons that have been transcribed and are ready for content generation and approval.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sermonsToReview.length > 0 ? (
              <ul className="space-y-2">
                {sermonsToReview.map((sermon) => (
                  <li key={sermon.id} className="flex justify-between items-center">
                    <span>{sermon.title}</span>
                    <Button asChild variant="secondary" size="sm">
                      <Link href={`/dashboard/sermons/${sermon.id}`}>Review</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No sermons are currently ready for review.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Drafts</CardTitle>
            <CardDescription>
              Sermons that have been uploaded but not yet transcribed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {drafts.length > 0 ? (
              <ul className="space-y-2">
                {drafts.map((sermon) => (
                  <li key={sermon.id} className="flex justify-between items-center">
                    <span>{sermon.title}</span>
                    <Button asChild variant="secondary" size="sm">
                      <Link href={`/dashboard/sermons/${sermon.id}`}>View</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No sermons in draft.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Recent Sermons</CardTitle>
          <CardDescription>
            An overview of the most recent sermons in your pipeline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="pb-2 font-medium">Title</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {sermons.slice(0, 4).map((sermon) => {
                  const { icon: Icon, label, color } = statusInfo[sermon.status];
                  return (
                    <tr key={sermon.id} className="border-t">
                      <td className="py-3 pr-4">{sermon.title}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{sermon.date}</td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant="secondary"
                          className={`flex items-center gap-1.5 w-fit ${color}`}
                        >
                          <Icon className="h-3 w-3" />
                          {label}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/dashboard/sermons/${sermon.id}`}>
                            View <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
