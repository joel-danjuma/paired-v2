import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Filter, Search, MapPin, DollarSign, Calendar, Users, Wifi, Car, Home, Zap } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River',
  'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT - Abuja'
];

interface RoomListing {
  id: string;
  title: string;
  description: string;
  location: string;
  rent: number;
  room_type: string;
  furnished: boolean;
  parking: boolean;
  wifi: boolean;
  utilities: boolean;
  smoking: boolean;
  pets: boolean;
  gender: string;
  move_in_date: string;
  images: string[];
  owner_name: string;
  created_at: string;
}

const BrowseRoomsPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [rooms, setRooms] = useState<RoomListing[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<RoomListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    roomType: '',
    furnished: '',
    parking: '',
    wifi: '',
    pets: '',
    gender: ''
  });

  useEffect(() => {
    if (!user || user.user_type !== 'seeker') {
      navigate('/dashboard');
      return;
    }
    fetchRooms();
  }, [user, navigate]);

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/listings/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter for room offerings only
        const roomOffers = data.filter((listing: any) => listing.listing_type === 'room_available');
        setRooms(roomOffers);
        setFilteredRooms(roomOffers);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = rooms.filter(room => {
      const matchesSearch = room.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           room.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           room.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLocation = !filters.location || room.location === filters.location;
      
      const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : 0;
      const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity;
      const matchesPrice = room.rent >= minPrice && room.rent <= maxPrice;
      
      const matchesRoomType = !filters.roomType || room.room_type === filters.roomType;
      const matchesFurnished = !filters.furnished || 
                              (filters.furnished === 'true' ? room.furnished : !room.furnished);
      const matchesParking = !filters.parking || 
                            (filters.parking === 'true' ? room.parking : !room.parking);
      const matchesWifi = !filters.wifi || 
                         (filters.wifi === 'true' ? room.wifi : !room.wifi);
      const matchesPets = !filters.pets || 
                         (filters.pets === 'true' ? room.pets : !room.pets);
      const matchesGender = !filters.gender || room.gender === filters.gender;

      return matchesSearch && matchesLocation && matchesPrice && matchesRoomType && 
             matchesFurnished && matchesParking && matchesWifi && matchesPets && matchesGender;
    });

    setFilteredRooms(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, rooms]);

  const handleContactOwner = (roomId: string) => {
    navigate(`/messages?roomId=${roomId}`);
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      minPrice: '',
      maxPrice: '',
      roomType: '',
      furnished: '',
      parking: '',
      wifi: '',
      pets: '',
      gender: ''
    });
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading available rooms...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Available Rooms</h1>
        <p className="text-gray-600">Find your perfect room from {rooms.length} available listings</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search & Filter Rooms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by title, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select value={filters.location} onValueChange={(value) => setFilters({...filters, location: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {NIGERIAN_STATES.map((state) => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Input
                placeholder="Min Price (₦)"
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
              />
              <Input
                placeholder="Max Price (₦)"
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
              />
            </div>

            <Select value={filters.roomType} onValueChange={(value) => setFilters({...filters, roomType: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Room Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Room</SelectItem>
                <SelectItem value="shared">Shared Room</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="apartment">Entire Apartment</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.gender} onValueChange={(value) => setFilters({...filters, gender: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Gender Preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="any">Any Gender</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters.furnished === 'true' ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters({...filters, furnished: filters.furnished === 'true' ? '' : 'true'})}
            >
              <Home className="w-4 h-4 mr-1" />
              Furnished
            </Button>
            <Button
              variant={filters.parking === 'true' ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters({...filters, parking: filters.parking === 'true' ? '' : 'true'})}
            >
              <Car className="w-4 h-4 mr-1" />
              Parking
            </Button>
            <Button
              variant={filters.wifi === 'true' ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters({...filters, wifi: filters.wifi === 'true' ? '' : 'true'})}
            >
              <Wifi className="w-4 h-4 mr-1" />
              WiFi
            </Button>
            <Button
              variant={filters.pets === 'true' ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters({...filters, pets: filters.pets === 'true' ? '' : 'true'})}
            >
              🐕 Pets OK
            </Button>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">
          Showing {filteredRooms.length} of {rooms.length} rooms
        </p>
        <Button onClick={() => navigate('/create-listing')} className="bg-green-600 hover:bg-green-700">
          Post Your Room Request
        </Button>
      </div>

      {/* Room Cards Grid */}
      {filteredRooms.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-500 text-lg mb-4">
              No rooms match your criteria
            </div>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Room Image */}
              <div className="h-48 bg-gray-200 relative">
                {room.images && room.images.length > 0 ? (
                  <img
                    src={room.images[0]}
                    alt={room.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Home className="w-12 h-12" />
                  </div>
                )}
                <Badge className="absolute top-2 right-2 bg-blue-600">
                  {room.room_type.replace('_', ' ')}
                </Badge>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-1">{room.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {room.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Price and Location */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-green-600 font-semibold">
                    <DollarSign className="w-4 h-4 mr-1" />
                    ₦{room.rent.toLocaleString()}/month
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    {room.location}
                  </div>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-1">
                  {room.furnished && <Badge variant="secondary" className="text-xs">Furnished</Badge>}
                  {room.parking && <Badge variant="secondary" className="text-xs">Parking</Badge>}
                  {room.wifi && <Badge variant="secondary" className="text-xs">WiFi</Badge>}
                  {room.utilities && <Badge variant="secondary" className="text-xs">Utilities</Badge>}
                  {room.pets && <Badge variant="secondary" className="text-xs">Pets OK</Badge>}
                </div>

                {/* Move in date and Gender */}
                <div className="flex justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Available: {new Date(room.move_in_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {room.gender === 'any' ? 'Any gender' : `${room.gender} preferred`}
                  </div>
                </div>

                {/* Owner and Contact */}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-gray-600">By {room.owner_name}</span>
                  <Button 
                    size="sm" 
                    onClick={() => handleContactOwner(room.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Contact Owner
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseRoomsPage; 