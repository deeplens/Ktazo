'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { ragChatbotCompanion, RagChatbotCompanionInput } from '@/ai/flows/rag-chatbot-companion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Loader2, Bot, User, BrainCircuit, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

export function ChatbotPanel() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your Ktazo Companion. How can I help you explore this week's sermon?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !user) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
        const chatInput: RagChatbotCompanionInput = {
            query: currentInput,
            tenantId: user.tenantId,
            userId: user.id,
            conversationHistory: messages.map(({ role, content }) => ({ role, content })),
        };
        const result = await ragChatbotCompanion(chatInput);

        const assistantMessage: Message = {
            role: 'assistant',
            content: result.response,
            sources: result.sources.length > 0 ? result.sources : undefined,
        };
        setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
        console.error("Chatbot error:", error);
        const errorMessage: Message = {
            role: 'assistant',
            content: "I'm sorry, I encountered an error. Please try again.",
        };
        setMessages((prev) => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <ScrollArea className="flex-1 p-4 min-h-0">
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-4',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-9 w-9 border-2 border-primary/50">
                  <AvatarFallback className='bg-primary/10'><Bot className="text-primary"/></AvatarFallback>
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
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-4 border-t pt-2">
                     <h4 className="text-xs font-semibold mb-2 flex items-center gap-2"><BrainCircuit className="h-3 w-3"/> Sources</h4>
                     <ul className="space-y-1">
                        {message.sources.map((source, i) => (
                            <li key={i} className="text-xs flex items-start gap-2 text-muted-foreground">
                                <FileText className="h-3 w-3 mt-0.5 shrink-0"/>
                                <span className="truncate">{source}</span>
                            </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
              {message.role === 'user' && user && (
                 <Avatar className="h-9 w-9">
                    <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} alt="User" />
                    <AvatarFallback><User /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-4 justify-start">
                <Avatar className="h-9 w-9 border-2 border-primary/50">
                  <AvatarFallback className='bg-primary/10'><Bot className="text-primary"/></AvatarFallback>
                </Avatar>
                <div className="bg-card border rounded-lg p-3 shadow-sm">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="p-4 bg-background border-t">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">
            The Ktazo Companion answers questions based on your church's sermons and approved resources.
        </p>
      </div>
    </div>
  );
}
