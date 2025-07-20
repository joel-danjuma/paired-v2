import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Settings, Bell, Shield, Trash2, User, Mail } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  
  const [notifications, setNotifications] = useState({
    emailMessages: true,
    emailMatches: true,
    emailPromotions: false,
    pushMessages: true,
    pushMatches: true,
    pushPromotions: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showOnlineStatus: true,
    allowDirectMessages: true,
  });

  const [isDeleting, setIsDeleting] = useState(false);

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast.success("Notification preferences updated");
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
    toast.success("Privacy settings updated");
  };

  const handleDeleteAccount = async () => {
    if (!token) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch('/api/v1/users/me', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      toast.success("Account deleted successfully");
      logout();
      navigate('/');
    } catch (error) {
      toast.error("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please log in to access settings</h1>
            <Button onClick={() => navigate('/login')}>Login</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 bg-paired-50">
        <div className="container mx-auto p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="notifications" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Privacy
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="account" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Account
                </TabsTrigger>
              </TabsList>

              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Notifications</CardTitle>
                    <CardDescription>
                      Choose what email notifications you'd like to receive
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-messages">New Messages</Label>
                        <p className="text-sm text-muted-foreground">Get notified when you receive new messages</p>
                      </div>
                      <Switch
                        id="email-messages"
                        checked={notifications.emailMessages}
                        onCheckedChange={(checked) => handleNotificationChange('emailMessages', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-matches">New Matches</Label>
                        <p className="text-sm text-muted-foreground">Get notified about potential roommate matches</p>
                      </div>
                      <Switch
                        id="email-matches"
                        checked={notifications.emailMatches}
                        onCheckedChange={(checked) => handleNotificationChange('emailMatches', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-promotions">Promotions & Updates</Label>
                        <p className="text-sm text-muted-foreground">Receive updates about new features and promotions</p>
                      </div>
                      <Switch
                        id="email-promotions"
                        checked={notifications.emailPromotions}
                        onCheckedChange={(checked) => handleNotificationChange('emailPromotions', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Push Notifications</CardTitle>
                    <CardDescription>
                      Manage your push notification preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-messages">Messages</Label>
                        <p className="text-sm text-muted-foreground">Instant notifications for new messages</p>
                      </div>
                      <Switch
                        id="push-messages"
                        checked={notifications.pushMessages}
                        onCheckedChange={(checked) => handleNotificationChange('pushMessages', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-matches">Matches</Label>
                        <p className="text-sm text-muted-foreground">Get notified about new potential matches</p>
                      </div>
                      <Switch
                        id="push-matches"
                        checked={notifications.pushMatches}
                        onCheckedChange={(checked) => handleNotificationChange('pushMatches', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-promotions">Promotions</Label>
                        <p className="text-sm text-muted-foreground">Notifications about special offers</p>
                      </div>
                      <Switch
                        id="push-promotions"
                        checked={notifications.pushPromotions}
                        onCheckedChange={(checked) => handleNotificationChange('pushPromotions', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="privacy" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Visibility</CardTitle>
                    <CardDescription>
                      Control who can see your profile and information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="profile-visible">Profile Visible</Label>
                        <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
                      </div>
                      <Switch
                        id="profile-visible"
                        checked={privacy.profileVisible}
                        onCheckedChange={(checked) => handlePrivacyChange('profileVisible', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="online-status">Show Online Status</Label>
                        <p className="text-sm text-muted-foreground">Let others know when you're online</p>
                      </div>
                      <Switch
                        id="online-status"
                        checked={privacy.showOnlineStatus}
                        onCheckedChange={(checked) => handlePrivacyChange('showOnlineStatus', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="direct-messages">Allow Direct Messages</Label>
                        <p className="text-sm text-muted-foreground">Allow other users to message you directly</p>
                      </div>
                      <Switch
                        id="direct-messages"
                        checked={privacy.allowDirectMessages}
                        onCheckedChange={(checked) => handlePrivacyChange('allowDirectMessages', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Management</CardTitle>
                    <CardDescription>
                      Manage your profile information and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" onClick={() => navigate('/profile/edit')}>
                        <User className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/onboarding')}>
                        <Settings className="w-4 h-4 mr-2" />
                        Update Preferences
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="account" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                      View and manage your account details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <div className="flex items-center justify-between p-3 border rounded-md bg-muted">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{user.email}</span>
                        </div>
                        {user.is_verified_email ? (
                          <span className="text-sm text-green-600">Verified</span>
                        ) : (
                          <Button variant="outline" size="sm">Verify</Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Member Since</Label>
                      <div className="p-3 border rounded-md bg-muted">
                        <span>{new Date(user.created_at || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    <CardDescription>
                      Irreversible actions that will affect your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account, 
                            remove all your listings, and delete all your data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {isDeleting ? "Deleting..." : "Delete Account"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SettingsPage; 