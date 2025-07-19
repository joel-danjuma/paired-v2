
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

type ChatInputFormProps = {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
};

const ChatInputForm = ({ onSendMessage, isLoading, disabled = false }: ChatInputFormProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || disabled) return;
    
    onSendMessage(query);
    setQuery("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={disabled ? "AI assistant unavailable..." : "Describe your ideal roommate..."}
        className="flex-1 mr-2"
        disabled={isLoading || disabled}
      />
      <Button type="submit" disabled={isLoading || disabled || !query.trim()} size="icon">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default ChatInputForm;
