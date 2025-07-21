import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, User, MessageSquare, List, Settings, Search, Home, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 bg-paired-50">
        <div className="container mx-auto p-4 md:p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Welcome, {user?.name?.split(' ')[0]}!</h1>
              <Badge variant="outline" className="capitalize">
                {user?.user_type === 'seeker' ? '🏠 Room Seeker' : '🏡 Room Provider'}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {user?.user_type === 'seeker' 
                ? "Find your perfect room and connect with great roommates."
                : "Manage your listings and find the perfect roommate."
              }
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Profile Card - Universal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2" />
                  My Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Keep your profile up to date to {user?.user_type === 'seeker' ? 'attract room owners' : 'attract the best roommates'}.
                </p>
                <Link to="/profile">
                  <Button variant="outline">View Profile</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Dynamic Card Based on User Type */}
            {user?.user_type === 'seeker' ? (
              <>
                {/* Browse Rooms Card - For Seekers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Search className="mr-2" />
                      Browse Rooms
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Find available rooms that match your preferences and budget.
                    </p>
                    <Link to="/browse-rooms">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Search className="mr-2 h-4 w-4" />
                        Browse Rooms
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Roommate Wanted Card - For Seekers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PlusCircle className="mr-2" />
                      Post Room Request
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create a profile to let room owners know you're looking.
                    </p>
                    <Link to="/create-listing">
                      <Button className="bg-green-600 hover:bg-green-700">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Listing
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Profile Promotion Card - For Seekers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="mr-2" />
                      Boost Your Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get noticed by more room providers with premium promotion.
                    </p>
                    <Link to="/promote-profile">
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Promote Profile
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                {/* My Listings Card - For Providers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <List className="mr-2" />
                      My Room Listings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage your room listings and applications.
                    </p>
                    <div className="flex space-x-2">
                      <Link to="/my-listings">
                        <Button variant="outline">View Listings</Button>
                      </Link>
                      <Link to="/create-listing">
                        <Button>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          List Room
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Browse Seekers Card - For Providers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="mr-2" />
                      Browse Room Seekers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      View people actively looking for rooms to rent.
                    </p>
                    <Link to="/browse-seekers">
                      <Button variant="outline">
                        <Search className="mr-2 h-4 w-4" />
                        Browse Seekers
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </>
            )}

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
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DashboardPage; 