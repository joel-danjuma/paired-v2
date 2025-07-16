
import React from "react";
import { Bot, User } from "lucide-react";
import { ChatMessage as ChatMessageType } from "@/types/chat";

type ChatMessageProps = {
  message: ChatMessageType;
};

const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div
      className={`flex ${
        message.sender === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex max-w-[80%] rounded-lg p-3 ${
          message.sender === "user"
            ? "bg-paired-100 text-gray-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        <div className="flex-shrink-0 mr-2">
          {message.sender === "user" ? (
            <User className="w-5 h-5" />
          ) : (
            <Bot className="w-5 h-5" />
          )}
        </div>
        <p className="text-sm">{message.content}</p>
      </div>
      {message.tool_outputs && message.tool_outputs.length > 0 && (
        <div className="mt-2 w-full">
          {message.tool_outputs.map((output: any, index: number) => (
            <div key={index} className="p-2 my-1 text-xs bg-gray-50 rounded-lg">
              <p className="font-semibold">Tool Output:</p>
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(output, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
