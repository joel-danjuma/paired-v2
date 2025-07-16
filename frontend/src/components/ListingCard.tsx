import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ListingCard = ({ listing }: { listing: any }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{listing.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {listing.description}
        </p>
        <div className="flex justify-between items-center">
          <p className="text-lg font-bold">
            ${listing.price_min} - ${listing.price_max}
          </p>
          <Link to={`/posts/${listing.id}`}>
            <Button variant="outline">View</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ListingCard; 