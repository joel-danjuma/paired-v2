
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare,
  MapPin,
  Calendar,
  DollarSign,
  User
} from 'lucide-react';

// Import the mock posts
import { MOCK_POSTS } from '@/data/posts';

const PostDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [showContactInfo, setShowContactInfo] = useState(false);
  
  // Find the post from our mock data
  const post = MOCK_POSTS.find(p => p.id === id);
  
  if (!post) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-paired-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500">Listing Not Found</h1>
            <p className="mt-2 text-gray-600">The listing you're looking for doesn't exist or has been removed.</p>
            <Button asChild className="mt-4">
              <Link to="/posts">Browse Other Listings</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Format the date
  const formattedDate = new Date(post.moveInDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 bg-paired-50 py-8">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link to="/posts" className="text-paired-600 hover:underline flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to listings
            </Link>
          </div>
          
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Image Carousel */}
              <div className="bg-white rounded-lg overflow-hidden shadow-sm mb-6">
                <Carousel>
                  <CarouselContent>
                    {post.images.length > 0 ? (
                      post.images.map((image, index) => (
                        <CarouselItem key={index}>
                          <img 
                            src={image || "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&h=500&fit=crop"} 
                            alt={`Image ${index + 1} of ${post.title}`}
                            className="w-full object-cover h-[300px] md:h-[400px]"
                          />
                        </CarouselItem>
                      ))
                    ) : (
                      <CarouselItem>
                        <img 
                          src="https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&h=500&fit=crop" 
                          alt="Placeholder" 
                          className="w-full object-cover h-[300px] md:h-[400px]"
                        />
                      </CarouselItem>
                    )}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
              
              {/* Listing Details */}
              <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
                
                <div className="flex flex-wrap items-center mt-2 text-gray-600">
                  <div className="flex items-center mr-4">
                    <MapPin className="h-4 w-4 mr-1 text-paired-400" />
                    <span>{post.location}</span>
                  </div>
                  <div className="flex items-center mr-4">
                    <DollarSign className="h-4 w-4 mr-1 text-paired-400" />
                    <span>₦{post.rent.toLocaleString()}/month</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-paired-400" />
                    <span>Available {formattedDate}</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                  <p className="text-gray-700 whitespace-pre-line">{post.description}</p>
                </div>
                
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {post.amenities.map((amenity, index) => (
                      <Badge key={index} variant="outline" className="bg-paired-50">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center space-x-3">
                  {post.user.profilePic ? (
                    <img 
                      src={post.user.profilePic} 
                      alt={post.user.name} 
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-paired-200 text-paired-700">
                      <User className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{post.user.name}</h3>
                    <p className="text-sm text-gray-500">Listing owner</p>
                  </div>
                </div>
                
                <div className="mt-6 space-y-3">
                  {user ? (
                    <>
                      <Button 
                        asChild
                        className="w-full bg-paired-400 hover:bg-paired-500"
                      >
                        <Link to={`/messages/${post.user.id}`}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Message
                        </Link>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setShowContactInfo(!showContactInfo)}
                      >
                        {showContactInfo ? 'Hide Contact Info' : 'Show Contact Info'}
                      </Button>
                      
                      {showContactInfo && (
                        <div className="mt-4 p-3 bg-paired-50 rounded-md">
                          <p className="text-sm"><strong>Email:</strong> {post.user.name.toLowerCase().replace(' ', '.')}@example.com</p>
                          <p className="text-sm mt-1"><strong>Phone:</strong> (555) 123-4567</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-4">Sign in to contact this roommate</p>
                      <div className="grid grid-cols-2 gap-3">
                        <Button asChild variant="outline">
                          <Link to="/login">Login</Link>
                        </Button>
                        <Button asChild className="bg-paired-400 hover:bg-paired-500">
                          <Link to="/register">Sign Up</Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Safety Tips */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Safety Tips</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <span className="text-paired-400 mr-2">•</span>
                    Always meet in a public place first
                  </li>
                  <li className="flex items-start">
                    <span className="text-paired-400 mr-2">•</span>
                    Don't share financial information via messages
                  </li>
                  <li className="flex items-start">
                    <span className="text-paired-400 mr-2">•</span>
                    Visit the property before signing anything
                  </li>
                  <li className="flex items-start">
                    <span className="text-paired-400 mr-2">•</span>
                    Trust your instincts if something feels off
                  </li>
                </ul>
                <Link to="/safety" className="text-sm text-paired-600 hover:underline block mt-3">
                  Read all safety guidelines
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PostDetailPage;
