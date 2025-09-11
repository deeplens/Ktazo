
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, User as UserIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { user, updateUser, loading } = useAuth();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const nameParts = user.name.split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setEmail(user.email);
      setPhotoUrl(user.photoUrl);
      setPhotoPreview(user.photoUrl || null);
    }
  }, [user]);

  const fileToDataURI = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPhotoFile(file);
      const preview = await fileToDataURI(file);
      setPhotoPreview(preview);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    let updatedPhotoUrl = photoUrl;

    if (newPhotoFile && photoPreview) {
      // In a real app, you'd upload the file to a storage service
      // and get a URL back. For this demo, we'll use the data URI.
      updatedPhotoUrl = photoPreview;
    }

    const updatedUserData = {
      name: `${firstName} ${lastName}`.trim(),
      photoUrl: updatedPhotoUrl,
    };

    updateUser(updatedUserData);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    setIsSaving(false);
    setNewPhotoFile(null);

    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been saved.',
    });
  };
  
  if (loading || !user) {
      return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-4 w-2/3 mt-2" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                     <Skeleton className="h-20 w-20 rounded-full" />
                     <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64" />
                     </div>
                </CardContent>
            </Card>
        </div>
      )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2"><UserIcon /> Your Profile</h1>
        <p className="text-muted-foreground">View and manage your personal information.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Information</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={photoUrl} alt={user.name} />
            <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-semibold">{`${firstName} ${lastName}`}</h2>
            <p className="text-muted-foreground">{email}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your name. Email cannot be changed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
           <div className="space-y-2">
            <Label htmlFor="email-display">Email</Label>
            <Input id="email-display" value={email} disabled />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Upload a new photo for your profile.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="h-32 w-32">
                <AvatarImage src={photoPreview || photoUrl} alt={user.name} />
                <AvatarFallback className="text-4xl">{user.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="w-full">
                <Label htmlFor="photo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-accent">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                            {newPhotoFile ? 
                            <span className="font-semibold">{newPhotoFile.name}</span> : 
                            <><span className="font-semibold">Click to upload</span> or drag and drop</>}
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, or GIF</p>
                    </div>
                    <Input id="photo-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/gif" onChange={handlePhotoChange} />
                </Label>
            </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
