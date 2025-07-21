import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Search, User, MessageSquare, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

interface UserSearchResult {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_image_url?: string;
  user_type: string;
  profile_completion_score: number;
}

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserSearchModal = ({ isOpen, onClose }: UserSearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isStartingConversation, setIsStartingConversation] = useState<string | null>(null);
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Debounced search effect
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      await performSearch(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, token]);

  const performSearch = async (query: string) => {
    if (!token || !query.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/search?query=${encodeURIComponent(query)}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const users = await response.json();
        setSearchResults(users);
      } else {
        console.error('Search failed:', response.status);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const startConversation = async (userId: string) => {
    if (!token) return;

    setIsStartingConversation(userId);
    try {
      // First, try to start a conversation with the user
      const response = await fetch(`${API_BASE_URL}/conversations/start/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const conversation = await response.json();
        toast({
          title: "Conversation started!",
          description: "You can now chat with this user.",
        });
        
        // Navigate to the messages page with the conversation
        navigate(`/messages/${userId}`);
        onClose();
      } else {
        throw new Error('Failed to start conversation');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsStartingConversation(null);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Start New Conversation
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          {/* Search Results */}
          <div className="max-h-80 overflow-y-auto space-y-2">
            {isSearching && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-gray-500">Searching...</span>
              </div>
            )}

            {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No users found</p>
                <p className="text-xs">Try searching with a different name or email</p>
              </div>
            )}

            {searchResults.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <Avatar className="h-10 w-10">
                  {user.profile_image_url ? (
                    <img 
                      src={user.profile_image_url} 
                      alt={`${user.first_name}'s profile`}
                      className="object-cover"
                    />
                  ) : (
                    <div className="bg-paired-100 h-full w-full flex items-center justify-center">
                      <User className="h-5 w-5 text-paired-400" />
                    </div>
                  )}
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {user.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full capitalize">
                      {user.user_type}
                    </span>
                    <span className="text-xs text-gray-400">
                      {user.profile_completion_score}% complete
                    </span>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => startConversation(user.id)}
                  disabled={isStartingConversation === user.id}
                  className="shrink-0"
                >
                  {isStartingConversation === user.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>

          {searchQuery.length < 2 && (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Start typing to search for users</p>
              <p className="text-xs">You can search by name or email</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserSearchModal; 