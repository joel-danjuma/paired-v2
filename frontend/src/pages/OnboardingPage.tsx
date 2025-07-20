
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

  // Prevent access if not logged in
  React.useEffect(() => {
    if (!user || !token) {
      toast.error("Please log in to complete your profile");
      navigate('/login');
    }
  }, [user, token, navigate]);
  const [formData, setFormData] = useState({
    // Basic info - all empty to force user input
    bio: '',
    occupation: '',
    age: '',
    gender: '',
    // Preferences - all empty/default to force user input
    isSmoker: false,
    hasPets: false,
    drinkingHabits: '',
    sleepSchedule: '',
    cleanliness: '',
    guestPreference: '',
    noiseLevel: '',
    // Interests - all empty to force user input
    interests: '',
    hobbies: '',
    musicPreference: '',
    foodPreference: ''
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

  const validateStep = () => {
    if (currentStep === 1) {
      // Validate required fields for step 1
      if (!formData.bio.trim()) {
        toast.error("Please write a short bio about yourself");
        return false;
      }
      if (!formData.age || parseInt(formData.age) < 18 || parseInt(formData.age) > 100) {
        toast.error("Please enter a valid age (18-100)");
        return false;
      }
      if (!formData.gender) {
        toast.error("Please select your gender");
        return false;
      }
      // Occupation is optional but encourage completion
      if (!formData.occupation.trim()) {
        toast.error("Please enter your occupation or student status");
        return false;
      }
    } else if (currentStep === 2) {
      // Validate required fields for step 2
      if (!formData.drinkingHabits) {
        toast.error("Please select your drinking habits");
        return false;
      }
      if (!formData.sleepSchedule) {
        toast.error("Please select your sleep schedule");
        return false;
      }
      if (!formData.cleanliness) {
        toast.error("Please select your cleanliness level");
        return false;
      }
      if (!formData.guestPreference) {
        toast.error("Please select your guest preference");
        return false;
      }
      if (!formData.noiseLevel) {
        toast.error("Please select your noise level preference");
        return false;
      }
    } else if (currentStep === 3) {
      // Validate final step - ensure at least some interests are filled
      if (!formData.interests.trim() && !formData.hobbies.trim()) {
        toast.error("Please share at least your interests or hobbies");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate final step
    if (!validateStep()) {
      return;
    }
    
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
        
        // Handle validation errors (422 status)
        if (response.status === 422 && errorData.detail && Array.isArray(errorData.detail)) {
          const validationErrors = errorData.detail.map((err: any) => 
            `${err.loc ? err.loc.join(' -> ') : ''}: ${err.msg}`
          ).join(', ');
          throw new Error(`Validation error: ${validationErrors}`);
        }
        
        throw new Error(errorData.detail || 'Failed to update profile');
      }

      const updatedProfile = await response.json();
      console.log('Profile updated successfully:', updatedProfile);
      
      toast.success("Profile setup complete! Welcome to Paired!");
      
      // Only redirect to dashboard after successful completion
      navigate('/dashboard');
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
                    checked={formData.isSmoker}
                    onCheckedChange={(checked) => handleSwitchChange('isSmoker', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="pets">Do you have pets?</Label>
                    <p className="text-sm text-muted-foreground">Or plan to have pets</p>
                  </div>
                  <Switch 
                    id="pets" 
                    checked={formData.hasPets}
                    onCheckedChange={(checked) => handleSwitchChange('hasPets', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="drinking">Drinking Habits</Label>
                  <Select 
                    value={formData.drinkingHabits} 
                    onValueChange={(value) => handleSelectChange('drinkingHabits', value)}
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
                    value={formData.sleepSchedule} 
                    onValueChange={(value) => handleSelectChange('sleepSchedule', value)}
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
                    value={formData.noiseLevel} 
                    onValueChange={(value) => handleSelectChange('noiseLevel', value)}
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
                    name="musicPreference" 
                    placeholder="What kind of music do you enjoy?"
                    value={formData.musicPreference}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="food">Food Preferences</Label>
                  <Input 
                    id="food" 
                    name="foodPreference" 
                    placeholder="Any dietary preferences or restrictions?"
                    value={formData.foodPreference}
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
