
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { Pencil } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Mock user preferences - in a real app, this would come from a database query
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: 'Software developer who enjoys hiking and reading. Looking for a clean and quiet living space.',
    occupation: 'Software Engineer',
    age: '28',
    gender: 'Male',
    isSmoker: 'false',
    hasPets: 'false',
    drinkingHabits: 'occasionally',
    sleepSchedule: 'normal',
    cleanliness: 'very-clean',
    interests: 'Technology, hiking, photography, and reading',
    hobbies: 'Coding side projects, mountain biking, and cooking',
    musicPreference: 'Indie rock, jazz, and electronic',
    foodPreference: 'Vegetarian-friendly, enjoy cooking'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to a database
    toast.success("Profile updated successfully!");
    navigate('/profile');
  };

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
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  name="bio" 
                  value={formData.bio} 
                  onChange={handleChange}
                  rows={3}
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
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Non-binary">Non-binary</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isSmoker">Smoker</Label>
                  <Select 
                    value={formData.isSmoker} 
                    onValueChange={(value) => handleSelectChange('isSmoker', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Smoking habits" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hasPets">Has Pets</Label>
                  <Select 
                    value={formData.hasPets} 
                    onValueChange={(value) => handleSelectChange('hasPets', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pet ownership" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="drinkingHabits">Drinking Habits</Label>
                  <Select 
                    value={formData.drinkingHabits} 
                    onValueChange={(value) => handleSelectChange('drinkingHabits', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select drinking habits" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="rarely">Rarely</SelectItem>
                      <SelectItem value="occasionally">Occasionally</SelectItem>
                      <SelectItem value="regularly">Regularly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sleepSchedule">Sleep Schedule</Label>
                  <Select 
                    value={formData.sleepSchedule} 
                    onValueChange={(value) => handleSelectChange('sleepSchedule', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sleep schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="early">Early bird (before 10PM)</SelectItem>
                      <SelectItem value="normal">Normal (11PM-7AM)</SelectItem>
                      <SelectItem value="late">Night owl (after midnight)</SelectItem>
                      <SelectItem value="variable">Variable schedule</SelectItem>
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
                      <SelectItem value="very-clean">Very clean</SelectItem>
                      <SelectItem value="average">Average</SelectItem>
                      <SelectItem value="relaxed">Relaxed</SelectItem>
                      <SelectItem value="messy">Messy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="interests">Interests</Label>
                <Textarea 
                  id="interests" 
                  name="interests" 
                  value={formData.interests} 
                  onChange={handleChange}
                  rows={2}
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
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="musicPreference">Music Preferences</Label>
                  <Input 
                    id="musicPreference" 
                    name="musicPreference" 
                    value={formData.musicPreference} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="foodPreference">Food Preferences</Label>
                  <Input 
                    id="foodPreference" 
                    name="foodPreference" 
                    value={formData.foodPreference} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => navigate('/profile')}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EditProfilePage;
