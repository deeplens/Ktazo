import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { LifeBuoy, Mail } from "lucide-react";

export default function HelpPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2"><LifeBuoy /> Help Center</h1>
                <p className="text-muted-foreground">Find answers to common questions and learn how to use Ktazo.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>How do I upload a new sermon?</AccordionTrigger>
                            <AccordionContent>
                                From the main dashboard or the Sermons page, click the "Upload Sermon" button. You'll be prompted to select an MP3 file from your computer. Once uploaded, it will appear in your sermon list with a "Draft" status.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>How does the AI content generation work?</AccordionTrigger>
                            <AccordionContent>
                                After a sermon has been transcribed and you've reviewed the text, you can click the "Generate Weekly Content" button. Our AI will read the transcript and create summaries, daily devotionals, reflection questions, and games based on its content. This generated content will then be available for your review and approval.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Can I edit the generated content?</AccordionTrigger>
                            <AccordionContent>
                                Yes. All AI-generated content is presented to you as a draft. You have full control to edit, add, or remove any content before it is approved and published to your members.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>What is the RAG Chatbot Companion?</AccordionTrigger>
                            <AccordionContent>
                                The RAG (Retrieval-Augmented Generation) chatbot is an AI assistant that members can interact with. It is designed to answer questions strictly based on the content of your church's sermon library and any custom URLs you provide in the settings. It will politely refuse to answer questions outside this scope to ensure doctrinal alignment.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Contact Support</CardTitle>
                    <CardDescription>
                        Can't find the answer you're looking for? Found a bug? Let us know.
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
