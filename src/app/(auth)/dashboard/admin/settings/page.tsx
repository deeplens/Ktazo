
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Church, Globe, Palette, Volume2, Link as LinkIcon, Loader2, MessageSquareQuote, Mail, Smartphone, Youtube, Search } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { getTenantSettings, saveTenantSettings } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { TenantSettings, YouTubeChannelResult } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { YouTubeSearchOutput, searchYouTube } from "@/ai/flows/search-youtube";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export default function SettingsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [settings, setSettings] = useState<TenantSettings | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showYouTubeBrowseDialog, setShowYouTubeBrowseDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<YouTubeSearchOutput>({});
    const [isFetchingChannelInfo, setIsFetchingChannelInfo] = useState(false);
    const [channelInfo, setChannelInfo] = useState<YouTubeChannelResult | null>(null);


    useEffect(() => {
        if (user) {
            const currentSettings = getTenantSettings(user.tenantId);
            setSettings(currentSettings);
            if (currentSettings.youtubeChannelUrl) {
                fetchChannelInfo(currentSettings.youtubeChannelUrl);
            }
        }
    }, [user]);
    
    const fetchChannelInfo = async (url: string) => {
        if (!url || !url.includes('youtube.com')) {
            setChannelInfo(null);
            return;
        }

        setIsFetchingChannelInfo(true);
        try {
            const urlParts = url.split('/');
            const identifier = urlParts[urlParts.length - 1].split('?')[0] || '';

            if (!identifier) {
                 setChannelInfo(null);
                 setIsFetchingChannelInfo(false);
                 return;
            }
            
            const result = await searchYouTube({ query: identifier, type: 'channel' });
            if (result.channels && result.channels.length > 0) {
                 setChannelInfo(result.channels[0]);
            } else {
                setChannelInfo(null);
                toast({
                    variant: 'destructive',
                    title: 'Channel Not Found',
                    description: `Could not find a YouTube channel for the provided URL.`
                })
            }

        } catch (error: any) {
            console.error('[[CLIENT - ERROR]] Failed to fetch channel info', error);
            const description = error.message.includes('quota')
                ? 'The daily limit for YouTube searches has been reached. Please try again tomorrow.'
                : 'Could not fetch channel information. Please check the URL and your API key.';
            toast({
                variant: 'destructive',
                title: 'Error Fetching Channel',
                description: description,
            });
            setChannelInfo(null);
        } finally {
            setIsFetchingChannelInfo(false);
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            if (settings?.youtubeChannelUrl) {
                fetchChannelInfo(settings.youtubeChannelUrl);
            } else {
                setChannelInfo(null);
            }
        }, 1000); // Debounce the fetch
        return () => clearTimeout(handler);
    }, [settings?.youtubeChannelUrl]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const results = await searchYouTube({ query: searchQuery, type: 'channel' });
            setSearchResults(results);
        } catch (error: any) {
            console.error('[[CLIENT - ERROR]] YouTube channel search failed', error);
            const description = error.message.includes('quota') 
                ? 'The daily limit for YouTube searches has been reached. Please try again tomorrow.'
                : error.message.includes('API key not valid')
                ? 'The provided YouTube API key is invalid. Please check your .env file.'
                : error.message || 'Could not fetch YouTube channels.';
            toast({
                variant: 'destructive',
                title: 'Search Failed',
                description: description
            });
        } finally {
            setIsSearching(false);
        }
    }

    const handleSaveIdentity = () => {
        if (!user || !settings) return;
        setIsSaving(true);
        saveTenantSettings(user.tenantId, settings);
        
        setTimeout(() => {
            setIsSaving(false);
            toast({
                title: "Identity Settings Saved",
                description: "Your congregation's identity settings have been updated.",
            });
        }, 500);
    };


    const handleSave = () => {
        if (!user || !settings) return;
        setIsSaving(true);
        saveTenantSettings(user.tenantId, settings);
        
        // Simulate network delay
        setTimeout(() => {
            setIsSaving(false);
            toast({
                title: "Settings Saved",
                description: "Your congregation's settings have been updated.",
            });
        }, 500);
    };

    const handleSettingChange = (key: keyof TenantSettings, value: any) => {
        setSettings(prev => {
            if (!prev) return null;
            return { ...prev, [key]: value };
        });
    }

    const handleSelectChannel = (channel: YouTubeChannelResult) => {
        const url = channel.handle ? `https://www.youtube.com/${channel.handle}` : `https://www.youtube.com/channel/${channel.id}`;
        handleSettingChange('youtubeChannelUrl', url);
        setChannelInfo(channel);
        setShowYouTubeBrowseDialog(false);
    };

    if (!settings) {
        return <div>Loading settings...</div>; // Or a skeleton loader
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
             <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Settings</h1>
                <p className="text-muted-foreground">Configure your congregation's preferences and settings.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Church /> Congregation Identity</CardTitle>
                    <CardDescription>Provide details about your church. This information helps the AI understand your unique voice and style.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="church-name">Church Name</Label>
                        <Input id="church-name" placeholder="e.g., First Community Church" />
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" placeholder="e.g., Springfield" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input id="state" placeholder="e.g., Illinois" />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="contact-info">Contact Info</Label>
                        <Input id="contact-info" placeholder="e.g., office@firstcommunity.org" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="youtube-channel-url">YouTube Channel URL</Label>
                        <div className="flex items-center gap-2">
                            {isFetchingChannelInfo ? (
                                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                            ) : channelInfo ? (
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={channelInfo.thumbnailUrl} alt={channelInfo.name} />
                                    <AvatarFallback><Youtube/></AvatarFallback>
                                </Avatar>
                            ) : (
                                 <Avatar className="h-10 w-10 bg-muted">
                                    <AvatarFallback><Youtube className="text-muted-foreground"/></AvatarFallback>
                                </Avatar>
                            )}

                            <Input 
                                id="youtube-channel-url" 
                                placeholder="https://www.youtube.com/@YourChannel" 
                                value={settings.youtubeChannelUrl || ''}
                                onChange={e => handleSettingChange('youtubeChannelUrl', e.target.value)}
                            />
                             <Dialog open={showYouTubeBrowseDialog} onOpenChange={setShowYouTubeBrowseDialog}>
                                <DialogTrigger asChild>
                                    <Button type="button" variant="outline">
                                        <Search className="mr-2 h-4 w-4" /> Browse
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Browse YouTube Channels</DialogTitle>
                                        <DialogDescription>Search for your church's YouTube channel.</DialogDescription>
                                    </DialogHeader>
                                    <div className="flex w-full items-center space-x-2">
                                        <Input 
                                            type="search" 
                                            placeholder="Search for a channel..." 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                        <Button type="button" onClick={handleSearch} disabled={isSearching}>
                                            {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                                            Search
                                        </Button>
                                    </div>
                                    <ScrollArea className="h-72">
                                        <div className="space-y-4 pr-6">
                                            {searchResults.channels?.map(channel => (
                                                <div key={channel.id} className="flex items-center gap-4 hover:bg-accent/50 p-2 rounded-lg cursor-pointer" onClick={() => handleSelectChannel(channel)}>
                                                    <Image src={channel.thumbnailUrl} alt={channel.name} width={48} height={48} className="rounded-full" />
                                                    <div>
                                                        <p className="font-semibold">{channel.name}</p>
                                                        <p className="text-sm text-muted-foreground">{channel.handle || `channel/${channel.id}`}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {isSearching && <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
                                            {!isSearching && !searchResults.channels?.length && <div className="text-center text-muted-foreground p-4">No channels found. Try another search.</div>}
                                        </div>
                                    </ScrollArea>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="church-voice">Church Voice & Identity</Label>
                        <Textarea 
                            id="church-voice"
                            placeholder="Describe your church's doctrine, emphasis, and identity. For example: 'We are a conservative Baptist congregation ministering to mainly blue-collar families with little bible knowledge...'"
                            rows={5}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveIdentity} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Identity
                    </Button>
                </CardFooter>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Volume2 /> AI Voice & Tone</CardTitle>
                    <CardDescription>Adjust the sliders to match the doctrinal tone and voice of your church. These settings will guide all AI-generated content.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="friendly-slider">Friendly (70/100)</Label>
                        <Slider id="friendly-slider" defaultValue={[70]} max={100} step={1} />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="encouraging-slider">Encouraging (70/100)</Label>
                        <Slider id="encouraging-slider" defaultValue={[70]} max={100} step={1} />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="formal-slider">Formal (50/100)</Label>
                        <Slider id="formal-slider" defaultValue={[50]} max={100} step={1} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Globe /> RAG Custom Sources</CardTitle>
                    <CardDescription>Add pastor-approved URLs to the RAG chatbot's knowledge base. The chatbot will use these, in addition to the sermon corpus, to answer questions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="url1">Custom URL 1</Label>
                        <Input id="url1" placeholder="https://www.yourchurch.com/our-beliefs" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="url2">Custom URL 2</Label>
                        <Input id="url2" placeholder="https://approved-theology-resource.com" />
                    </div>
                    <Button variant="outline">Add another URL</Button>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MessageSquareQuote /> Weekly One-Liner Notifications</CardTitle>
                    <CardDescription>Send concise, impactful quotes from the sermon mid-week to keep the message top-of-mind.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4 rounded-md border p-4">
                        <div className="flex-1 space-y-1">
                            <Label htmlFor="one-liner-switch" className="text-base">Enable Weekly One-Liners</Label>
                            <p className="text-sm text-muted-foreground">
                            When enabled, automated messages will be sent for any sermon where one-liners are active.
                            </p>
                        </div>
                        <Switch id="one-liner-switch" checked={settings.notifications.oneLiners.enabled} onCheckedChange={checked => handleSettingChange('notifications', { ...settings.notifications, oneLiners: { ...settings.notifications.oneLiners, enabled: checked } })} />
                    </div>

                    <div className="space-y-4">
                        <Label className="font-semibold">Delivery Method</Label>
                        <div className="flex items-start space-x-6">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="email-delivery" checked={settings.notifications.oneLiners.sendByEmail} onCheckedChange={checked => handleSettingChange('notifications', { ...settings.notifications, oneLiners: { ...settings.notifications.oneLiners, sendByEmail: !!checked } })} />
                                <Label htmlFor="email-delivery" className="flex items-center gap-2"><Mail /> Email</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <Checkbox id="sms-delivery" checked={settings.notifications.oneLiners.sendBySms} onCheckedChange={checked => handleSettingChange('notifications', { ...settings.notifications, oneLiners: { ...settings.notifications.oneLiners, sendBySms: !!checked } })}/>
                                <Label htmlFor="sms-delivery" className="flex items-center gap-2"><Smartphone /> Text Message (SMS)</Label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="font-semibold">Target Audience</Label>
                        <RadioGroup value={settings.notifications.oneLiners.audience} onValueChange={value => handleSettingChange('notifications', { ...settings.notifications, oneLiners: { ...settings.notifications.oneLiners, audience: value as any } })}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="all" id="r1" />
                                <Label htmlFor="r1">All Users</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="members_and_regulars" id="r2" />
                                <Label htmlFor="r2">Members & Regular Attenders</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="members_only" id="r3" />
                                <Label htmlFor="r3">Members Only</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><LinkIcon /> Optional Member Services</CardTitle>
                    <CardDescription>Select optional services to make available to your members.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="odb" 
                            checked={settings.optionalServices.ourDailyBread}
                            onCheckedChange={checked => handleSettingChange('optionalServices', { ...settings.optionalServices, ourDailyBread: !!checked })}
                        />
                        <Label htmlFor="odb" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                           Our Daily Bread podcast
                        </Label>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Global Notification Settings</CardTitle>
                    <CardDescription>Manage global email settings for your congregation.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="flex items-center space-x-4 rounded-md border p-4">
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                            Suspend all notifications during backfills
                            </p>
                            <p className="text-sm text-muted-foreground">
                            Temporarily pause all automated emails while you are uploading and processing a large number of past sermons.
                            </p>
                        </div>
                        <Switch checked={settings.notifications.suspendDuringBackfill} onCheckedChange={checked => handleSettingChange('notifications', { ...settings.notifications, suspendDuringBackfill: checked })} />
                    </div>
                </CardContent>
            </Card>

             <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                     {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save All Settings
                </Button>
            </div>
        </div>
    );
}
