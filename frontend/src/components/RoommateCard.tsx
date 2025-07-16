
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, User, ThumbsUp, ThumbsDown } from "lucide-react";
import { Roommate } from "@/pages/RoommateFinder"; // Import from page

type RoommateCardProps = {
  roommate: Roommate;
  onAction: (userId: string, action: 'like' | 'dislike') => void;
};

const RoommateCard = ({ roommate, onAction }: RoommateCardProps) => {
  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-md">
      <div className="relative">
        <div className="aspect-square overflow-hidden bg-gray-100">
          {roommate.profile_image_url ? (
            <img
              src={roommate.profile_image_url}
              alt={`${roommate.first_name}'s profile`}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-paired-100">
              <User className="w-16 h-16 text-paired-300" />
            </div>
          )}
        </div>
        <Badge className="absolute top-2 right-2 bg-green-500 text-white">
          {Math.round(roommate.compatibility_score * 100)}% Match
        </Badge>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold line-clamp-1">{roommate.first_name} {roommate.last_name_initial}.</h3>
          </div>
        </div>

        <div className="mt-2">
          <p className="text-sm text-gray-600 line-clamp-2">{roommate.bio}</p>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={() => onAction(roommate.id, 'dislike')}>
            <ThumbsDown className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => onAction(roommate.id, 'like')}>
            <ThumbsUp className="h-4 w-4" />
          </Button>
        </div>
        <Button asChild>
          <Link to={`/roommates/${roommate.id}`}>View Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RoommateCard;
