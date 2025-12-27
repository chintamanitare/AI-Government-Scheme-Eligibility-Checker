'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bot, Loader2, MessageSquare, Send, User, X } from 'lucide-react';
import { getChatbotResponse } from '@/app/actions';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      const scrollViewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }, 0);
  };
  

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Give a small delay for the user message to render before scrolling
    setTimeout(scrollToBottom, 100);

    const chatbotResponse = await getChatbotResponse({
      query: input,
      history: messages,
    });
    
    setIsLoading(false);

    if (chatbotResponse.error) {
      const errorMessage: Message = { role: 'model', content: chatbotResponse.error };
      setMessages((prev) => [...prev, errorMessage]);
    } else {
      const modelMessage: Message = { role: 'model', content: chatbotResponse.response };
      setMessages((prev) => [...prev, modelMessage]);
    }
     // Give a small delay for the model message to render before scrolling
    setTimeout(scrollToBottom, 100);
  };
  
  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-24 right-4 z-50 w-[90vw] max-w-md"
          >
            <Card className="shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bot className="h-7 w-7 text-primary" />
                  <div>
                    <CardTitle>AI Assistant</CardTitle>
                    <CardDescription>Ask me about schemes</CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="h-[400px] flex flex-col">
                <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={cn(
                          'flex items-start gap-3',
                          message.role === 'user'
                            ? 'justify-end'
                            : 'justify-start'
                        )}
                      >
                        {message.role === 'model' && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              <Bot className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={cn(
                            'rounded-lg p-3 text-sm max-w-[80%]',
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          )}
                        >
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        </div>
                         {message.role === 'user' && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                     {isLoading && (
                      <div className="flex items-start gap-3 justify-start">
                        <Avatar className="h-8 w-8">
                           <AvatarFallback>
                              <Bot className="h-5 w-5" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg p-3 text-sm bg-muted flex items-center">
                            <Loader2 className="h-5 w-5 animate-spin"/>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <form onSubmit={handleSend} className="mt-4 flex items-center gap-2 border-t pt-4">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={isLoading}>
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="lg"
        className="fixed bottom-4 right-4 rounded-full h-16 w-16 shadow-lg z-40"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-7 w-7" /> : <MessageSquare className="h-7 w-7" />}
        <span className="sr-only">Toggle Chatbot</span>
      </Button>
    </>
  );
}
