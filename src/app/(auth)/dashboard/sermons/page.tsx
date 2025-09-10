'use client';
import { PlusCircle, File } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getMockSermons } from "@/lib/mock-data";
import { Sermon } from "@/lib/types";
import { useEffect, useState } from "react";


const statusStyles: { [key: string]: string } = {
    DRAFT: "secondary",
    READY_FOR_REVIEW: "outline",
    APPROVED: "default",
    PUBLISHED: "default",
};

const statusColors: { [key: string]: string } = {
    APPROVED: "bg-blue-500",
    PUBLISHED: "bg-green-500",
};

const SermonTable = ({sermons}: {sermons: Sermon[]}) => (
    <Table>
        <TableHeader>
        <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Series</TableHead>
            <TableHead className="hidden md:table-cell">Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
            <span className="sr-only">Actions</span>
            </TableHead>
        </TableRow>
        </TableHeader>
        <TableBody>
        {sermons.map(sermon => (
            <TableRow key={sermon.id}>
                <TableCell className="font-medium">{sermon.title}</TableCell>
                <TableCell className="text-muted-foreground">{sermon.series}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{sermon.date}</TableCell>
                <TableCell>
                    <Badge 
                        variant={statusStyles[sermon.status] as any}
                        className={statusColors[sermon.status]}
                    >
                        {sermon.status.replace('_', ' ')}
                    </Badge>
                </TableCell>
                <TableCell>
                    <Button asChild size="sm" variant="outline">
                        <Link href={`/dashboard/sermons/${sermon.id}`}>Manage</Link>
                    </Button>
                </TableCell>
            </TableRow>
        ))}
        </TableBody>
  </Table>
)

export default function SermonsPage() {
    const [allSermons, setAllSermons] = useState<Sermon[]>([]);

    useEffect(() => {
        setAllSermons(getMockSermons());
    }, []);

    const published = allSermons.filter(s => s.status === 'PUBLISHED');
    const approved = allSermons.filter(s => s.status === 'APPROVED');
    const readyForReview = allSermons.filter(s => s.status === 'READY_FOR_REVIEW');
    const drafts = allSermons.filter(s => s.status === 'DRAFT');

  return (
    <div className="grid flex-1 items-start gap-4 sm:py-0 md:gap-8">
        <div className="flex items-center">
            <div className="flex-1">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Sermons</h1>
                <p className="text-muted-foreground">Manage your congregation's sermons and weekly content.</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 gap-1">
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
                </span>
            </Button>
            <Button size="sm" className="h-8 gap-1" asChild>
              <Link href="/dashboard/sermons/new">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Upload Sermon
                </span>
              </Link>
            </Button>
            </div>
        </div>
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="review">For Review</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>
        <Card>
            <CardContent className="pt-6">
                <TabsContent value="all">
                    <SermonTable sermons={allSermons} />
                </TabsContent>
                <TabsContent value="published">
                    <SermonTable sermons={published} />
                </TabsContent>
                <TabsContent value="approved">
                    <SermonTable sermons={approved} />
                </TabsContent>
                <TabsContent value="review">
                    <SermonTable sermons={readyForReview} />
                </TabsContent>
                <TabsContent value="drafts">
                    <SermonTable sermons={drafts} />
                </TabsContent>
            </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
