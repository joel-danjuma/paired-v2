
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

type RoommateFiltersProps = {
  searchQuery: string;
  selectedLocation: string;
  locations: string[];
  onSearchQueryChange: (query: string) => void;
  onLocationChange: (location: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

const RoommateFilters = ({
  searchQuery,
  selectedLocation,
  locations,
  onSearchQueryChange,
  onLocationChange,
  onSubmit,
}: RoommateFiltersProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="search" className="block mb-2 text-sm font-medium">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="search"
                placeholder="Name, bio, interests..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block mb-2 text-sm font-medium">
              Location
            </label>
            <Select value={selectedLocation} onValueChange={onLocationChange}>
              <SelectTrigger id="location">
                <SelectValue placeholder="Any location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any location</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">
            Apply Filters
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RoommateFilters;
