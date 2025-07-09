
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Pencil, Home, Calendar, TrendingUp } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Mock user data for profile - would typically come from API or database
const mockUserPreferences = {
  bio: 'Software developer who enjoys hiking and reading. Looking for a clean and quiet living space.',
  occupation: 'Software Engineer',
  age: '28',
  gender: 'Male',
  isSmoker: false,
  hasPets: false,
  drinkingHabits: 'occasionally',
  sleepSchedule: 'normal',
  cleanliness: 'very-clean',
  guestPreference: 'occasionally',
  noiseLevel: 'moderate',
  interests: 'Technology, hiking, photography, and reading',
  hobbies: 'Coding side projects, mountain biking, and cooking',
  musicPreference: 'Indie rock, jazz, and electronic',
  foodPreference: 'Vegetarian-friendly, enjoy cooking'
};

// Mock listings data
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
  const { user } = useAuth();
  const userPreferences = mockUserPreferences; // In a real app, fetch from API based on user.id

  console.log('ProfilePage rendering for user:', user?.name);

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
                  <p className="text-gray-600">{userPreferences.occupation}</p>
                  <p className="text-sm text-gray-500 mt-1">{userPreferences.age} years old • {userPreferences.gender}</p>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Roommate Compatibility</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {!userPreferences.isSmoker && (
                        <Badge variant="outline">Non-smoker</Badge>
                      )}
                      {!userPreferences.hasPets && (
                        <Badge variant="outline">No pets</Badge>
                      )}
                      <Badge variant="outline">
                        {userPreferences.cleanliness === 'very-clean' ? 'Very clean' : 
                         userPreferences.cleanliness === 'average' ? 'Average cleanliness' : 
                         userPreferences.cleanliness === 'relaxed' ? 'Relaxed cleanliness' : 'Messy'}
                      </Badge>
                      <Badge variant="outline">
                        {userPreferences.sleepSchedule === 'early' ? 'Early bird' : 
                         userPreferences.sleepSchedule === 'normal' ? 'Normal sleeper' : 
                         userPreferences.sleepSchedule === 'late' ? 'Night owl' : 'Variable schedule'}
                      </Badge>
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
                      <p className="text-gray-700">{userPreferences.bio}</p>
                      
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3">Interests & Hobbies</h3>
                        <p className="text-gray-700 mb-4">{userPreferences.interests}</p>
                        <p className="text-gray-700">{userPreferences.hobbies}</p>
                      </div>

                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3">Preferences</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Music Taste</p>
                            <p className="text-gray-700">{userPreferences.musicPreference}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Food Preferences</p>
                            <p className="text-gray-700">{userPreferences.foodPreference}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Drinking Habits</p>
                            <p className="text-gray-700 capitalize">{userPreferences.drinkingHabits}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Noise Preference</p>
                            <p className="text-gray-700 capitalize">{userPreferences.noiseLevel}</p>
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
                          <p>{userPreferences.isSmoker ? 'Smoker' : 'Non-smoker'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Pets</h3>
                          <p>{userPreferences.hasPets ? 'Has pets' : 'No pets'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Drinking Habits</h3>
                          <p className="capitalize">{userPreferences.drinkingHabits}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Sleep Schedule</h3>
                          <p className="capitalize">
                            {userPreferences.sleepSchedule === 'early' ? 'Early bird' : 
                             userPreferences.sleepSchedule === 'normal' ? 'Normal schedule (11PM-7AM)' : 
                             userPreferences.sleepSchedule === 'late' ? 'Night owl' : 
                             'Variable schedule'}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Cleanliness</h3>
                          <p className="capitalize">
                            {userPreferences.cleanliness === 'very-clean' ? 'Very clean' : 
                             userPreferences.cleanliness === 'average' ? 'Average' : 
                             userPreferences.cleanliness === 'relaxed' ? 'Relaxed' : 'Messy'}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Noise Preference</h3>
                          <p className="capitalize">{userPreferences.noiseLevel}</p>
                        </div>
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
