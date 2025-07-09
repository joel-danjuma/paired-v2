import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_POSTS } from '@/data/posts';

const EditListingPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    description: '',
    rent: '',
    moveInDate: '',
    amenities: '',
    images: []
  });

  console.log('EditListingPage - Looking for listing with ID:', id);
  console.log('EditListingPage - Available posts:', MOCK_POSTS);

  // Find the listing in our mock data
  useEffect(() => {
    const listing = MOCK_POSTS.find(l => l.id === id);
    console.log('EditListingPage - Found listing:', listing);
    
    if (listing) {
      setFormData({
        title: listing.title,
        location: listing.location,
        description: listing.description,
        rent: listing.rent.toString(),
        moveInDate: listing.moveInDate,
        amenities: listing.amenities.join(', '),
        images: []
      });
    } else {
      console.log('EditListingPage - Listing not found for ID:', id);
      toast.error("Listing not found");
      navigate('/my-listings');
    }
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to a database
    toast.success("Listing updated successfully!");
    navigate('/my-listings');
  };

  return (
    <div className="container py-8 mx-auto px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Edit Listing</CardTitle>
              <CardDescription>Update your property listing details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Listing Title</Label>
                <Input 
                  id="title" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rent">Monthly Rent (₦)</Label>
                  <Input 
                    id="rent" 
                    name="rent" 
                    value={formData.rent} 
                    onChange={handleChange} 
                    type="number"
                    min="0"
                    step="1000"
                    required
                  />
                  <p className="text-sm text-gray-500">Enter amount in Nigerian Naira (₦)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moveInDate">Available From</Label>
                  <Input 
                    id="moveInDate" 
                    name="moveInDate" 
                    value={formData.moveInDate} 
                    onChange={handleChange} 
                    type="date"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amenities">Amenities</Label>
                <Textarea 
                  id="amenities" 
                  name="amenities" 
                  value={formData.amenities} 
                  onChange={handleChange}
                  rows={2}
                  placeholder="Wi-Fi, Kitchen, AC, etc. (comma separated)"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Images</Label>
                <div className="border rounded-md p-4">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    className="mb-2"
                  />
                  <p className="text-xs text-gray-500">Upload up to 5 images of your property</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => navigate('/my-listings')}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EditListingPage;
