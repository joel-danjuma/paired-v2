
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

type ChatInputFormProps = {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
};

const ChatInputForm = ({ onSendMessage, isLoading }: ChatInputFormProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    onSendMessage(query);
    setQuery("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Describe your ideal roommate..."
        className="flex-1 mr-2"
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading} size="icon">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default ChatInputForm;
