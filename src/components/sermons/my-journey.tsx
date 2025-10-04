
'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { ragChatbotCompanion, RagChatbotCompanionInput } from '@/ai/flows/rag-chatbot-companion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { JourneyQuestion } from '@/lib/types';
import { Rocket, Lightbulb, UserCheck, Bot, Send, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';

interface MyJourneyProps {
  questions: JourneyQuestion[];
  sermonTitle: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const categoryIcons = {
  Mission: <Rocket className="h-5 w-5" />,
  Vision: <Lightbulb className="h-5 w-5" />,
  Purpose: <UserCheck className="h-5 w-5" />,
};

export function MyJourney({ questions, sermonTitle }: MyJourneyProps) {
  const { user } = useAuth();
  const [reflections, setReflections] = useState<Record<string, string>>({});
  const [activeQuestion, setActiveQuestion] = useState<JourneyQuestion | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  const handleReflectionChange = (question: string, value: string) => {
    setReflections(prev => ({ ...prev, [question]: value }));
  };

  const startChat = (question: JourneyQuestion) => {
    setActiveQuestion(question);
    const userReflection = reflections[question.question] || "I haven't written anything yet, but I'd like to talk about this.";
    setChatMessages([
      {
        role: 'assistant',
        content: `Let's talk about that. Here's the question again for context:\n\n*"${question.question}"*\n\nAnd here's what you wrote:\n*"${userReflection}"*\n\nWhat's on your mind? How can I help you think through this?`,
      },
    ]);
  };

  const handleChatSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoadingChat || !user || !activeQuestion) return;

    const userMessage: ChatMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput('');
    setIsLoadingChat(true);

    try {
      // Re-using the RAG flow but with a different system prompt/context
      const chatInputPayload: RagChatbotCompanionInput = {
        query: `The user's response is: "${currentInput}"`,
        tenantId: user.tenantId,
        userId: user.id,
        conversationHistory: [
          { role: 'assistant', content: `You are an AI Mentor. A user is reflecting on the question: "${activeQuestion.question}" in the context of the sermon "${sermonTitle}". Their initial reflection was: "${reflections[activeQuestion.question] || '(not provided)'}". Your role is to be an encouraging and challenging advisor. Ask clarifying questions, help them explore their thoughts, and gently push them to consider how to apply their reflections. Do not give simple answers. Act as an accountability partner. Be relatable to Gen Z.` },
          ...chatMessages,
          userMessage,
        ],
      };

      // We use ragChatbotCompanion but the real magic is the prompt engineering above
      const result = await ragChatbotCompanion(chatInputPayload);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: result.response,
      };
      setChatMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error("AI Mentor error:", error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">My Journey</CardTitle>
        <CardDescription>A private space to reflect on your mission, vision, and purpose. Your responses are only visible to you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((q, index) => (
          <div key={index} className="p-4 border rounded-lg bg-background">
            <h3 className="font-semibold flex items-center gap-2 mb-2 text-md">
              {categoryIcons[q.category]} {q.category}: {q.question}
            </h3>
            <Textarea
              placeholder="Your private reflection..."
              rows={5}
              value={reflections[q.question] || ''}
              onChange={(e) => handleReflectionChange(q.question, e.target.value)}
              className="bg-white dark:bg-zinc-900"
            />
            <div className="text-right mt-2">
              <Dialog onOpenChange={(open) => !open && setActiveQuestion(null)}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => startChat(q)}>
                    <Bot className="mr-2 h-4 w-4" />
                    Chat with your AI Mentor
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
                    <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Bot /> AI Mentor</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 flex flex-col min-h-0">
                    <ScrollArea className="flex-1 p-4 pr-6 -mx-4">
                        <div className="space-y-4">
                        {chatMessages.map((message, index) => (
                            <div
                            key={index}
                            className={cn(
                                'flex items-start gap-4',
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                            )}
                            >
                            {message.role === 'assistant' && (
                                <Avatar className="h-9 w-9 border-2 border-primary/50">
                                <AvatarFallback className="bg-primary/10"><Bot className="text-primary" /></AvatarFallback>
                                </Avatar>
                            )}
                            <div
                                className={cn(
                                'max-w-md rounded-lg p-3 text-sm shadow-sm',
                                message.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-card border'
                                )}
                            >
                                <p className="whitespace-pre-wrap">{message.content}</p>
                            </div>
                            {message.role === 'user' && user && (
                                <Avatar className="h-9 w-9">
                                <AvatarImage src={user.photoUrl || `https://avatar.vercel.sh/${user.email}.png`} alt="User" />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            )}
                            </div>
                        ))}
                        {isLoadingChat && (
                            <div className="flex items-start gap-4 justify-start">
                                <Avatar className="h-9 w-9 border-2 border-primary/50">
                                    <AvatarFallback className='bg-primary/10'><Bot className="text-primary"/></AvatarFallback>
                                </Avatar>
                                <div className="bg-card border rounded-lg p-3 shadow-sm">
                                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                </div>
                            </div>
                        )}
                        </div>
                    </ScrollArea>
                    <form onSubmit={handleChatSubmit} className="flex items-center gap-2 pt-4 border-t">
                        <Input
                        placeholder="Ask a question or share a thought..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        disabled={isLoadingChat}
                        className="flex-1"
                        />
                        <Button type="submit" disabled={isLoadingChat || !chatInput.trim()} size="icon">
                        <Send className="h-4 w-4" />
                        </Button>
                    </form>
                    </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
