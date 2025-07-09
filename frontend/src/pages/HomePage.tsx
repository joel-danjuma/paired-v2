import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import PostCard from '@/components/PostCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Search, Home, User } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { MOCK_POSTS } from '@/data/posts';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/posts?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Debug logging
  console.log('HomePage rendering...');
  console.log('MOCK_POSTS length:', MOCK_POSTS?.length || 0);
  console.log('MOCK_POSTS data:', MOCK_POSTS);

  // Use the first 3 posts as featured
  const FEATURED_POSTS = MOCK_POSTS?.slice(0, 3) || [];
  // Use posts 4-6 as recent
  const RECENT_POSTS = MOCK_POSTS?.slice(3, 6) || [];

  console.log('FEATURED_POSTS:', FEATURED_POSTS);
  console.log('RECENT_POSTS:', RECENT_POSTS);

  // Fallback if no data
  if (!MOCK_POSTS || MOCK_POSTS.length === 0) {
    console.warn('No MOCK_POSTS data available');
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-paired-900 text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-paired-900 to-paired-700 opacity-90"></div>
          <div className="container relative px-4 py-20 mx-auto text-center sm:px-6 lg:px-8 lg:py-32">
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
              Find Your Perfect <span className="text-paired-300">Roommate</span>
            </h1>
            <p className="max-w-2xl mx-auto mt-4 text-xl text-paired-100 sm:mt-6">
              Connect with potential roommates, explore available spaces, and find your ideal living situation.
            </p>
            
            <form onSubmit={handleSearch} className="max-w-3xl p-4 mx-auto mt-8 bg-white rounded-lg shadow-lg sm:p-6 sm:mt-10">
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input 
                      type="text" 
                      placeholder="Location (city, neighborhood)"
                      className="pl-10 text-gray-900"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex space-x-4">
                  <Button type="submit" className="flex-1 bg-paired-400 hover:bg-paired-500">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                  <Button asChild variant="outline" className="flex-1 border-paired-400 text-paired-700 hover:bg-paired-50">
                    <Link to="/posts">
                      <User className="w-4 h-4 mr-2" />
                      Find Roommate
                    </Link>
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </section>
        
        {/* Featured Listings */}
        <section className="py-12 bg-white">
          <div className="container px-4 mx-auto sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Featured Listings</h2>
              <Button asChild variant="outline">
                <Link to="/posts">View All</Link>
              </Button>
            </div>
            
            {FEATURED_POSTS && FEATURED_POSTS.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {FEATURED_POSTS.map(post => (
                  <PostCard key={post.id} post={post} featured={true} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading featured listings...</p>
                <div className="mt-4">
                  <p className="text-sm text-gray-400">Debug: Posts available: {MOCK_POSTS?.length || 0}</p>
                </div>
              </div>
            )}
          </div>
        </section>
        
        {/* How It Works */}
        <section className="py-12 bg-paired-50">
          <div className="container px-4 mx-auto text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900">How Paired Works</h2>
            <p className="max-w-2xl mx-auto mt-4 text-lg text-gray-600">
              Finding a compatible roommate has never been easier
            </p>
            
            <div className="grid gap-8 mt-10 md:grid-cols-3">
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 mx-auto text-white bg-paired-400 rounded-full">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="mt-4 text-xl font-medium">Create a Profile</h3>
                <p className="mt-2 text-gray-600">
                  Sign up and create your profile with your preferences and lifestyle details.
                </p>
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 mx-auto text-white bg-paired-400 rounded-full">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="mt-4 text-xl font-medium">Browse Listings</h3>
                <p className="mt-2 text-gray-600">
                  Search for available rooms or potential roommates that match your criteria.
                </p>
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 mx-auto text-white bg-paired-400 rounded-full">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="mt-4 text-xl font-medium">Connect & Chat</h3>
                <p className="mt-2 text-gray-600">
                  Message potential matches directly to discuss details and see if you're compatible.
                </p>
              </div>
            </div>
            
            <div className="mt-10">
              <Button asChild className="bg-paired-400 hover:bg-paired-500">
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Recent Listings */}
        <section className="py-12 bg-white">
          <div className="container px-4 mx-auto sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Recent Listings</h2>
              <Button asChild variant="outline">
                <Link to="/posts">View All</Link>
              </Button>
            </div>
            
            {RECENT_POSTS && RECENT_POSTS.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {RECENT_POSTS.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading recent listings...</p>
                <div className="mt-4">
                  <p className="text-sm text-gray-400">Debug: Posts available: {MOCK_POSTS?.length || 0}</p>
                </div>
              </div>
            )}
          </div>
        </section>
        
        {/* Testimonials */}
        <section className="py-12 bg-paired-50">
          <div className="container px-4 mx-auto sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900">What Our Users Say</h2>
            
            <div className="grid gap-6 mt-10 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img 
                      src="https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=150&h=150&fit=crop" 
                      alt="User" 
                      className="w-12 h-12 rounded-full"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium">Sarah L.</h4>
                    <div className="flex text-paired-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-gray-600">
                  "I found my roommate through Paired App within a week! The messaging feature made it easy to connect and make sure we were compatible before moving in together."
                </p>
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img 
                      src="https://images.unsplash.com/photo-1517022812141-23620dba5c23?w=150&h=150&fit=crop" 
                      alt="User" 
                      className="w-12 h-12 rounded-full"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium">Michael T.</h4>
                    <div className="flex text-paired-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-gray-600">
                  "As a landlord, I've had great success finding responsible tenants through Paired App. The detailed profiles help me find the right people for my properties."
                </p>
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img 
                      src="https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=150&h=150&fit=crop" 
                      alt="User" 
                      className="w-12 h-12 rounded-full"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium">Jessica K.</h4>
                    <div className="flex text-paired-400">
                      {[...Array(4)].map((_, i) => (
                        <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-gray-600">
                  "Moving to a new city was scary, but Paired App made it easier to find a safe living situation with compatible roommates. Highly recommend!"
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-12 bg-paired-400 text-white">
          <div className="container px-4 mx-auto text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold">Ready to Find Your Perfect Match?</h2>
            <p className="max-w-2xl mx-auto mt-4 text-xl text-paired-100">
              Join thousands of people who have found their ideal living situation through Paired App.
            </p>
            <div className="mt-8 space-x-4">
              <Button asChild size="lg" variant="secondary">
                <Link to="/posts">Browse Listings</Link>
              </Button>
              <Button asChild size="lg" className="bg-white text-paired-700 hover:bg-paired-50">
                <Link to="/register">Sign Up Free</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;
