
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Pencil, Home, Calendar, TrendingUp } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Mock listings data - this would typically come from API
const mockListings = [
  {
    id: '101',
    title: 'Sunny Room in Downtown Apartment',
    location: 'Downtown, Lagos',
    rent: 120000,
    moveInDate: '2023-07-15',
    isPremium: true
  },
  {
    id: '102',
    title: 'Private Room with Bath in Modern House',
    location: 'Lekki, Lagos',
    rent: 150000,
    moveInDate: '2023-08-01',
    isPremium: false
  }
];

const ProfilePage = () => {
  const { user, token } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/v1/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const profileData = await response.json();
          setUserProfile(profileData);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  console.log('ProfilePage rendering for user:', user?.name);

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container py-8 mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <p>Loading profile...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container py-8 mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* User sidebar with photo and basic info */}
            <div className="w-full md:w-1/3">
              <Card>
                <CardContent className="pt-6 text-center">
                  {user?.profilePic ? (
                    <img 
                      src={user.profilePic} 
                      alt={user.name} 
                      className="rounded-full w-32 h-32 mx-auto mb-4 border-4 border-primary/20"
                    />
                  ) : (
                    <div className="rounded-full w-32 h-32 mx-auto mb-4 bg-paired-100 text-paired-700 flex items-center justify-center text-4xl font-bold">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <h2 className="text-2xl font-bold">{user?.name}</h2>
                  <p className="text-gray-600">
                    {userProfile?.lifestyle_data?.occupation || (
                      <span className="text-gray-400 italic">No occupation specified</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {userProfile?.lifestyle_data?.age ? `${userProfile.lifestyle_data.age} years old` : 'Age not specified'} • {userProfile?.lifestyle_data?.gender || 'Gender not specified'}
                  </p>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Roommate Compatibility</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {userProfile?.lifestyle_data?.is_smoker === false && (
                        <Badge variant="outline">Non-smoker</Badge>
                      )}
                      {userProfile?.lifestyle_data?.is_smoker === true && (
                        <Badge variant="outline">Smoker</Badge>
                      )}
                      {userProfile?.lifestyle_data?.has_pets === false && (
                        <Badge variant="outline">No pets</Badge>
                      )}
                      {userProfile?.lifestyle_data?.has_pets === true && (
                        <Badge variant="outline">Has pets</Badge>
                      )}
                      {userProfile?.lifestyle_data?.cleanliness && (
                        <Badge variant="outline">
                          {userProfile.lifestyle_data.cleanliness === 'very-clean' ? 'Very clean' : 
                           userProfile.lifestyle_data.cleanliness === 'average' ? 'Average cleanliness' : 
                           userProfile.lifestyle_data.cleanliness === 'relaxed' ? 'Relaxed cleanliness' : 'Messy'}
                        </Badge>
                      )}
                      {userProfile?.lifestyle_data?.sleep_schedule && (
                        <Badge variant="outline">
                          {userProfile.lifestyle_data.sleep_schedule === 'early' ? 'Early bird' : 
                           userProfile.lifestyle_data.sleep_schedule === 'normal' ? 'Normal sleeper' : 
                           userProfile.lifestyle_data.sleep_schedule === 'late' ? 'Night owl' : 'Variable schedule'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button asChild className="w-full" variant="outline">
                      <Link to="/profile/edit">
                        <Pencil className="w-4 h-4 mr-2" /> Edit Profile
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main content area with tabs */}
            <div className="w-full md:w-2/3">
              <Tabs defaultValue="about">
                <TabsList className="w-full mb-6">
                  <TabsTrigger value="about" className="flex-1">About</TabsTrigger>
                  <TabsTrigger value="listings" className="flex-1">My Listings</TabsTrigger>
                  <TabsTrigger value="preferences" className="flex-1">Preferences</TabsTrigger>
                </TabsList>

                <TabsContent value="about">
                  <Card>
                    <CardHeader>
                      <CardTitle>About Me</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {userProfile?.bio ? (
                        <p className="text-gray-700">{userProfile.bio}</p>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500 mb-4">No bio added yet</p>
                          <Button asChild variant="outline" size="sm">
                            <Link to="/onboarding">Complete Your Profile</Link>
                          </Button>
                        </div>
                      )}
                      
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3">Interests & Hobbies</h3>
                        {userProfile?.interests || userProfile?.hobbies ? (
                          <>
                            {userProfile?.interests && (
                              <p className="text-gray-700 mb-4">{userProfile.interests}</p>
                            )}
                            {userProfile?.hobbies && (
                              <p className="text-gray-700">{userProfile.hobbies}</p>
                            )}
                          </>
                        ) : (
                          <p className="text-gray-500 italic">No interests or hobbies added yet</p>
                        )}
                      </div>

                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3">Preferences</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Music Taste</p>
                            <p className="text-gray-700">{userProfile?.musicPreference || <span className="text-gray-500 italic">Not specified</span>}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Food Preferences</p>
                            <p className="text-gray-700">{userProfile?.foodPreference || <span className="text-gray-500 italic">Not specified</span>}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Drinking Habits</p>
                            <p className="text-gray-700 capitalize">{userProfile?.drinkingHabits || <span className="text-gray-500 italic">Not specified</span>}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Noise Preference</p>
                            <p className="text-gray-700 capitalize">{userProfile?.noiseLevel || <span className="text-gray-500 italic">Not specified</span>}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="listings">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>My Listings</CardTitle>
                        <CardDescription>Properties and rooms you've listed</CardDescription>
                      </div>
                      <Button asChild>
                        <Link to="/create-listing">
                          <Home className="w-4 h-4 mr-2" /> New Listing
                        </Link>
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {mockListings.length > 0 ? (
                        <div className="space-y-4">
                          {mockListings.map(listing => (
                            <div key={listing.id} className="border rounded-lg p-4 flex flex-col md:flex-row justify-between">
                              <div>
                                <div className="flex items-center mb-2">
                                  <h3 className="font-medium">{listing.title}</h3>
                                  {listing.isPremium && (
                                    <Badge className="ml-2 bg-gradient-to-r from-amber-500 to-yellow-500">
                                      Premium
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">{listing.location}</p>
                                <p className="text-sm text-gray-500 flex items-center mt-1">
                                  <Calendar className="w-4 h-4 mr-1" /> 
                                  Available from {new Date(listing.moveInDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="mt-4 md:mt-0 flex flex-col items-end">
                                <p className="text-lg font-bold">₦{listing.rent.toLocaleString()}/mo</p>
                                <div className="mt-2 space-x-2">
                                  <Button asChild variant="outline" size="sm">
                                    <Link to={`/edit-listing/${listing.id}`}>
                                      Edit
                                    </Link>
                                  </Button>
                                  {!listing.isPremium && (
                                    <Button asChild size="sm">
                                      <Link to={`/boost-listing/${listing.id}`}>
                                        <TrendingUp className="w-4 h-4 mr-1" />
                                        Boost
                                      </Link>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500 mb-4">You haven't created any listings yet</p>
                          <Button asChild>
                            <Link to="/create-listing">Create Your First Listing</Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="preferences">
                  <Card>
                    <CardHeader>
                      <CardTitle>Roommate Preferences</CardTitle>
                      <CardDescription>Your ideal living situation</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Smoking</h3>
                          <p>
                            {userProfile?.lifestyle_data?.is_smoker === true ? 'Smoker' : 
                             userProfile?.lifestyle_data?.is_smoker === false ? 'Non-smoker' : 
                             'Not specified'}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Pets</h3>
                          <p>
                            {userProfile?.lifestyle_data?.has_pets === true ? 'Has pets' : 
                             userProfile?.lifestyle_data?.has_pets === false ? 'No pets' : 
                             'Not specified'}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Drinking Habits</h3>
                          <p className="capitalize">{userProfile?.lifestyle_data?.drinking_habits || 'Not specified'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Sleep Schedule</h3>
                          <p className="capitalize">
                            {userProfile?.lifestyle_data?.sleep_schedule === 'early' ? 'Early bird' : 
                             userProfile?.lifestyle_data?.sleep_schedule === 'normal' ? 'Normal schedule (11PM-7AM)' : 
                             userProfile?.lifestyle_data?.sleep_schedule === 'late' ? 'Night owl' : 
                             userProfile?.lifestyle_data?.sleep_schedule ? userProfile.lifestyle_data.sleep_schedule : 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Cleanliness</h3>
                          <p className="capitalize">
                            {userProfile?.lifestyle_data?.cleanliness === 'very-clean' ? 'Very clean' : 
                             userProfile?.lifestyle_data?.cleanliness === 'average' ? 'Average' : 
                             userProfile?.lifestyle_data?.cleanliness === 'relaxed' ? 'Relaxed' : 
                             userProfile?.lifestyle_data?.cleanliness === 'messy' ? 'Messy' :
                             'Not specified'}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Noise Preference</h3>
                          <p className="capitalize">{userProfile?.lifestyle_data?.noise_level || 'Not specified'}</p>
                        </div>
                        {userProfile?.preferences?.interests && (
                          <div className="md:col-span-2">
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Interests</h3>
                            <p>{userProfile.preferences.interests}</p>
                          </div>
                        )}
                        {userProfile?.preferences?.hobbies && (
                          <div className="md:col-span-2">
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Hobbies</h3>
                            <p>{userProfile.preferences.hobbies}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="outline">
                        <Link to="/onboarding">Update Preferences</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;
