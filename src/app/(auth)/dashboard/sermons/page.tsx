
'use client';
import { PlusCircle, File, MoreHorizontal } from "lucide-react";
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
import { deleteSermon, getMockSermons } from "@/lib/mock-data";
import { Sermon } from "@/lib/types";
import { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";


const statusStyles: { [key: string]: string } = {
    DRAFT: "secondary",
    READY_FOR_REVIEW: "default",
    APPROVED: "default",
    PUBLISHED: "default",
};

const statusColors: { [key: string]: string } = {
    READY_FOR_REVIEW: "bg-yellow-500",
    APPROVED: "bg-blue-500",
    PUBLISHED: "bg-green-500",
};

const SermonTable = ({sermons, onDelete}: {sermons: Sermon[], onDelete: (sermonId: string) => void}) => {
    const { user } = useAuth();
    const canManage = user?.role === 'ADMIN' || user?.role === 'PASTOR' || user?.role === 'MASTER';
    const viewUrl = canManage ? `/dashboard/sermons` : `/dashboard/weekly`;

    return (
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Speaker</TableHead>
                <TableHead className="hidden md:table-cell">Series</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                {canManage && <TableHead>Status</TableHead>}
                <TableHead>
                <span className="sr-only">Actions</span>
                </TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {sermons.map(sermon => (
                <TableRow key={sermon.id}>
                    <TableCell className="font-medium">
                        <Link href={`${viewUrl}/${sermon.id}`} className="hover:underline">
                            {sermon.title}
                        </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{sermon.speaker}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{sermon.series}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{sermon.date}</TableCell>
                    {canManage && <TableCell>
                        <Badge 
                            variant={statusStyles[sermon.status] as any}
                            className={statusColors[sermon.status]}
                        >
                            {sermon.status.replace(/_/g, ' ')}
                        </Badge>
                    </TableCell>}
                    <TableCell className="text-right">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                    <Link href={`${viewUrl}/${sermon.id}`}>{canManage ? 'Manage' : 'View'}</Link>
                                </DropdownMenuItem>
                                {canManage && (
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" className="w-full justify-start px-2 py-1.5 text-sm text-destructive hover:text-destructive rounded-sm h-auto font-normal relative flex cursor-default select-none items-center gap-2">Delete</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the sermon
                                                    and all of its associated content.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => onDelete(sermon.id)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </TableRow>
            ))}
            </TableBody>
      </Table>
    )
}


export default function SermonsPage() {
    const [allSermons, setAllSermons] = useState<Sermon[]>([]);
    const { toast } = useToast();
    const { user } = useAuth();
    const canManage = user?.role === 'ADMIN' || user?.role === 'PASTOR' || user?.role === 'MASTER';


    useEffect(() => {
        const sermons = getMockSermons();
        if (canManage) {
            setAllSermons(sermons);
        } else {
            setAllSermons(sermons.filter(s => s.status === 'PUBLISHED'));
        }
    }, [canManage]);
    
    const handleDeleteSermon = (sermonId: string) => {
        deleteSermon(sermonId);
        setAllSermons(getMockSermons()); // Refresh the list
        toast({
            title: "Sermon Deleted",
            description: "The sermon has been successfully deleted.",
        });
    };

    const published = allSermons.filter(s => s.status === 'PUBLISHED');
    const approved = allSermons.filter(s => s.status === 'APPROVED');
    const readyForReview = allSermons.filter(s => s.status === 'READY_FOR_REVIEW');
    const drafts = allSermons.filter(s => s.status === 'DRAFT');

  return (
    <div className="grid flex-1 items-start gap-4 sm:py-0 md:gap-8">
        <div className="flex items-center">
            <div className="flex-1">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Sermons</h1>
                <p className="text-muted-foreground">
                    {canManage ? "Manage your congregation's sermons and weekly content." : "Browse all published sermons from your congregation."}
                </p>
            </div>
            {canManage && (
                <div className="ml-auto flex items-center gap-2">
                <Button size="sm" className="h-8 gap-1" asChild>
                <Link href="/dashboard/sermons/new">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Upload Sermon
                    </span>
                </Link>
                </Button>
                </div>
            )}
        </div>
      {canManage ? (
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
                        <SermonTable sermons={allSermons} onDelete={handleDeleteSermon} />
                    </TabsContent>
                    <TabsContent value="published">
                        <SermonTable sermons={published} onDelete={handleDeleteSermon} />
                    </TabsContent>
                    <TabsContent value="approved">
                        <SermonTable sermons={approved} onDelete={handleDeleteSermon} />
                    </TabsContent>
                    <TabsContent value="review">
                        <SermonTable sermons={readyForReview} onDelete={handleDeleteSermon} />
                    </TabsContent>
                    <TabsContent value="drafts">
                        <SermonTable sermons={drafts} onDelete={handleDeleteSermon} />
                    </TabsContent>
                </CardContent>
            </Card>
        </Tabs>
      ) : (
        <Card>
            <CardContent className="pt-6">
                <SermonTable sermons={allSermons} onDelete={handleDeleteSermon} />
            </CardContent>
        </Card>
      )}
    </div>
  );
}
