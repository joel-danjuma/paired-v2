
import { Roommate, MOCK_ROOMMATES } from "@/data/roommates";

// Parse user query to extract preferences
export const parseUserQuery = (query: string): Record<string, boolean> => {
  const preferences: Record<string, boolean> = {};
  const lowercaseQuery = query.toLowerCase();
  
  // Check for common lifestyle preferences
  if (lowercaseQuery.includes("clean") || lowercaseQuery.includes("tidy")) {
    preferences.clean = true;
  }
  
  if (lowercaseQuery.includes("quiet") || lowercaseQuery.includes("peaceful")) {
    preferences.quiet = true;
  }
  
  if (lowercaseQuery.includes("social") || lowercaseQuery.includes("friendly")) {
    preferences.social = true;
  }
  
  if (lowercaseQuery.includes("professional") || lowercaseQuery.includes("work")) {
    preferences.professional = true;
  }

  if (lowercaseQuery.includes("student") || lowercaseQuery.includes("study")) {
    preferences.student = true;
  }

  return preferences;
};

// Find matching roommates based on parsed preferences
export const findMatchingRoommates = (preferences: Record<string, boolean>): Roommate[] => {
  // Return some random roommates when no clear preferences, or all roommates match the criteria
  if (Object.keys(preferences).length === 0) {
    return MOCK_ROOMMATES.slice(0, 3);
  }

  // Filter roommates based on preferences
  return MOCK_ROOMMATES.filter(roommate => {
    const lifestyle = roommate.lifestyle.map(l => l.toLowerCase());
    const bio = roommate.bio.toLowerCase();
    
    // Check each preference against roommate data
    for (const [key, value] of Object.entries(preferences)) {
      if (value) {
        if (key === 'clean' && (lifestyle.includes('clean') || lifestyle.includes('tidy'))) {
          return true;
        }
        if (key === 'quiet' && (lifestyle.includes('quiet') || bio.includes('quiet'))) {
          return true;
        }
        if (key === 'social' && (lifestyle.includes('social') || bio.includes('social'))) {
          return true;
        }
        if (key === 'professional' && roommate.occupation.toLowerCase().includes('professional')) {
          return true;
        }
        if (key === 'student' && roommate.occupation.toLowerCase().includes('student')) {
          return true;
        }
      }
    }
    
    return false;
  }).slice(0, 5); // Limit to top 5 matches
};

// Create AI response based on preferences
export const createAIResponse = (preferences: Record<string, boolean>, roommates: Roommate[]): string => {
  if (Object.keys(preferences).length === 0) {
    return `I found ${roommates.length} potential roommates that might be interesting for you. Take a look at their profiles below!`;
  }

  const preferencesList = Object.entries(preferences)
    .filter(([_, value]) => value)
    .map(([key]) => key)
    .join(", ");

  return `Based on your preference for ${preferencesList}, I found ${roommates.length} potential roommates that might be a good match. Check out their profiles below!`;
};
