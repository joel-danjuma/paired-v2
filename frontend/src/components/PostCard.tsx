
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare } from 'lucide-react';

export type Post = {
  id: string;
  title: string;
  description: string;
  location: string;
  rent: number;
  moveInDate: string;
  amenities: string[];
  user: {
    id: string;
    name: string;
    profilePic?: string;
  };
  images: string[];
};

type PostCardProps = {
  post: Post;
  featured?: boolean;
};

// Array of apartment images with better quality
const apartmentImages = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=350&fit=crop", // Living room with window
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=350&fit=crop", // Modern apartment
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=350&fit=crop", // Cozy bedroom
  "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=500&h=350&fit=crop", // Kitchen area
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500&h=350&fit=crop", // Home office space
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500&h=350&fit=crop", // Contemporary kitchen
  "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=500&h=350&fit=crop", // Minimalist living room
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&h=350&fit=crop", // Bright modern dining
  "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500&h=350&fit=crop", // Luxury living room
  "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=500&h=350&fit=crop"  // Spacious apartment
];

const PostCard = ({ post, featured = false }: PostCardProps) => {
  // Get a random image from the array based on post ID for consistency
  const getRandomImage = () => {
    const randomIndex = post.id.charCodeAt(0) % apartmentImages.length;
    return apartmentImages[randomIndex];
  };

  const formattedDate = new Date(post.moveInDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  console.log('PostCard rendering for post:', post.id);

  return (
    <Card className={`overflow-hidden transition-shadow duration-300 hover:shadow-md ${featured ? 'border-paired-300 bg-paired-50' : ''}`}>
      <div className="relative">
        <img 
          src={post.images[0] || getRandomImage()}
          alt={post.title}
          className="object-cover w-full h-48"
        />
        {featured && (
          <Badge className="absolute top-2 right-2 bg-paired-500">
            Featured
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold line-clamp-1">{post.title}</h3>
            <p className="text-sm text-gray-500">{post.location}</p>
          </div>
          <p className="text-lg font-bold text-paired-700">₦{post.rent.toLocaleString()}/mo</p>
        </div>

        <div className="mt-2">
          <p className="text-sm text-gray-600 line-clamp-2">{post.description}</p>
        </div>

        <div className="flex flex-wrap gap-1 mt-3">
          {post.amenities.slice(0, 3).map((amenity, index) => (
            <Badge key={index} variant="outline" className="bg-paired-50">
              {amenity}
            </Badge>
          ))}
          {post.amenities.length > 3 && (
            <Badge variant="outline" className="bg-paired-50">
              +{post.amenities.length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex items-center mt-4 space-x-2">
          <div className="flex-shrink-0">
            {post.user.profilePic ? (
              <img 
                src={post.user.profilePic} 
                alt={post.user.name} 
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-paired-200 text-paired-700">
                {post.user.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">{post.user.name}</p>
            <p className="text-xs text-gray-500">Available {formattedDate}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <Button asChild variant="outline">
          <Link to={`/posts/${post.id}`}>View Details</Link>
        </Button>
        <Button asChild variant="ghost" size="icon" className="text-paired-600 hover:text-paired-700 hover:bg-paired-50">
          <Link to={`/messages/${post.user.id}`}>
            <MessageSquare className="w-5 h-5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
