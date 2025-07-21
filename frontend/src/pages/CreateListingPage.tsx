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
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River',
  'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT - Abuja'
];

type ListingFormValues = {
  title: string;
  description: string;
  location: string;
  rent: number | undefined;
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
  const { user, token } = useAuth();
  const [step, setStep] = useState(1);
  const [listingIntent, setListingIntent] = useState(''); // 'offer-room' or 'seek-room'
  const [isPremiumSelected, setIsPremiumSelected] = useState(false);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  const form = useForm<ListingFormValues>({
    defaultValues: {
      title: '',
      description: '',
      location: '',
      rent: undefined, // No default - user must enter their own price
      moveInDate: '',
      roomType: '', // No default - user must choose
      bathrooms: '', // No default - user must choose
      furnished: false,
      parking: false,
      utilities: false,
      wifi: false,
      laundry: false,
      airConditioning: false,
      smoking: false,
      pets: false,
      gender: '', // No default - user must choose
      idealRoommateDesc: '',
      lookingFor: [],
    },
  });

  // Check if user is logged in
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
  const handleFinalize = async () => {
    if (!token) {
      toast.error("Please log in to create a listing");
      return;
    }

    if (!listingIntent) {
      toast.error('Please select a listing type first');
      setStep(1);
      return;
    }

    const formData = form.getValues();
    console.log('Creating listing with data:', formData);
    console.log('Premium boost selected:', isPremiumSelected);
    console.log('Listing intent:', listingIntent);

    try {
      // Determine listing type based on intent
      let listing_type;
      if (listingIntent === 'offer-room') {
        listing_type = 'room';
      } else if (listingIntent === 'seek-roommate') {
        listing_type = 'roommate_wanted';
      } else {
        throw new Error('Please select listing type first');
      }

      // Prepare listing data to match backend schema exactly
      const listingData = {
        listing_type: listing_type,
        title: formData.title,
        description: formData.description,
        city: formData.location,
        address: formData.location,
        state: formData.location, // Using location as state for now
        price_min: formData.rent ? parseFloat(formData.rent.toString()) : null,
        price_max: formData.rent ? parseFloat(formData.rent.toString()) : null,
        available_from: formData.moveInDate ? new Date(formData.moveInDate).toISOString() : null,
        property_details: {
          room_type: formData.roomType,
          bathrooms: formData.bathrooms,
          amenities: [
            ...(formData.furnished ? ['Furnished'] : []),
            ...(formData.parking ? ['Parking'] : []),
            ...(formData.utilities ? ['Utilities Included'] : []),
            ...(formData.wifi ? ['WiFi'] : []),
            ...(formData.laundry ? ['Laundry'] : []),
            ...(formData.airConditioning ? ['Air Conditioning'] : [])
          ]
        },
        lifestyle_preferences: {
          smoking_allowed: formData.smoking,
          pets_allowed: formData.pets,
          preferred_gender: formData.gender,
          ideal_roommate_description: formData.idealRoommateDesc,
          looking_for: formData.lookingFor
        },
        images: [] // Empty array for now
      };

      console.log('Sending listing data:', listingData);

      const response = await fetch(`${API_BASE_URL}/listings/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(listingData)
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
        
        throw new Error(errorData.detail || 'Failed to create listing');
      }

      const createdListing = await response.json();
      console.log('Listing created successfully:', createdListing);
      
      toast.success("Your listing has been created!");
      
      if (isPremiumSelected) {
        navigate('/payment', { 
          state: { 
            plan: 'premium', 
            amount: 7000,
            listingId: createdListing.id
          } 
        });
      } else {
        navigate('/my-listings');
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create listing');
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
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
            {step === 1 && !listingIntent && (
              <>
                <CardHeader>
                  <CardTitle>What would you like to do?</CardTitle>
                  <CardDescription>
                    Choose your listing type to get started
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div 
                      className="p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      onClick={() => {
                        setListingIntent('offer-room');
                        setStep(2);
                      }}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-4">🏡</div>
                        <h3 className="text-lg font-semibold mb-2">I have a room to offer</h3>
                        <p className="text-gray-600 text-sm">List your available room or property for potential roommates</p>
                      </div>
                    </div>

                    <div 
                      className="p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors"
                      onClick={() => {
                        setListingIntent('seek-roommate');
                        setStep(2);
                      }}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-4">🏠</div>
                        <h3 className="text-lg font-semibold mb-2">I'm looking for a room</h3>
                        <p className="text-gray-600 text-sm">Create a profile to find rooms and connect with potential roommates</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {step === 2 && listingIntent === 'offer-room' && (
              <>
                <CardHeader>
                  <CardTitle>Room Details</CardTitle>
                  <CardDescription>
                    Provide basic information about your available room
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
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} 
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

            {step === 2 && listingIntent === 'seek-roommate' && (
              <>
                <CardHeader>
                  <CardTitle>About You & Your Preferences</CardTitle>
                  <CardDescription>
                    Tell potential roommates about yourself and what you're looking for
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Headline</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., Young Professional Seeking Clean Roommate" {...field} />
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
                        <FormLabel>About Yourself</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell potential roommates about yourself, your lifestyle, work schedule, hobbies, etc."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="rent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget Range (₦)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 50000"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum monthly rent you can afford
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Location</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select preferred state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {NIGERIAN_STATES.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Lifestyle Preferences</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              <FormLabel>I smoke</FormLabel>
                              <FormDescription>Check if you smoke</FormDescription>
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
                              <FormLabel>I have pets</FormLabel>
                              <FormDescription>Check if you have pets</FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
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
              {step > 1 && listingIntent ? (
                <Button type="button" variant="outline" onClick={() => {
                  if (step === 2) {
                    setListingIntent('');
                    setStep(1);
                  } else {
                    setStep(step - 1);
                  }
                }}>
                  Back
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
              
              {step < 3 && listingIntent ? (
                <Button type="button" onClick={() => setStep(step + 1)}>
                  Continue
                </Button>
              ) : step === 3 ? (
                <Button type="button" onClick={handleFinalize}>
                  {isPremiumSelected ? 'Continue to Payment' : 'Create Listing'}
                </Button>
              ) : null}
            </CardFooter>
          </form>
        </Form>
      </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CreateListingPage;
