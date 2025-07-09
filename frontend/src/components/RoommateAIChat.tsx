
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import ChatMessage from "./ChatMessage";
import ChatLoadingIndicator from "./ChatLoadingIndicator";
import ChatInputForm from "./ChatInputForm";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const RoommateAIChat = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: "welcome",
      content:
        "Hi there! I'm your Roommate Matching Assistant. Describe your ideal roommate or living situation, and I'll help you find compatible matches!",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const { toast } = useToast();
  const { token } = useAuth();

  const handleSendMessage = async (message: string) => {
    // Add user message
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      content: message,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const endpoint = threadId ? `/agent/query/${threadId}` : '/agent/query';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: message }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI agent');
      }

      const data = await response.json();
      
      const aiResponse: ChatMessageType = {
        id: `ai-${Date.now()}`,
        content: data.response_text,
        sender: "ai",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiResponse]);

      if (!threadId && data.thread_id) {
        setThreadId(data.thread_id);
      }
      
      toast({
        title: "AI Response Received",
        description: "The AI agent has responded to your query.",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-paired-200">
      <CardHeader className="bg-paired-50">
        <CardTitle className="flex items-center text-paired-700">
          <Bot className="w-5 h-5 mr-2" /> Roommate Matching Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 h-[300px] overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && <ChatLoadingIndicator />}
        </div>
      </CardContent>
      <CardFooter className="border-t p-3 bg-gray-50">
        <ChatInputForm onSendMessage={handleSendMessage} isLoading={isLoading} />
      </CardFooter>
    </Card>
  );
};

export default RoommateAIChat;
