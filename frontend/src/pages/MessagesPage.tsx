
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatWindow from '@/components/ChatWindow';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

const MessagesPage = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id?: string }>();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1 flex flex-col">
        {user ? (
          <div className="flex-1 flex flex-col">
            <ChatWindow />
          </div>
        ) : (
          <div className="flex items-center justify-center flex-1 py-8 px-4">
            <div className="text-center max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-sm w-full">
              <div className="mx-auto w-16 h-16 rounded-full bg-paired-100 flex items-center justify-center mb-6">
                <MessageSquare className="h-8 w-8 text-paired-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Sign in to access messages</h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                You need to be logged in to view and send messages to potential roommates.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild className="bg-paired-400 hover:bg-paired-500 flex-1">
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default MessagesPage;
