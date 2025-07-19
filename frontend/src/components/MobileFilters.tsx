
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

type MobileFiltersProps = {
  isOpen: boolean;
  searchQuery: string;
  selectedLocation: string;
  locations: string[];
  onSearchQueryChange: (query: string) => void;
  onLocationChange: (location: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
};

const MobileFilters = ({
  isOpen,
  searchQuery,
  selectedLocation,
  locations,
  onSearchQueryChange,
  onLocationChange,
  onSubmit,
  onClose,
}: MobileFiltersProps) => {
  if (!isOpen) return null;

  return (
    <div className="lg:hidden bg-white p-6 rounded-lg mb-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="m-search" className="block mb-2 text-sm font-medium">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="m-search"
              placeholder="Name, bio, interests..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="m-location" className="block mb-2 text-sm font-medium">
            Location
          </label>
          <Select value={selectedLocation} onValueChange={onLocationChange}>
            <SelectTrigger id="m-location">
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

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={onClose}>
            Apply
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MobileFilters;
