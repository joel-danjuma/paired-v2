import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Star, TrendingUp, Eye, MessageSquare, CheckCircle, Crown, Zap } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ProfilePromotionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('');

  // Mock data for demonstration
  const profileStats = {
    views: 147,
    messages: 23,
    favorites: 8,
    completeness: 85
  };

  const promotionPlans = [
    {
      id: 'featured',
      name: 'Featured Profile',
      price: 2000,
      duration: '7 days',
      icon: <Star className="w-6 h-6" />,
      color: 'bg-blue-600',
      benefits: [
        'Appear in "Featured Seekers" section',
        '3x more profile views',
        'Priority in search results',
        'Enhanced profile badge'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Boost',
      price: 5000,
      duration: '30 days',
      icon: <Crown className="w-6 h-6" />,
      color: 'bg-purple-600',
      benefits: [
        'All Featured Profile benefits',
        'Top position in all searches',
        '5x more profile views',
        'Premium seeker badge',
        'Advanced analytics',
        'Priority customer support'
      ]
    },
    {
      id: 'super',
      name: 'Super Boost',
      price: 8000,
      duration: '30 days',
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-orange-600',
      benefits: [
        'All Premium benefits',
        'Highlighted in room listings',
        '10x more visibility',
        'Super seeker badge',
        'Profile auto-promotion to relevant providers',
        'Express message delivery'
      ]
    }
  ];

  const completenessChecks = [
    { item: 'Profile photo', completed: !!user?.profilePic },
    { item: 'Bio description', completed: true },
    { item: 'Lifestyle preferences', completed: true },
    { item: 'Budget range', completed: false },
    { item: 'Preferred locations', completed: true },
    { item: 'Contact information', completed: true }
  ];

  const handlePurchase = (planId: string) => {
    // Navigate to payment page with plan details
    navigate(`/payment?type=promotion&plan=${planId}`);
  };

  if (!user || user.user_type !== 'seeker') {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-4">This feature is only available for room seekers.</p>
              <Button onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Boost Your Profile</h1>
            <p className="text-gray-600">Get noticed by more room providers and find your perfect room faster</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Stats and Optimization */}
            <div className="lg:col-span-1 space-y-6">
              {/* Current Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Your Profile Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Profile Views</span>
                    </div>
                    <span className="font-semibold">{profileStats.views}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Messages Received</span>
                    </div>
                    <span className="font-semibold">{profileStats.messages}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">Favorites</span>
                    </div>
                    <span className="font-semibold">{profileStats.favorites}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Completeness */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Completeness</CardTitle>
                  <CardDescription>
                    Complete profiles get 3x more views
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-500">{profileStats.completeness}%</span>
                  </div>
                  <Progress value={profileStats.completeness} className="w-full" />
                  
                  <div className="space-y-2">
                    {completenessChecks.map((check, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle 
                          className={`w-4 h-4 ${
                            check.completed ? 'text-green-500' : 'text-gray-300'
                          }`} 
                        />
                        <span className={`text-sm ${
                          check.completed ? 'text-gray-700' : 'text-gray-500'
                        }`}>
                          {check.item}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/profile/edit')}
                    className="w-full"
                  >
                    Complete Profile
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Promotion Plans */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Choose Your Promotion Plan</CardTitle>
                  <CardDescription>
                    Increase your visibility and get noticed by more room providers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="plans">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="plans">Promotion Plans</TabsTrigger>
                      <TabsTrigger value="comparison">Compare Plans</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="plans" className="space-y-6 mt-6">
                      <div className="grid gap-6">
                        {promotionPlans.map((plan) => (
                          <Card 
                            key={plan.id} 
                            className={`relative overflow-hidden ${
                              selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''
                            }`}
                          >
                            <div className={`absolute top-0 left-0 right-0 h-1 ${plan.color}`}></div>
                            <CardHeader className="pb-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${plan.color} text-white`}>
                                    {plan.icon}
                                  </div>
                                  <div>
                                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                                    <CardDescription>{plan.duration}</CardDescription>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold">₦{plan.price.toLocaleString()}</div>
                                  <div className="text-sm text-gray-500">one-time</div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid gap-2">
                                {plan.benefits.map((benefit, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span className="text-sm">{benefit}</span>
                                  </div>
                                ))}
                              </div>
                              
                              <Button 
                                onClick={() => handlePurchase(plan.id)}
                                className={`w-full ${plan.color} hover:opacity-90`}
                              >
                                Choose {plan.name}
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="comparison" className="mt-6">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-4">Feature</th>
                              <th className="text-center p-4">Featured</th>
                              <th className="text-center p-4">Premium</th>
                              <th className="text-center p-4">Super</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="p-4">Profile views boost</td>
                              <td className="text-center p-4">3x</td>
                              <td className="text-center p-4">5x</td>
                              <td className="text-center p-4">10x</td>
                            </tr>
                            <tr className="border-b">
                              <td className="p-4">Featured section</td>
                              <td className="text-center p-4">✓</td>
                              <td className="text-center p-4">✓</td>
                              <td className="text-center p-4">✓</td>
                            </tr>
                            <tr className="border-b">
                              <td className="p-4">Priority in search</td>
                              <td className="text-center p-4">✓</td>
                              <td className="text-center p-4">✓</td>
                              <td className="text-center p-4">✓</td>
                            </tr>
                            <tr className="border-b">
                              <td className="p-4">Advanced analytics</td>
                              <td className="text-center p-4">-</td>
                              <td className="text-center p-4">✓</td>
                              <td className="text-center p-4">✓</td>
                            </tr>
                            <tr className="border-b">
                              <td className="p-4">Auto-promotion</td>
                              <td className="text-center p-4">-</td>
                              <td className="text-center p-4">-</td>
                              <td className="text-center p-4">✓</td>
                            </tr>
                            <tr>
                              <td className="p-4">Duration</td>
                              <td className="text-center p-4">7 days</td>
                              <td className="text-center p-4">30 days</td>
                              <td className="text-center p-4">30 days</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProfilePromotionPage; 