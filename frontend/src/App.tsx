
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Lazy load components
const HomePage = lazy(() => import("./pages/HomePage"));
const PostsPage = lazy(() => import("./pages/PostsPage"));
const PostDetailPage = lazy(() => import("./pages/PostDetailPage"));
const CreateListingPage = lazy(() => import("./pages/CreateListingPage"));
const EditListingPage = lazy(() => import("./pages/EditListingPage"));
const MyListingsPage = lazy(() => import("./pages/MyListingsPage"));
const BoostListingPage = lazy(() => import("./pages/BoostListingPage"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const EditProfilePage = lazy(() => import("./pages/EditProfilePage"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const RoommateFinder = lazy(() => import("./pages/RoommateFinder"));
const RoommateDetailPage = lazy(() => import("./pages/RoommateDetailPage"));
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/posts" element={<PostsPage />} />
              <Route path="/posts/:id" element={<PostDetailPage />} />
              <Route path="/create-listing" element={<CreateListingPage />} />
              <Route path="/edit-listing/:id" element={<EditListingPage />} />
              <Route path="/my-listings" element={<MyListingsPage />} />
              <Route path="/boost-listing/:id" element={<BoostListingPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/edit" element={<EditProfilePage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/roommates" element={<RoommateFinder />} />
              <Route path="/roommates/:id" element={<RoommateDetailPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/messages/:id" element={<MessagesPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
