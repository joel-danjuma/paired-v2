
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Basic info
    bio: '',
    occupation: '',
    age: '',
    gender: '',
    // Preferences (using snake_case to match backend)
    is_smoker: false,
    has_pets: false,
    drinking_habits: 'occasionally',
    sleep_schedule: 'normal',
    cleanliness: 'average',
    guest_preference: 'occasionally',
    noise_level: 'moderate',
    // Interests
    interests: '',
    hobbies: '',
    music_preference: '',
    food_preference: ''
  });

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

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
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

      toast.success("Profile preferences saved!");
      navigate('/profile');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save preferences');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-3xl py-16 mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Tell us about yourself</h1>
        <p className="text-gray-600">Help us find your perfect roommate match</p>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-8">
          <div 
            className="bg-primary h-2.5 rounded-full" 
            style={{ width: `${(currentStep / 3) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>Basic Info</span>
          <span>Preferences</span>
          <span>Interests</span>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Tell us a bit about yourself so we can find suitable roommates for you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">About Me</Label>
                  <Textarea 
                    id="bio" 
                    name="bio" 
                    placeholder="Write a short bio about yourself" 
                    value={formData.bio}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input 
                      id="age" 
                      name="age" 
                      type="number" 
                      min="18" 
                      max="100" 
                      placeholder="Your age"
                      value={formData.age}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select 
                      value={formData.gender} 
                      onValueChange={(value) => handleSelectChange('gender', value)}
                    >
                      <SelectTrigger id="gender">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input 
                    id="occupation" 
                    name="occupation" 
                    placeholder="Your job or student status" 
                    value={formData.occupation}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </>
          )}

          {currentStep === 2 && (
            <>
              <CardHeader>
                <CardTitle>Living Preferences</CardTitle>
                <CardDescription>
                  Tell us about your lifestyle and what you look for in a roommate.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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

                <div className="space-y-2">
                  <Label htmlFor="drinking">Drinking Habits</Label>
                  <Select 
                    value={formData.drinking_habits} 
                    onValueChange={(value) => handleSelectChange('drinking_habits', value)}
                  >
                    <SelectTrigger id="drinking">
                      <SelectValue placeholder="Select option" />
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
                  <Label htmlFor="sleep">Sleep Schedule</Label>
                  <Select 
                    value={formData.sleep_schedule} 
                    onValueChange={(value) => handleSelectChange('sleep_schedule', value)}
                  >
                    <SelectTrigger id="sleep">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="early">Early bird (Early to bed, early to rise)</SelectItem>
                      <SelectItem value="normal">Normal (11PM-7AM)</SelectItem>
                      <SelectItem value="late">Night owl (Late to bed, late to rise)</SelectItem>
                      <SelectItem value="variable">Variable/Inconsistent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cleanliness">Cleanliness Level</Label>
                  <Select 
                    value={formData.cleanliness} 
                    onValueChange={(value) => handleSelectChange('cleanliness', value)}
                  >
                    <SelectTrigger id="cleanliness">
                      <SelectValue placeholder="Select option" />
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
                    <SelectTrigger id="noise">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quiet">Very quiet</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="loud">Don't mind noise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </>
          )}

          {currentStep === 3 && (
            <>
              <CardHeader>
                <CardTitle>Interests & Hobbies</CardTitle>
                <CardDescription>
                  Share your interests to help find roommates with similar tastes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="interests">Interests</Label>
                  <Textarea 
                    id="interests" 
                    name="interests" 
                    placeholder="What are you interested in? (e.g., technology, arts, sports)"
                    value={formData.interests}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hobbies">Hobbies</Label>
                  <Textarea 
                    id="hobbies" 
                    name="hobbies" 
                    placeholder="What do you enjoy doing in your free time?"
                    value={formData.hobbies}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="music">Music Preferences</Label>
                  <Input 
                    id="music" 
                    name="music_preference" 
                    placeholder="What kind of music do you enjoy?"
                    value={formData.music_preference}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="food">Food Preferences</Label>
                  <Input 
                    id="food" 
                    name="food_preference" 
                    placeholder="Any dietary preferences or restrictions?"
                    value={formData.food_preference}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </>
          )}

          <CardFooter className="flex justify-between">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
            ) : (
              <div></div> // Empty div for spacing
            )}
            
            {currentStep < 3 ? (
              <Button type="button" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Complete Profile'}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default OnboardingPage;
