
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RoommateAIChat from "@/components/RoommateAIChat";
import RoommateFilters from "@/components/RoommateFilters";
import MobileFilters from "@/components/MobileFilters";
import RoommateTabsContent from "@/components/RoommateTabsContent";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";

// Updated Roommate type to match backend
export type Roommate = {
  id: string;
  first_name: string;
  last_name_initial: string;
  bio: string;
  profile_image_url: string;
  compatibility_score: number;
  // Add other fields as needed from UserPublicProfile
};

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const RoommateFinder = () => {
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("discover");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch both recommendations and random listings
        const [recsResponse, listingsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/matches/recommendations`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/listings/random`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (!recsResponse.ok) throw new Error('Failed to fetch recommendations');
        if (!listingsResponse.ok) throw new Error('Failed to fetch listings');

        const recsData = await recsResponse.json();
        const listingsData = await listingsResponse.json();

        const formattedRoommates = recsData.map((rec: any) => ({
          id: rec.user.id,
          first_name: rec.user.first_name,
          last_name_initial: rec.user.last_name_initial,
          bio: rec.user.bio,
          profile_image_url: rec.user.profile_image_url,
          compatibility_score: rec.compatibility_score,
        }));

        setRoommates([...formattedRoommates, ...listingsData]);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load initial data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [token]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        query: searchQuery,
        location: selectedLocation,
      }).toString();

      const response = await fetch(`${API_BASE_URL}/matches/search?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to perform search');
      }

      const data = await response.json();
      setRoommates(data);
      setActiveTab("discover"); // Switch to discover tab to show search results
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Search failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (userId: string, action: 'like' | 'dislike') => {
    if (!token) return;
    try {
      await fetch(`${API_BASE_URL}/matches/${userId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });
      toast.success(`User ${action}d!`);
    } catch (error) {
      toast.error(`Failed to ${action} user.`);
    }
  };

  const locations: string[] = []; // Locations would now come from backend data or a separate endpoint

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-paired-50">
        <div className="container px-4 py-8 mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Find Roommates</h1>
            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Filters Sidebar - desktop */}
            <div className="hidden lg:block">
              <div className="sticky top-20 space-y-6">
                <RoommateFilters
                  searchQuery={searchQuery}
                  selectedLocation={selectedLocation}
                  locations={locations}
                  onSearchQueryChange={setSearchQuery}
                  onLocationChange={setSelectedLocation}
                  onSubmit={handleSearch}
                />

                {/* AI Chat Assistant */}
                <RoommateAIChat />
              </div>
            </div>

            {/* Mobile filters */}
            <MobileFilters
              isOpen={isFilterOpen}
              searchQuery={searchQuery}
              selectedLocation={selectedLocation}
              locations={locations}
              onSearchQueryChange={setSearchQuery}
              onLocationChange={setSelectedLocation}
              onSubmit={handleSearch}
              onClose={() => setIsFilterOpen(false)}
            />

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* AI Chat for Mobile */}
              <div className="lg:hidden mb-6">
                <RoommateAIChat />
              </div>

              {/* Tabs */}
              <RoommateTabsContent
                activeTab={activeTab}
                isLoading={isLoading}
                filteredRoommates={roommates}
                onTabChange={setActiveTab}
                onAction={handleAction}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RoommateFinder;
