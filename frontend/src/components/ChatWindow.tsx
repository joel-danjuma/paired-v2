
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MessageSquare, Send, User } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type Message = {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  read: boolean;
};

type Contact = {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unread?: number;
};

// Mock data - replace with actual data fetching
const MOCK_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    avatar: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=150&h=150&fit=crop',
    lastMessage: 'Hey, is the room still available?',
    lastMessageTime: new Date('2023-06-01T10:30:00'),
    unread: 2,
  },
  {
    id: '2',
    name: 'Jamie Smith',
    avatar: 'https://images.unsplash.com/photo-1517022812141-23620dba5c23?w=150&h=150&fit=crop',
    lastMessage: 'When can I come see the place?',
    lastMessageTime: new Date('2023-06-01T09:15:00'),
  },
  {
    id: '3',
    name: 'Taylor Wong',
    lastMessage: 'Thanks for the information!',
    lastMessageTime: new Date('2023-05-31T18:45:00'),
  },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  '1': [
    {
      id: '1-1',
      senderId: '1',
      content: 'Hi there! I saw your listing for the apartment and I\'m very interested.',
      timestamp: new Date('2023-06-01T10:15:00'),
      read: true,
    },
    {
      id: '1-2',
      senderId: 'current-user',
      content: 'Hello! Thanks for reaching out. The apartment is still available. Would you like to know more about it?',
      timestamp: new Date('2023-06-01T10:20:00'),
      read: true,
    },
    {
      id: '1-3',
      senderId: '1',
      content: 'Yes, please! Is the room furnished? And are utilities included in the rent?',
      timestamp: new Date('2023-06-01T10:25:00'),
      read: true,
    },
    {
      id: '1-4',
      senderId: '1',
      content: 'Also, is the place close to public transportation?',
      timestamp: new Date('2023-06-01T10:30:00'),
      read: false,
    },
  ],
  '2': [
    {
      id: '2-1',
      senderId: '2',
      content: 'Hello! I\'m interested in the room you posted.',
      timestamp: new Date('2023-06-01T09:00:00'),
      read: true,
    },
    {
      id: '2-2',
      senderId: 'current-user',
      content: 'Hi! The room is still available. Would you like to schedule a viewing?',
      timestamp: new Date('2023-06-01T09:05:00'),
      read: true,
    },
    {
      id: '2-3',
      senderId: '2',
      content: 'That would be great! When would be a good time?',
      timestamp: new Date('2023-06-01T09:10:00'),
      read: true,
    },
    {
      id: '2-4',
      senderId: 'current-user',
      content: 'How about this weekend? Saturday afternoon works for me.',
      timestamp: new Date('2023-06-01T09:15:00'),
      read: true,
    },
  ],
  '3': [
    {
      id: '3-1',
      senderId: '3',
      content: 'Hi, I saw your post for a roommate. Is it still available?',
      timestamp: new Date('2023-05-31T18:30:00'),
      read: true,
    },
    {
      id: '3-2',
      senderId: 'current-user',
      content: 'Yes, it is! Are you looking for a place immediately?',
      timestamp: new Date('2023-05-31T18:35:00'),
      read: true,
    },
    {
      id: '3-3',
      senderId: '3',
      content: 'I\'m looking to move in by the end of next month if possible.',
      timestamp: new Date('2023-05-31T18:40:00'),
      read: true,
    },
    {
      id: '3-4',
      senderId: 'current-user',
      content: 'That works perfectly with my timeline. Let me send you some more information about the place and the neighborhood.',
      timestamp: new Date('2023-05-31T18:45:00'),
      read: true,
    },
  ],
};

const ChatWindow = () => {
  const { user } = useAuth();
  const { contactId } = useParams<{ contactId?: string }>();
  const [newMessage, setNewMessage] = useState('');
  const [activeContact, setActiveContact] = useState<Contact | null>(
    contactId ? MOCK_CONTACTS.find(c => c.id === contactId) || null : null
  );
  
  const messages = activeContact ? MOCK_MESSAGES[activeContact.id] || [] : [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeContact) return;
    
    // In a real app, you would send this to your backend
    toast.success('Message sent!');
    setNewMessage('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-0 h-full">
      {/* Contacts Sidebar */}
      <div className="hidden md:block md:col-span-1 lg:col-span-1 bg-white border-r">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Messages</h2>
        </div>
        <ScrollArea className="h-[calc(100vh-20rem)]">
          {MOCK_CONTACTS.map(contact => (
            <div 
              key={contact.id}
              className={`p-3 flex items-center gap-3 hover:bg-gray-50 cursor-pointer border-b ${
                activeContact?.id === contact.id ? 'bg-paired-50' : ''
              }`}
              onClick={() => setActiveContact(contact)}
            >
              <Avatar className="h-12 w-12">
                {contact.avatar ? (
                  <img 
                    src={contact.avatar} 
                    alt={contact.name}
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-paired-100 h-full w-full flex items-center justify-center">
                    <User className="h-6 w-6 text-paired-400" />
                  </div>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="font-medium truncate">{contact.name}</p>
                  {contact.lastMessageTime && (
                    <span className="text-xs text-gray-500">
                      {formatTime(contact.lastMessageTime)}
                    </span>
                  )}
                </div>
                {contact.lastMessage && (
                  <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
                )}
              </div>
              {contact.unread && (
                <div className="min-w-6 h-6 rounded-full bg-paired-400 text-white text-xs flex items-center justify-center">
                  {contact.unread}
                </div>
              )}
            </div>
          ))}
        </ScrollArea>
      </div>
      
      {/* Chat Area / Empty State */}
      <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col bg-white">
        {activeContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                className="md:hidden"
                asChild
              >
                <Link to="/messages">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <Avatar className="h-10 w-10">
                {activeContact.avatar ? (
                  <img 
                    src={activeContact.avatar} 
                    alt={activeContact.name}
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-paired-100 h-full w-full flex items-center justify-center">
                    <User className="h-5 w-5 text-paired-400" />
                  </div>
                )}
              </Avatar>
              <div>
                <h3 className="font-medium">{activeContact.name}</h3>
              </div>
            </div>
            
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.senderId === 'current-user' 
                          ? 'bg-paired-400 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      <div 
                        className={`text-xs mt-1 ${
                          message.senderId === 'current-user' ? 'text-paired-100' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {/* Message Input */}
            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  className="bg-paired-400 hover:bg-paired-500"
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </form>
            </div>
          </>
        ) : (
          // Empty State for Mobile
          <div className="flex flex-col items-center justify-center h-full p-4 bg-gray-50 md:bg-white">
            <div className="w-16 h-16 rounded-full bg-paired-100 flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-paired-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your Messages</h2>
            <p className="text-gray-600 text-center max-w-xs mb-6">
              Select a conversation or start a new one to begin messaging with potential roommates.
            </p>
            <div className="md:hidden w-full">
              <Separator className="my-6" />
              {MOCK_CONTACTS.map(contact => (
                <Link 
                  key={contact.id}
                  to={`/messages/${contact.id}`}
                  className="p-3 flex items-center gap-3 hover:bg-gray-100 border-b"
                >
                  <Avatar className="h-12 w-12">
                    {contact.avatar ? (
                      <img 
                        src={contact.avatar} 
                        alt={contact.name}
                        className="object-cover"
                      />
                    ) : (
                      <div className="bg-paired-100 h-full w-full flex items-center justify-center">
                        <User className="h-6 w-6 text-paired-400" />
                      </div>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-medium truncate">{contact.name}</p>
                      {contact.lastMessageTime && (
                        <span className="text-xs text-gray-500">
                          {formatTime(contact.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    {contact.lastMessage && (
                      <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
                    )}
                  </div>
                  {contact.unread && (
                    <div className="min-w-6 h-6 rounded-full bg-paired-400 text-white text-xs flex items-center justify-center">
                      {contact.unread}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
