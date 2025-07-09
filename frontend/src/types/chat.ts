
export type ChatMessage = {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
};
