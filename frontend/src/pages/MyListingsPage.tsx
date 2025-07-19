
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Home, Edit, Eye, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { MOCK_POSTS } from "@/data/posts";

const MyListingsPage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 bg-gray-50">
          <div className="container px-4 py-8 mx-auto sm:px-6 lg:px-8">
            <div className="text-center py-20">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your listings</h1>
              <div className="space-x-4">
                <Button asChild variant="outline">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  // For demo purposes, show some listings as if they belong to the user
  const userListings = MOCK_POSTS.slice(0, 2);

  console.log('MyListingsPage rendering with listings:', userListings);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-gray-50">
        <div className="container px-4 py-8 mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
            <Button asChild>
              <Link to="/create-listing">
                <Plus className="w-4 h-4 mr-2" />
                Create New Listing
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {userListings.map((listing) => (
              <Card key={listing.id}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Home className="w-5 h-5 mr-2" />
                    {listing.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <img 
                    src={listing.images[0] || "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=250&fit=crop"} 
                    alt={listing.title}
                    className="w-full h-32 object-cover rounded-md mb-4"
                  />
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {listing.description}
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">₦{listing.rent.toLocaleString()}/month</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link to={`/edit-listing/${listing.id}`}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link to={`/boost-listing/${listing.id}`}>
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Boost
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="flex-1">
                      <Link to={`/posts/${listing.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {userListings.length === 0 && (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="flex flex-col items-center justify-center h-48 text-gray-500">
                  <Plus className="w-12 h-12 mb-4" />
                  <p className="text-center mb-4">Create your first listing</p>
                  <Button asChild>
                    <Link to="/create-listing">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyListingsPage;
