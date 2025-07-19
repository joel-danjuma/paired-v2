
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [priceRange, setPriceRange] = useState([0, 500000]); // Updated for Naira
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/recommendations/listings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Failed to fetch recommendations");
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load recommendations.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecommendations();
  }, [token]);

  // Handle search query
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        query: searchQuery,
        location: selectedLocation,
        min_price: priceRange[0].toString(),
        max_price: priceRange[1].toString(),
      }).toString();

      const response = await fetch(`${API_BASE_URL}/listings/search?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Search failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter posts based on search criteria
  const filteredPosts = posts.filter((post) => {
    const matchesQuery =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation = selectedLocation === "all" || selectedLocation === ""
      ? true
      : post.location.toLowerCase().includes(selectedLocation.toLowerCase());

    const matchesPrice = post.rent >= priceRange[0] && post.rent <= priceRange[1];

    return matchesQuery && matchesLocation && matchesPrice;
  });

  // Get unique locations for filter
  const locations = Array.from(new Set(posts.map(post => 
    post.location.split(',')[0].trim()
  )));

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-paired-50">
        <div className="container px-4 py-8 mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Find Rooms</h1>
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
              <div className="sticky top-20">
                <Card>
                  <CardContent className="p-4">
                    <form onSubmit={handleSearch} className="space-y-4">
                      <div>
                        <label htmlFor="search" className="block mb-2 text-sm font-medium">
                          Search
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="search"
                            placeholder="Title, location, description..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="location" className="block mb-2 text-sm font-medium">
                          Location
                        </label>
                        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                          <SelectTrigger id="location">
                            <SelectValue placeholder="Any location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any location</SelectItem>
                            {locations.map((location) => (
                              <SelectItem key={location} value={location.toLowerCase()}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label htmlFor="price-range" className="block mb-2 text-sm font-medium">
                          Price Range (₦{priceRange[0].toLocaleString()} - ₦{priceRange[1].toLocaleString()})
                        </label>
                        <Slider
                          id="price-range"
                          min={0}
                          max={500000}
                          step={10000}
                          value={priceRange}
                          onValueChange={setPriceRange}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>₦0</span>
                          <span>₦500,000</span>
                        </div>
                      </div>

                      <Button type="submit" className="w-full">
                        Apply Filters
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Mobile filters */}
            {isFilterOpen && (
              <div className="lg:hidden col-span-full">
                <Card>
                  <CardContent className="p-4">
                    <form onSubmit={handleSearch} className="space-y-4">
                      <div>
                        <label htmlFor="mobile-search" className="block mb-2 text-sm font-medium">
                          Search
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="mobile-search"
                            placeholder="Title, location, description..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="mobile-location" className="block mb-2 text-sm font-medium">
                          Location
                        </label>
                        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                          <SelectTrigger id="mobile-location">
                            <SelectValue placeholder="Any location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any location</SelectItem>
                            {locations.map((location) => (
                              <SelectItem key={location} value={location.toLowerCase()}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label htmlFor="mobile-price-range" className="block mb-2 text-sm font-medium">
                          Price Range (₦{priceRange[0].toLocaleString()} - ₦{priceRange[1].toLocaleString()})
                        </label>
                        <Slider
                          id="mobile-price-range"
                          min={0}
                          max={500000}
                          step={10000}
                          value={priceRange}
                          onValueChange={setPriceRange}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>₦0</span>
                          <span>₦500,000</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button type="submit" className="flex-1">
                          Apply Filters
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsFilterOpen(false)}
                          className="flex-1"
                        >
                          Close
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <div className="mb-4 text-sm text-gray-600">
                Showing {posts.length} rooms
              </div>

              {isLoading ? (
                <p>Loading...</p>
              ) : posts.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center bg-white rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900">
                    No rooms found
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Try adjusting your search criteria
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PostsPage;
