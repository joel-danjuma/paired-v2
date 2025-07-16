
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RoommateCard from "@/components/RoommateCard";
import { Roommate } from "@/pages/RoommateFinder"; // Assuming type is exported from page
import { Skeleton } from "@/components/ui/skeleton";

type RoommateTabsContentProps = {
  activeTab: string;
  filteredRoommates: Roommate[];
  onTabChange: (tab: string) => void;
  isLoading: boolean;
  onAction: (userId: string, action: 'like' | 'dislike') => void;
};

const RoommateTabsContent = ({
  activeTab,
  filteredRoommates,
  onTabChange,
  isLoading,
  onAction,
}: RoommateTabsContentProps) => {
  const renderSkeletons = () => (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
  
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="mb-6">
      <TabsList>
        <TabsTrigger value="discover">Discover</TabsTrigger>
        <TabsTrigger value="ai-matches">AI Matches</TabsTrigger>
      </TabsList>
      
      <TabsContent value="discover">
        {isLoading ? renderSkeletons() : filteredRoommates.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRoommates.map((roommate) => (
              <RoommateCard 
                key={roommate.id} 
                roommate={roommate} 
                onAction={onAction}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center bg-white rounded-lg">
            <h3 className="text-lg font-medium text-gray-900">
              No roommates found
            </h3>
            <p className="mt-2 text-gray-600">
              Try adjusting your search criteria or check back later.
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="ai-matches">
        <div className="py-12 text-center bg-white rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">
            No AI matches yet
          </h3>
          <p className="mt-2 text-gray-600">
            Use the AI chat to get personalized roommate suggestions
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default RoommateTabsContent;
