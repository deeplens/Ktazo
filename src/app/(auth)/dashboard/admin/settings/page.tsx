
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Church, Globe, Palette, Volume2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function SettingsPage() {
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
                        <Label htmlFor="church-voice">Church Voice & Identity</Label>
                        <Textarea 
                            id="church-voice"
                            placeholder="Describe your church's doctrine, emphasis, and identity. For example: 'We are a conservative Baptist congregation ministering to mainly blue-collar former Catholics...'"
                            rows={5}
                        />
                    </div>
                </CardContent>
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
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Manage email notifications for your congregation.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="flex items-center space-x-4 rounded-md border p-4">
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                            Suspend notifications during backfills
                            </p>
                            <p className="text-sm text-muted-foreground">
                            Temporarily pause all automated emails while you are uploading and processing a large number of past sermons.
                            </p>
                        </div>
                        <Switch />
                    </div>
                </CardContent>
            </Card>

             <div className="flex justify-end">
                <Button>Save All Settings</Button>
            </div>
        </div>
    );
}
