
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { ServiceRequest } from '@/lib/types';
import { getServiceRequestsForSermon, addServiceRequest, updateServiceRequest, deleteServiceRequest } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Wrench, Loader2, Send, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

interface ServiceWallProps {
  sermonId: string;
}

export function ServiceWall({ sermonId }: ServiceWallProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [newRequest, setNewRequest] = useState('');
  const [editingRequest, setEditingRequest] = useState<ServiceRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setRequests(getServiceRequestsForSermon(sermonId));
    setIsLoading(false);
  }, [sermonId]);

  const refreshRequests = () => {
    setRequests(getServiceRequestsForSermon(sermonId));
  }

  const handleSubmit = () => {
    if (!user || !newRequest.trim()) return;
    setIsSubmitting(true);
    addServiceRequest({
      userId: user.id,
      userName: user.name,
      userPhotoUrl: user.photoUrl,
      sermonId: sermonId,
      requestText: newRequest,
    });
    setNewRequest('');
    setTimeout(() => {
        refreshRequests();
        setIsSubmitting(false);
        toast({ title: 'Service request submitted.' });
    }, 300); // Simulate network delay
  };

  const handleUpdate = () => {
    if (!editingRequest || !editingRequest.requestText.trim()) return;
    setIsSubmitting(true);
    updateServiceRequest(editingRequest.id, editingRequest.requestText);
    setEditingRequest(null);
     setTimeout(() => {
        refreshRequests();
        setIsSubmitting(false);
        toast({ title: 'Service request updated.' });
    }, 300);
  }

  const handleDelete = (requestId: string) => {
    deleteServiceRequest(requestId);
    setTimeout(() => {
        refreshRequests();
        toast({ title: 'Service request deleted.' });
    }, 300);
  }

  return (
    <Card id="service-wall">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2"><Wrench /> Service Wall</CardTitle>
        <CardDescription>Offer or request practical help within our community.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
                <div key={req.id} className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src={req.userPhotoUrl} alt={req.userName} />
                        <AvatarFallback>{req.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold">{req.userName}</p>
                                <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}</p>
                            </div>
                            {user?.id === req.userId && (
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingRequest(req)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete your service request.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(req.id)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            )}
                        </div>
                        {editingRequest?.id === req.id ? (
                            <div className="mt-2 space-y-2">
                                <Textarea
                                    value={editingRequest.requestText}
                                    onChange={(e) => setEditingRequest({ ...editingRequest, requestText: e.target.value })}
                                    rows={3}
                                />
                                <div className='flex gap-2 justify-end'>
                                    <Button variant="ghost" size="sm" onClick={() => setEditingRequest(null)}>Cancel</Button>
                                    <Button size="sm" onClick={handleUpdate} disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                        Update
                                    </Button>
                                </div>
                            </div>
                        ) : (
                             <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{req.requestText}</p>
                        )}
                    </div>
                </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 border-t pt-6">
        <label htmlFor="new-service-request" className="font-semibold">Add a Service Need or Offer</label>
        <div className="w-full flex items-start gap-4">
            <Avatar className="h-10 w-10 border">
                 {user && <AvatarImage src={user.photoUrl} alt={user.name} />}
                 <AvatarFallback>{user ? user.name.charAt(0) : '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
                <Textarea
                    id="new-service-request"
                    placeholder={user ? "e.g., 'I can offer a ride to the store' or 'I need help with some yard work...'" : "Please log in to submit a service request."}
                    value={newRequest}
                    onChange={(e) => setNewRequest(e.target.value)}
                    rows={3}
                    disabled={!user || isSubmitting}
                />
                <div className="flex justify-end">
                    <Button onClick={handleSubmit} disabled={!user || !newRequest.trim() || isSubmitting}>
                         {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                        Submit
                    </Button>
                </div>
            </div>
        </div>
      </CardFooter>
    </Card>
  );
}
