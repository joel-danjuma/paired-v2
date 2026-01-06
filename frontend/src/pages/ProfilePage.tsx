
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Pencil } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const ProfilePage = () => {
  const { user, token } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [token]);

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container py-8 mx-auto px-4">
          <div className="text-center">Loading profile...</div>
        </div>
        <Footer />
      </>
    );
  }

  // Extract data with fallbacks
  const lifestyle = userProfile?.lifestyle_data || {};
  const preferences = userProfile?.preferences || {};
  
  const occupation = lifestyle.occupation || 'Not specified';
  const age = lifestyle.age || 'Not specified';
  const gender = lifestyle.gender || 'Not specified';
  const bio = userProfile?.bio || 'No bio yet. Click "Edit Profile" to add one!';

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
                      {user?.name?.charAt(0) || user?.first_name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <h2 className="text-2xl font-bold">
                    {user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User'}
                  </h2>
                  <p className="text-gray-600">{occupation}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {age !== 'Not specified' && `${age} years old`}
                    {age !== 'Not specified' && gender !== 'Not specified' && ' • '}
                    {gender !== 'Not specified' && <span className="capitalize">{gender}</span>}
                  </p>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Roommate Compatibility</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {lifestyle.is_smoker === false && (
                        <Badge variant="outline">Non-smoker</Badge>
                      )}
                      {lifestyle.is_smoker === true && (
                        <Badge variant="outline">Smoker</Badge>
                      )}
                      {lifestyle.has_pets === false && (
                        <Badge variant="outline">No pets</Badge>
                      )}
                      {lifestyle.has_pets === true && (
                        <Badge variant="outline">Has pets</Badge>
                      )}
                      {lifestyle.cleanliness && (
                      <Badge variant="outline">
                          {lifestyle.cleanliness === 'very-clean' ? 'Very clean' : 
                           lifestyle.cleanliness === 'average' ? 'Average cleanliness' : 
                           lifestyle.cleanliness === 'relaxed' ? 'Relaxed cleanliness' : 'Messy'}
                      </Badge>
                      )}
                      {lifestyle.sleep_schedule && (
                      <Badge variant="outline">
                          {lifestyle.sleep_schedule === 'early' ? 'Early bird' : 
                           lifestyle.sleep_schedule === 'normal' ? 'Normal sleeper' : 
                           lifestyle.sleep_schedule === 'late' ? 'Night owl' : 'Variable schedule'}
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
                  <TabsTrigger value="preferences" className="flex-1">Preferences</TabsTrigger>
                </TabsList>

                <TabsContent value="about">
                  <Card>
                    <CardHeader>
                      <CardTitle>About Me</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{bio}</p>
                      
                      {(preferences.interests || preferences.hobbies) && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3">Interests & Hobbies</h3>
                          {preferences.interests && (
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-500">Interests</p>
                              <p className="text-gray-700">{preferences.interests}</p>
                            </div>
                          )}
                          {preferences.hobbies && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">Hobbies</p>
                              <p className="text-gray-700">{preferences.hobbies}</p>
                            </div>
                          )}
                      </div>
                      )}

                      {(preferences.music_preference || preferences.food_preference || 
                        lifestyle.drinking_habits || lifestyle.noise_level) && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3">Preferences</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {preferences.music_preference && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Music Taste</p>
                                <p className="text-gray-700">{preferences.music_preference}</p>
                          </div>
                            )}
                            {preferences.food_preference && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Food Preferences</p>
                                <p className="text-gray-700">{preferences.food_preference}</p>
                          </div>
                            )}
                            {lifestyle.drinking_habits && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Drinking Habits</p>
                                <p className="text-gray-700 capitalize">{lifestyle.drinking_habits}</p>
                          </div>
                            )}
                            {lifestyle.noise_level && (
                              <div>
                                <p className="text-sm font-medium text-gray-500">Noise Preference</p>
                                <p className="text-gray-700 capitalize">{lifestyle.noise_level}</p>
                              </div>
                                  )}
                                </div>
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
                          <p>{lifestyle.is_smoker ? 'Smoker' : lifestyle.is_smoker === false ? 'Non-smoker' : 'Not specified'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Pets</h3>
                          <p>{lifestyle.has_pets ? 'Has pets' : lifestyle.has_pets === false ? 'No pets' : 'Not specified'}</p>
                        </div>
                        {lifestyle.drinking_habits && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Drinking Habits</h3>
                            <p className="capitalize">{lifestyle.drinking_habits}</p>
                        </div>
                        )}
                        {lifestyle.sleep_schedule && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Sleep Schedule</h3>
                          <p className="capitalize">
                              {lifestyle.sleep_schedule === 'early' ? 'Early bird' : 
                               lifestyle.sleep_schedule === 'normal' ? 'Normal schedule (11PM-7AM)' : 
                               lifestyle.sleep_schedule === 'late' ? 'Night owl' : 
                             'Variable schedule'}
                          </p>
                        </div>
                        )}
                        {lifestyle.cleanliness && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Cleanliness</h3>
                          <p className="capitalize">
                              {lifestyle.cleanliness === 'very-clean' ? 'Very clean' : 
                               lifestyle.cleanliness === 'average' ? 'Average' : 
                               lifestyle.cleanliness === 'relaxed' ? 'Relaxed' : 'Messy'}
                          </p>
                        </div>
                        )}
                        {lifestyle.noise_level && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Noise Preference</h3>
                            <p className="capitalize">{lifestyle.noise_level}</p>
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
