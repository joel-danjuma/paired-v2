import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { MapPin, Home, Wifi, Car } from 'lucide-react';

const ListingCard = ({ listing }: { listing: any }) => {
  // Handle both AI agent format and regular listing format
  const title = listing.title || `${listing.bedrooms || 1}-Bedroom ${listing.city || 'Property'}`;
  const location = listing.address ? `${listing.address}, ${listing.city}` : (listing.location || listing.city);
  const rent = listing.rent || listing.price_min;
  const amenities = listing.amenities || [];
  
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {location && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            {location}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {listing.description && (
          <p className="text-sm text-muted-foreground mb-4">
            {listing.description}
          </p>
        )}
        
        <div className="flex justify-between items-center mb-4">
          <div>
            {rent && (
              <p className="text-lg font-bold">
                ₦{typeof rent === 'number' ? rent.toLocaleString() : rent}/month
              </p>
            )}
            {listing.bedrooms && (
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <Home className="w-4 h-4 mr-1" />
                {listing.bedrooms} bedroom{listing.bedrooms > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {amenities && amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {amenities.slice(0, 3).map((amenity: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {amenities.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{amenities.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {listing.id ? (
            <Button asChild variant="outline" size="sm">
              <Link to={`/posts/${listing.id}`}>View Details</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              AI Suggestion
            </Button>
          )}
          <Button size="sm" className="bg-paired-400 hover:bg-paired-500">
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ListingCard; 