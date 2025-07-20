
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Send, ArrowLeft, MessageSquare, User } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string; // Date string from backend
  unread?: number;
};

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string; // Date string from backend
};

const ChatWindow = () => {
  const { user, token } = useAuth();
  const { contactId } = useParams<{ contactId?: string }>();
  const [newMessage, setNewMessage] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch contacts when component mounts
  useEffect(() => {
    const fetchContacts = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/conversations`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const contactsData = await response.json();
          setContacts(contactsData);
          
          // Set active contact if contactId is provided
          if (contactId) {
            const contact = contactsData.find((c: Contact) => c.id === contactId);
            if (contact) {
              setActiveContact(contact);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch contacts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, [token, contactId]);

  // Fetch messages when active contact changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeContact || !token) {
        setMessages([]);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/conversations/${activeContact.id}/messages`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const messagesData = await response.json();
          setMessages(messagesData);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    fetchMessages();
  }, [activeContact, token]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeContact || !token) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${activeContact.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          message_type: 'text'
        })
      });

      if (response.ok) {
        const newMessageData = await response.json();
        setMessages(prev => [...prev, newMessageData]);
        setNewMessage('');
        toast.success('Message sent!');
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-0 h-[calc(100vh-8rem)] md:h-[calc(100vh-16rem)]">
      {/* Contacts Sidebar */}
      <div className="hidden md:block md:col-span-1 lg:col-span-1 bg-white border-r">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Messages</h2>
        </div>
        <ScrollArea className="h-[calc(100vh-12rem)] md:h-[calc(100vh-20rem)]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading conversations...</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">No conversations yet. Start a new one!</p>
              <Link to="/messages">
                <Button className="mt-4 bg-paired-400 hover:bg-paired-500">
                  New Conversation
                </Button>
              </Link>
            </div>
          ) : (
            contacts.map(contact => (
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
                        {formatTime(new Date(contact.lastMessageTime))}
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
            ))
          )}
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
            <ScrollArea className="flex-1 p-4 h-[calc(100vh-16rem)] md:h-auto">
              <div className="space-y-4">
                {messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                                              className={`max-w-[70%] p-3 rounded-lg ${
                          message.sender_id === user?.id
                            ? 'bg-paired-400 text-white' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      <div 
                        className={`text-xs mt-1 ${
                          message.sender_id === user?.id ? 'text-paired-100' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(new Date(message.created_at))}
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
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p>Loading conversations...</p>
                </div>
              ) : contacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">No conversations yet. Start a new one!</p>
                  <Link to="/messages">
                    <Button className="mt-4 bg-paired-400 hover:bg-paired-500">
                      New Conversation
                    </Button>
                  </Link>
                </div>
              ) : (
                contacts.map(contact => (
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
                            {formatTime(new Date(contact.lastMessageTime))}
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
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
