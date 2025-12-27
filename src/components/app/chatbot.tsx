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
import { Bot, Loader2, MessageSquare, Search, Settings, Upload, User, X } from 'lucide-react';
import { getChatbotResponse, type AskChatbotOutput } from '@/app/actions';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import type { FindScholarshipsOutput } from '@/ai/flows/find-scholarships';
import type { CheckEligibilityOutput } from '@/ai/flows/check-eligibility';
import ScholarshipCard from './scholarship-card';
import SchemeCard from './scheme-card';
import { Separator } from '../ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

type Message = {
  role: 'user' | 'model' | 'tool';
  content: string | any; // Can be string or tool response
};

const renderToolResponse = (response: AskChatbotOutput['toolResponse']) => {
  if (!response) return null;
  
  if ('scholarships' in response) {
    const scholarshipResponse = response as FindScholarshipsOutput;
    return (
      <div className="space-y-4">
        {scholarshipResponse.finalAdvice && (
          <p className="text-sm p-3 bg-primary/10 rounded-md">
            <ReactMarkdown>{scholarshipResponse.finalAdvice}</ReactMarkdown>
          </p>
        )}
        {scholarshipResponse.scholarships.map((scholarship, index) => (
          <ScholarshipCard key={index} scholarship={scholarship} />
        ))}
      </div>
    );
  }

  if ('schemes' in response) {
    const schemeResponse = response as CheckEligibilityOutput;
    return (
      <div className="space-y-4">
        {schemeResponse.finalAdvice && (
          <p className="text-sm p-3 bg-primary/10 rounded-md">
            <ReactMarkdown>{schemeResponse.finalAdvice}</ReactMarkdown>
          </p>
        )}
        {schemeResponse.schemes.map((scheme, index) => (
          <SchemeCard key={index} scheme={scheme} />
        ))}
      </div>
    );
  }
  
  return null;
}


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
    const newMessages: Message[] = [...messages, userMessage];
  
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
  
    // Give a small delay for the user message to render before scrolling
    setTimeout(scrollToBottom, 100);
  
    const chatbotResponse = await getChatbotResponse({
      query: input,
      history: newMessages.slice(0, -1).map(m => ({
          ...m,
          // Stringify tool content for history
          content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
      })),
    });
      
    setIsLoading(false);

    let finalMessages = [...newMessages];
  
    if (chatbotResponse.error) {
      const errorMessage: Message = { role: 'model', content: chatbotResponse.error };
      finalMessages.push(errorMessage);
    } else {
        if(chatbotResponse.response) {
            const modelMessage: Message = { role: 'model', content: chatbotResponse.response };
            finalMessages.push(modelMessage);
        }
        if (chatbotResponse.toolResponse) {
            const toolMessage: Message = { role: 'tool', content: chatbotResponse.toolResponse };
            finalMessages.push(toolMessage);
        }
    }
    setMessages(finalMessages);

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
            className="fixed bottom-24 right-4 z-50 w-[90vw] max-w-lg"
          >
            <Card className="shadow-2xl border-2 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bot className="h-7 w-7 text-primary" />
                  <div>
                    <CardTitle>AI Assistant</CardTitle>
                    <CardDescription>Your guide to schemes & scholarships</CardDescription>
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
              <CardContent className="h-[500px] flex flex-col p-0">
                <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
                    {messages.length === 0 && !isLoading ? (
                         <div className="flex flex-col items-center justify-center h-full text-center">
                            <Bot className="h-16 w-16 text-muted-foreground/50" />
                            <h3 className="text-xl font-semibold mt-4">How can I help you today?</h3>
                            <p className='text-muted-foreground mt-1'>Ask me anything about Indian government schemes or student scholarships.</p>
                         </div>
                    ) : (
                        <div className="space-y-6 py-4">
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
                                {message.role !== 'user' && (
                                <Avatar className="h-8 w-8 flex-shrink-0 border">
                                    <AvatarFallback className='bg-primary/10'>
                                    <Bot className="h-5 w-5 text-primary" />
                                    </AvatarFallback>
                                </Avatar>
                                )}
                                <div
                                className={cn(
                                    'rounded-lg p-3 text-sm max-w-[85%] shadow-sm',
                                    message.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                )}
                                >
                                {message.role === 'tool' ? (
                                    renderToolResponse(message.content)
                                ) : (
                                    <div className="prose prose-sm max-w-none prose-p:my-2 text-foreground">
                                        <ReactMarkdown>{message.content}</ReactMarkdown>
                                    </div>
                                )}
                                </div>
                                {message.role === 'user' && (
                                <Avatar className="h-8 w-8 flex-shrink-0 border">
                                    <AvatarFallback>
                                    <User className="h-5 w-5" />
                                    </AvatarFallback>
                                </Avatar>
                                )}
                            </div>
                            ))}
                            {isLoading && (
                            <div className="flex items-start gap-3 justify-start">
                                <Avatar className="h-8 w-8 border">
                                <AvatarFallback className='bg-primary/10'>
                                    <Bot className="h-5 w-5 text-primary" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="rounded-lg p-3 text-sm bg-muted flex items-center shadow-sm">
                                    <Loader2 className="h-5 w-5 animate-spin text-primary"/>
                                </div>
                            </div>
                            )}
                        </div>
                    )}
                </ScrollArea>
                <div className="p-4 border-t bg-muted/50">
                    <form onSubmit={handleSend} className="relative">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Message..."
                        disabled={isLoading}
                        className="flex-1 pr-12 h-12"
                      />
                      <Button type="submit" size="icon" disabled={isLoading} className='absolute right-2 top-1/2 -translate-y-1/2'>
                        <Search className="h-5 w-5" />
                      </Button>
                    </form>
                    <div className='flex items-center justify-between mt-2'>
                        <div className='flex items-center gap-1'>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant='ghost' size='icon' disabled={isLoading}><Upload className='h-5 w-5'/></Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Upload File (coming soon)</p></TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant='ghost' size='icon' disabled={isLoading}><Settings className='h-5 w-5'/></Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Settings (coming soon)</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <p className='text-xs text-muted-foreground'>AI can make mistakes. Verify important info.</p>
                    </div>
                </div>
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

    