import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    bio: '',
    occupation: '',
    age: '',
    gender: '',
    is_smoker: false,
    has_pets: false,
    drinking_habits: '',
    sleep_schedule: '',
    cleanliness: '',
    noise_level: '',
    interests: '',
    hobbies: '',
    music_preference: '',
    food_preference: ''
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load profile');
        }

        const userData = await response.json();
        
        // Extract data from user object and nested objects
        const lifestyle = userData.lifestyle_data || {};
        const preferences = userData.preferences || {};
        
        setFormData({
          bio: userData.bio || '',
          occupation: userData.occupation || '',
          age: userData.age || '',
          gender: userData.gender || '',
          is_smoker: lifestyle.is_smoker || false,
          has_pets: lifestyle.has_pets || false,
          drinking_habits: lifestyle.drinking_habits || '',
          sleep_schedule: lifestyle.sleep_schedule || '',
          cleanliness: lifestyle.cleanliness || '',
          noise_level: lifestyle.noise_level || '',
          interests: preferences.interests || '',
          hobbies: preferences.hobbies || '',
          music_preference: preferences.music_preference || '',
          food_preference: preferences.food_preference || ''
        });
      } catch (error) {
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/me/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update profile');
      }

      toast.success("Profile updated successfully!");
      navigate('/profile');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8 mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="py-8">
              <p className="text-center">Loading profile...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 mx-auto px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your personal information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  name="bio" 
                  value={formData.bio} 
                  onChange={handleChange}
                  rows={3}
                  placeholder="Tell us about yourself"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input 
                    id="occupation" 
                    name="occupation" 
                    value={formData.occupation} 
                    onChange={handleChange}
                    placeholder="Your job or student status"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input 
                    id="age" 
                    name="age" 
                    value={formData.age} 
                    onChange={handleChange} 
                    type="number"
                    min="18"
                    placeholder="Your age"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select 
                  value={formData.gender} 
                  onValueChange={(value) => handleSelectChange('gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Lifestyle Preferences</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="smoking">Do you smoke?</Label>
                    <p className="text-sm text-muted-foreground">Indoors or outdoors</p>
                  </div>
                  <Switch 
                    id="smoking" 
                    checked={formData.is_smoker}
                    onCheckedChange={(checked) => handleSwitchChange('is_smoker', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="pets">Do you have pets?</Label>
                    <p className="text-sm text-muted-foreground">Or plan to have pets</p>
                  </div>
                  <Switch 
                    id="pets" 
                    checked={formData.has_pets}
                    onCheckedChange={(checked) => handleSwitchChange('has_pets', checked)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="drinkingHabits">Drinking Habits</Label>
                  <Select 
                    value={formData.drinking_habits} 
                    onValueChange={(value) => handleSelectChange('drinking_habits', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select drinking habits" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="rarely">Rarely</SelectItem>
                      <SelectItem value="occasionally">Occasionally</SelectItem>
                      <SelectItem value="frequently">Frequently</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sleepSchedule">Sleep Schedule</Label>
                  <Select 
                    value={formData.sleep_schedule} 
                    onValueChange={(value) => handleSelectChange('sleep_schedule', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sleep schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="early">Early bird (Early to bed, early to rise)</SelectItem>
                      <SelectItem value="normal">Normal (11PM-7AM)</SelectItem>
                      <SelectItem value="late">Night owl (Late to bed, late to rise)</SelectItem>
                      <SelectItem value="variable">Variable/Inconsistent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cleanliness">Cleanliness Level</Label>
                  <Select 
                    value={formData.cleanliness} 
                    onValueChange={(value) => handleSelectChange('cleanliness', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cleanliness level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="very-clean">Very Clean</SelectItem>
                      <SelectItem value="average">Average</SelectItem>
                      <SelectItem value="relaxed">Relaxed</SelectItem>
                      <SelectItem value="messy">Messy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="noise">Noise Level Preference</Label>
                  <Select 
                    value={formData.noise_level} 
                    onValueChange={(value) => handleSelectChange('noise_level', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select noise preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quiet">Very quiet</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="loud">Don't mind noise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Interests & Hobbies</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="interests">Interests</Label>
                  <Textarea 
                    id="interests" 
                    name="interests" 
                    value={formData.interests} 
                    onChange={handleChange}
                    rows={2}
                    placeholder="What are you interested in?"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hobbies">Hobbies</Label>
                  <Textarea 
                    id="hobbies" 
                    name="hobbies" 
                    value={formData.hobbies} 
                    onChange={handleChange}
                    rows={2}
                    placeholder="What do you enjoy doing?"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="musicPreference">Music Preferences</Label>
                    <Input 
                      id="musicPreference" 
                      name="music_preference" 
                      value={formData.music_preference} 
                      onChange={handleChange}
                      placeholder="Your music taste"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="foodPreference">Food Preferences</Label>
                    <Input 
                      id="foodPreference" 
                      name="food_preference" 
                      value={formData.food_preference} 
                      onChange={handleChange}
                      placeholder="Dietary preferences"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => navigate('/profile')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EditProfilePage;
