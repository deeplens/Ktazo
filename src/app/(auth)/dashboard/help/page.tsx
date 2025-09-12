
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { LifeBuoy, Mail, Heart, MessageCircleQuestion, Gamepad2, BrainCircuit } from "lucide-react";

export default function HelpPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2"><LifeBuoy /> Welcome to the Help Center</h1>
                <p className="text-muted-foreground">Discover how to make the most of Ktazo Weekly on your faith journey.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Heart /> A Tool for Growth</CardTitle>
                    <CardDescription>
                        Ktazo is designed to help you connect more deeply with the weekly sermon and apply its teachings to your daily life. Think of it as a bridge between Sunday and Monday.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>How do I use the Daily Devotionals?</AccordionTrigger>
                            <AccordionContent>
                                Each day, you'll find a new devotional based on the past weekend's sermon. Use these as a starting point for your quiet time. Read the passage, ponder the thoughts, and allow God to speak to you. The goal is to carry the sermon's message with you throughout the week.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger className="flex items-center gap-2"><MessageCircleQuestion />What are Reflection Questions for?</AccordionTrigger>
                            <AccordionContent>
                                These questions are prompts for deeper thought and prayer. You can use them for personal journaling, as conversation starters with your family, or for discussion in your small group. Answering them helps you internalize the sermon's key themes.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger className="flex items-center gap-2"><Gamepad2 />How do the Interactive Games work?</AccordionTrigger>
                            <AccordionContent>
                                The games are a fun, lighthearted way to reinforce the sermon's concepts. By playing, you'll engage with the material in a new way, helping you remember key verses, terms, and ideas. It's learning made enjoyable!
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger className="flex items-center gap-2"><BrainCircuit />What is the Ktazo Companion chatbot?</AccordionTrigger>
                            <AccordionContent>
                                The Ktazo Companion is your personal AI assistant for exploring sermon content. You can ask it questions about the sermon, request summaries of key points, or explore related topics. It is designed to only use your church's approved materials, ensuring that the answers are doctrinally sound and relevant to what you're learning as a congregation.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Contact Support</CardTitle>
                    <CardDescription>
                        Can't find the answer you're looking for, or did you encounter an issue? We're here to help.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <a href="mailto:help@ktazo.com">
                            <Mail className="mr-2 h-4 w-4" /> Report an Issue or Ask a Question
                        </a>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
