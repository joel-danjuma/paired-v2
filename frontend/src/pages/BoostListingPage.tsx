
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { CheckCircle, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_POSTS } from '@/data/posts';

const BoostListingPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  
  const [listing, setListing] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState('premium');

  console.log('BoostListingPage - Looking for listing with ID:', id);
  console.log('BoostListingPage - Available posts:', MOCK_POSTS);

  // Find the listing in our mock data
  useEffect(() => {
    const foundListing = MOCK_POSTS.find(l => l.id === id);
    console.log('BoostListingPage - Found listing:', foundListing);
    
    if (foundListing) {
      setListing(foundListing);
    } else {
      console.log('BoostListingPage - Listing not found for ID:', id);
      toast.error("Listing not found");
      navigate('/my-listings');
    }
  }, [id, navigate]);

  const handleProceedToPayment = () => {
    navigate('/payment', { 
      state: { 
        plan: selectedPlan, 
        amount: selectedPlan === 'premium' ? 7000 : selectedPlan === 'featured' ? 12000 : 20000,
        listingId: id
      } 
    });
  };

  if (!listing) {
    return <div className="container py-16 text-center">Loading...</div>;
  }

  return (
    <div className="container py-8 mx-auto px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Boost Your Listing</h1>
          <p className="text-gray-600">Increase visibility and find tenants faster</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-8">
          <h2 className="text-lg font-semibold mb-2">Selected Listing</h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{listing.title}</p>
              <p className="text-sm text-gray-500">{listing.location}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">₦{listing.rent.toLocaleString()}/month</p>
              <p className="text-sm text-gray-500">Available from {new Date(listing.moveInDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Basic Premium Plan */}
          <Card className={`cursor-pointer transition-all ${selectedPlan === 'premium' ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedPlan('premium')}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Premium
                {selectedPlan === 'premium' && <CheckCircle className="text-primary h-5 w-5" />}
              </CardTitle>
              <CardDescription>Basic visibility boost</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-4">₦7,000</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Higher search ranking for 7 days
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Premium badge on your listing
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Basic analytics
                </li>
              </ul>
            </CardContent>
          </Card>
          
          {/* Featured Plan */}
          <Card className={`cursor-pointer transition-all ${selectedPlan === 'featured' ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedPlan('featured')}>
            <CardHeader>
              <div className="absolute -top-3 -right-3">
                <Badge className="bg-paired-600">Popular</Badge>
              </div>
              <CardTitle className="flex justify-between items-center">
                Featured
                {selectedPlan === 'featured' && <CheckCircle className="text-primary h-5 w-5" />}
              </CardTitle>
              <CardDescription>Enhanced visibility package</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-4">₦12,000</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Top of search results for 14 days
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Featured section on homepage
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Premium badge on your listing
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Detailed viewing analytics
                </li>
              </ul>
            </CardContent>
          </Card>
          
          {/* Premium Plan */}
          <Card className={`cursor-pointer transition-all ${selectedPlan === 'ultimate' ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedPlan('ultimate')}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Ultimate
                {selectedPlan === 'ultimate' && <CheckCircle className="text-primary h-5 w-5" />}
              </CardTitle>
              <CardDescription>Maximum exposure</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-4">₦20,000</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Top of search results for 30 days
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Featured section on homepage
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Premium border highlighting
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Email promotion to matching users
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Comprehensive analytics dashboard
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-center">
          <Button size="lg" onClick={handleProceedToPayment}>
            <CreditCard className="w-4 h-4 mr-2" />
            Proceed to Payment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BoostListingPage;
