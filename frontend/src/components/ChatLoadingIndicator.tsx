
import React from "react";
import { Bot } from "lucide-react";

const ChatLoadingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-100 rounded-lg p-3 text-gray-500 flex items-center">
        <Bot className="w-5 h-5 mr-2" />
        <div className="flex space-x-1">
          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  );
};

export default ChatLoadingIndicator;
