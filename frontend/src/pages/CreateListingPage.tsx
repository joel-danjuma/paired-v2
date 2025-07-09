import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Info, Upload, Plus, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import IdentityVerification from '@/components/IdentityVerification';

type ListingFormValues = {
  title: string;
  description: string;
  location: string;
  rent: number;
  moveInDate: string;
  roomType: string;
  bathrooms: string;
  furnished: boolean;
  parking: boolean;
  utilities: boolean;
  wifi: boolean;
  laundry: boolean;
  airConditioning: boolean;
  smoking: boolean;
  pets: boolean;
  gender: string;
  idealRoommateDesc: string;
  lookingFor: string[];
  images: File[];
};

const CreateListingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isPremiumSelected, setIsPremiumSelected] = useState(false);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  
  // Mock verification status - in real app, this would come from user context or API
  const [verificationStatus, setVerificationStatus] = useState<'unverified' | 'pending' | 'verified' | 'rejected'>('unverified');

  const form = useForm<ListingFormValues>({
    defaultValues: {
      title: '',
      description: '',
      location: '',
      rent: 0,
      moveInDate: '',
      roomType: 'private',
      bathrooms: 'private',
      furnished: false,
      parking: false,
      utilities: false,
      wifi: false,
      laundry: false,
      airConditioning: false,
      smoking: false,
      pets: false,
      gender: 'any',
      idealRoommateDesc: '',
      lookingFor: [],
    },
  });

  // Check if user needs verification
  if (!user) {
    return (
      <div className="container max-w-xl py-16 mx-auto px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to create a listing</h1>
          <div className="space-x-4">
            <Button asChild variant="outline">
              <a href="/login">Login</a>
            </Button>
            <Button asChild>
              <a href="/register">Sign Up</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (verificationStatus !== 'verified') {
    return (
      <div className="container max-w-2xl py-8 mx-auto px-4">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <h1 className="text-3xl font-bold mb-2">Create Your Listing</h1>
          <p className="text-gray-600">Complete identity verification to start creating listings</p>
        </div>
        
        <IdentityVerification 
          currentStatus={verificationStatus}
          onVerificationSubmit={(data) => {
            console.log('Verification data:', data);
            setVerificationStatus('pending');
          }}
        />
      </div>
    );
  }

  // Handle form submission
  const onSubmit = (data: ListingFormValues) => {
    console.log('Form data submitted:', data);
    // After processing form, move to premium selection step
    setStep(3);
  };

  // Handle image uploads
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    const newImagePreviews = files.map(file => URL.createObjectURL(file));
    
    setImagePreview(prev => [...prev, ...newImagePreviews]);
    
    // Update form data with new files
    const existingImages = form.getValues('images') || [];
    form.setValue('images', [...existingImages, ...files]);
  };

  // Finalize listing creation
  const handleFinalize = () => {
    const formData = form.getValues();
    console.log('Creating listing with data:', formData);
    console.log('Premium boost selected:', isPremiumSelected);
    
    toast.success("Your listing has been created!");
    
    if (isPremiumSelected) {
      navigate('/payment');
    } else {
      navigate('/profile');
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="container max-w-4xl py-8 mx-auto px-4">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={handleCancel}
          className="mb-4"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <h1 className="text-3xl font-bold mb-2">Create Your Listing</h1>
        <p className="text-gray-600">Find your perfect roommate by creating a detailed listing</p>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-8">
          <div 
            className="bg-primary h-2.5 rounded-full" 
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>Basic Info</span>
          <span>Preferences</span>
          <span>Review</span>
        </div>
      </div>

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {step === 1 && (
              <>
                <CardHeader>
                  <CardTitle>Listing Details</CardTitle>
                  <CardDescription>
                    Provide basic information about your property
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Listing Title</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., Cozy Room in Downtown Apartment" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your space, neighborhood, and living environment" 
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., Victoria Island, Lagos" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Rent (₦)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              placeholder="E.g., 150000"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="moveInDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Available From</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="roomType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select room type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="private">Private Room</SelectItem>
                              <SelectItem value="shared">Shared Room</SelectItem>
                              <SelectItem value="entire">Entire Property</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Amenities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="furnished"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">Furnished</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="parking"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">Parking</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="utilities"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">Utilities Included</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="wifi"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">WiFi Included</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="laundry"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">In-unit Laundry</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="airConditioning"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">Air Conditioning</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Photos</h3>
                    <div className="mb-4">
                      <label className="block mb-2">Upload Images (max 5)</label>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                        {imagePreview.map((url, index) => (
                          <div key={index} className="relative h-24 bg-gray-100 rounded border">
                            <img 
                              src={url} 
                              alt={`Preview ${index+1}`} 
                              className="h-full w-full object-cover rounded"
                            />
                          </div>
                        ))}

                        {imagePreview.length < 5 && (
                          <label className="border-2 border-dashed h-24 rounded flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <Upload className="h-6 w-6 text-gray-400" />
                            <span className="mt-1 text-xs text-gray-500">Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              multiple
                              onChange={handleImageUpload}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {step === 2 && (
              <>
                <CardHeader>
                  <CardTitle>Roommate Preferences</CardTitle>
                  <CardDescription>
                    Tell potential roommates what you're looking for
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="smoking"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox 
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Smoking Allowed</FormLabel>
                            <FormDescription>Check if smoking is permitted in the property</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pets"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox 
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Pets Allowed</FormLabel>
                            <FormDescription>Check if pets are permitted in the property</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select preferred gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="any">Any Gender</SelectItem>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="idealRoommateDesc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Describe Your Ideal Roommate</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What are you looking for in a roommate? Lifestyle, habits, etc." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Roommate Qualities */}
                  <div className="space-y-4">
                    <div>
                      <FormLabel>Looking For (select all that apply)</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {[
                          "Clean", "Quiet", "Organized", "Social", "Professional", 
                          "Student", "Early riser", "Night owl"
                        ].map((quality) => (
                          <FormField
                            key={quality}
                            control={form.control}
                            name="lookingFor"
                            render={() => (
                              <FormItem>
                                <div className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={quality} 
                                    onCheckedChange={(checked) => {
                                      const currentValues = form.getValues("lookingFor") || [];
                                      if (checked) {
                                        form.setValue("lookingFor", [...currentValues, quality]);
                                      } else {
                                        form.setValue(
                                          "lookingFor", 
                                          currentValues.filter((val) => val !== quality)
                                        );
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={quality}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {quality}
                                  </label>
                                </div>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {step === 3 && (
              <>
                <CardHeader>
                  <CardTitle>Boost Your Listing</CardTitle>
                  <CardDescription>
                    Get more visibility with a premium listing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Tabs defaultValue="regular">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="regular">Regular Listing</TabsTrigger>
                      <TabsTrigger value="premium">Premium Listing</TabsTrigger>
                    </TabsList>
                    <TabsContent value="regular" className="p-4 border rounded-md mt-4">
                      <div className="text-center py-6">
                        <h4 className="text-lg font-bold mb-1">Basic Listing</h4>
                        <p className="text-2xl font-bold mb-4">Free</p>
                        <ul className="text-sm text-gray-600 space-y-2 mb-6">
                          <li className="flex items-center justify-center">
                            <Check className="h-4 w-4 mr-2 text-green-500" /> 
                            Standard listing visibility
                          </li>
                          <li className="flex items-center justify-center">
                            <Check className="h-4 w-4 mr-2 text-green-500" /> 
                            Basic search placement
                          </li>
                        </ul>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsPremiumSelected(false)}
                          className="w-full"
                        >
                          Continue with Basic
                        </Button>
                      </div>
                    </TabsContent>
                    <TabsContent value="premium" className="p-4 border-2 border-primary rounded-md mt-4 bg-paired-50">
                      <div className="text-center py-6">
                        <Badge className="mb-2 bg-gradient-to-r from-amber-500 to-yellow-500">RECOMMENDED</Badge>
                        <h4 className="text-lg font-bold mb-1">Premium Listing</h4>
                        <p className="text-2xl font-bold mb-4">₦7,000</p>
                        <ul className="text-sm text-gray-600 space-y-2 mb-6">
                          <li className="flex items-center justify-center">
                            <Check className="h-4 w-4 mr-2 text-green-500" /> 
                            <strong>Featured on homepage</strong>
                          </li>
                          <li className="flex items-center justify-center">
                            <Check className="h-4 w-4 mr-2 text-green-500" /> 
                            <strong>Priority in search results</strong>
                          </li>
                          <li className="flex items-center justify-center">
                            <Check className="h-4 w-4 mr-2 text-green-500" /> 
                            <strong>Premium badge on listing</strong>
                          </li>
                          <li className="flex items-center justify-center">
                            <Check className="h-4 w-4 mr-2 text-green-500" /> 
                            <strong>30-day featured status</strong>
                          </li>
                        </ul>
                        <Button 
                          onClick={() => setIsPremiumSelected(true)}
                          className="w-full"
                        >
                          Select Premium
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="bg-paired-50 p-4 rounded-md flex items-start">
                    <Info className="h-5 w-5 mr-2 text-paired-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600">
                      Premium listings receive <strong>5x more inquiries</strong> on average compared to basic listings. 
                      Get your room filled faster with priority placement!
                    </p>
                  </div>
                </CardContent>
              </>
            )}

            <CardFooter className="flex justify-between">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
              
              {step < 3 ? (
                <Button type="button" onClick={() => setStep(step + 1)}>
                  Continue
                </Button>
              ) : (
                <Button type="button" onClick={handleFinalize}>
                  {isPremiumSelected ? 'Continue to Payment' : 'Create Listing'}
                </Button>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default CreateListingPage;
