
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import ChatMessage from "./ChatMessage";
import ChatLoadingIndicator from "./ChatLoadingIndicator";
import ChatInputForm from "./ChatInputForm";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [agentAvailable, setAgentAvailable] = useState<boolean | null>(null);
  const { toast } = useToast();
  const { token } = useAuth();

  // Check AI agent health on component mount
  useEffect(() => {
    const checkAgentHealth = async () => {
      if (!token) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/agent/health`);
        const data = await response.json();
        setAgentAvailable(data.available);
        
        if (!data.available) {
          setMessages(prev => [...prev, {
            id: "error",
            content: "⚠️ AI assistant is currently unavailable. " + (data.message || "Please try again later."),
            sender: "ai",
            timestamp: new Date(),
          }]);
        }
      } catch (error) {
        setAgentAvailable(false);
        setMessages(prev => [...prev, {
          id: "error",
          content: "⚠️ Unable to connect to AI assistant. Please check your connection and try again.",
          sender: "ai", 
          timestamp: new Date(),
        }]);
      }
    };

    checkAgentHealth();
  }, [token]);

  const handleSendMessage = async (message: string) => {
    // Check if agent is available
    if (agentAvailable === false) {
      toast({
        title: "AI Assistant Unavailable",
        description: "The AI assistant is currently not available. Please try again later.",
        variant: "destructive",
      });
      return;
    }

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
      const response = await fetch(`${API_BASE_URL}/agent/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          message: message,
          conversation_id: conversationId 
        }),
      });

      if (!response.ok) {
        // Handle specific error status codes
        if (response.status === 500) {
          throw new Error('AI assistant is temporarily unavailable');
        } else if (response.status === 401) {
          throw new Error('Please log in to use the AI assistant');
        } else {
          throw new Error('Failed to get response from AI assistant');
        }
      }

      const data = await response.json();
      
      const aiResponse: ChatMessageType = {
        id: `ai-${Date.now()}`,
        content: data.response,
        sender: "ai",
        timestamp: new Date(),
        tool_outputs: data.tool_outputs,
      };
      
      setMessages((prev) => [...prev, aiResponse]);

      if (!conversationId && data.conversation_id) {
        setConversationId(data.conversation_id);
      }

    } catch (error) {
      console.error('AI Chat error:', error);
      
      // Add error message to chat
      const errorMessage: ChatMessageType = {
        id: `error-${Date.now()}`,
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error occurred'}. Please try again.`,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      
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
          <Bot className="w-5 h-5 mr-2" /> 
          Roommate Matching Assistant
          {agentAvailable === false && (
            <AlertCircle className="w-4 h-4 ml-2 text-orange-500" />
          )}
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
        <ChatInputForm 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading || agentAvailable === false}
          disabled={agentAvailable === false}
        />
      </CardFooter>
    </Card>
  );
};

export default RoommateAIChat;
