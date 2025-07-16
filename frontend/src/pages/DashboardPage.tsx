import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, User, MessageSquare, List, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome, {user?.first_name || user?.name?.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">Here's your dashboard.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2" />
                My Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Keep your profile up to date to attract the best roommates.
              </p>
              <Link to="/profile">
                <Button variant="outline">View Profile</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Listings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <List className="mr-2" />
                My Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage your room or roommate listings.
              </p>
              <div className="flex space-x-2">
                <Link to="/my-listings">
                  <Button variant="outline">View Listings</Button>
                </Link>
                <Link to="/create-listing">
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Listing
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Messages Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                You have 0 unread messages.
              </p>
              <Link to="/messages">
                <Button variant="outline">View Messages</Button>
              </Link>
            </CardContent>
          </Card>
          
          {/* Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage your account and notification settings.
              </p>
              <Link to="/settings">
                <Button variant="outline">Go to Settings</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage; 