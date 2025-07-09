
import { Post } from "@/components/PostCard";

export const MOCK_POSTS: Post[] = [
  {
    id: "1",
    title: "Modern 2-Bedroom Apartment in Victoria Island",
    description: "Spacious and well-furnished apartment with modern amenities. Perfect for professionals. Close to shopping centers and business district.",
    location: "Victoria Island, Lagos",
    rent: 180000,
    moveInDate: "2024-01-15",
    amenities: ["WiFi", "Air Conditioning", "Parking", "Security", "Generator"],
    user: {
      id: "user1",
      name: "Adebayo Johnson",
      profilePic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
    },
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=350&fit=crop"]
  },
  {
    id: "2",
    title: "Cozy Studio in Lekki Phase 1",
    description: "Perfect for a young professional. Fully furnished studio apartment with kitchen facilities and reliable power supply.",
    location: "Lekki Phase 1, Lagos",
    rent: 120000,
    moveInDate: "2024-02-01",
    amenities: ["WiFi", "Furnished", "Kitchen", "24/7 Power", "Security"],
    user: {
      id: "user2",
      name: "Fatima Abdullahi",
      profilePic: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop"
    },
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=350&fit=crop"]
  },
  {
    id: "3",
    title: "Shared Room in Surulere",
    description: "Affordable shared accommodation in a quiet neighborhood. Great for students and young professionals just starting out.",
    location: "Surulere, Lagos",
    rent: 45000,
    moveInDate: "2024-01-20",
    amenities: ["Shared Kitchen", "WiFi", "Security", "Bus Stop Nearby"],
    user: {
      id: "user3",
      name: "Chinedu Okafor",
      profilePic: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
    },
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=350&fit=crop"]
  },
  {
    id: "4",
    title: "Executive 3-Bedroom Flat in Ikoyi",
    description: "Luxury apartment with sea view. Perfect for executives and expatriates. Premium location with top-notch facilities.",
    location: "Ikoyi, Lagos",
    rent: 350000,
    moveInDate: "2024-02-15",
    amenities: ["Sea View", "Gym", "Pool", "24/7 Power", "Security", "Parking", "WiFi"],
    user: {
      id: "user4",
      name: "Kemi Adeleke",
      profilePic: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
    },
    images: ["https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=500&h=350&fit=crop"]
  },
  {
    id: "5",
    title: "Student-Friendly Room in Yaba",
    description: "Affordable accommodation perfect for university students. Close to University of Lagos and other institutions.",
    location: "Yaba, Lagos",
    rent: 35000,
    moveInDate: "2024-01-30",
    amenities: ["Shared Kitchen", "Study Area", "WiFi", "Security", "Close to University"],
    user: {
      id: "user5",
      name: "Tunde Bakare",
      profilePic: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop"
    },
    images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500&h=350&fit=crop"]
  },
  {
    id: "6",
    title: "1-Bedroom Apartment in Ikeja GRA",
    description: "Well-maintained apartment in a serene environment. Perfect for young couples or single professionals.",
    location: "Ikeja GRA, Lagos",
    rent: 95000,
    moveInDate: "2024-02-10",
    amenities: ["Generator", "Security", "Parking", "WiFi", "Kitchen"],
    user: {
      id: "user6",
      name: "Aisha Mohammed",
      profilePic: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop"
    },
    images: ["https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500&h=350&fit=crop"]
  },
  {
    id: "7",
    title: "Luxury Penthouse in Banana Island",
    description: "Ultra-luxury penthouse with panoramic views. Premium amenities and world-class facilities for the discerning resident.",
    location: "Banana Island, Lagos",
    rent: 800000,
    moveInDate: "2024-03-01",
    amenities: ["Panoramic View", "Private Pool", "Gym", "Concierge", "24/7 Power", "Security"],
    user: {
      id: "user7",
      name: "Olumide Fashina",
      profilePic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
    },
    images: ["https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=500&h=350&fit=crop"]
  },
  {
    id: "8",
    title: "Affordable Room in Agege",
    description: "Budget-friendly accommodation in a developing area. Great for those looking to save on rent while staying connected to the city.",
    location: "Agege, Lagos",
    rent: 28000,
    moveInDate: "2024-01-25",
    amenities: ["Shared Facilities", "Security", "Bus Stop", "Market Nearby"],
    user: {
      id: "user8",
      name: "Blessing Okoro",
      profilePic: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop"
    },
    images: ["https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&h=350&fit=crop"]
  },
  {
    id: "9",
    title: "2-Bedroom Duplex in Magodo",
    description: "Spacious duplex in a gated estate. Family-friendly environment with good security and recreational facilities.",
    location: "Magodo, Lagos",
    rent: 220000,
    moveInDate: "2024-02-20",
    amenities: ["Gated Estate", "Swimming Pool", "Playground", "24/7 Security", "Generator"],
    user: {
      id: "user9",
      name: "Ibrahim Yusuf",
      profilePic: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
    },
    images: ["https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500&h=350&fit=crop"]
  },
  {
    id: "10",
    title: "Modern Studio in Gbagada",
    description: "Newly renovated studio apartment with contemporary fittings. Ideal for young professionals starting their career.",
    location: "Gbagada, Lagos",
    rent: 75000,
    moveInDate: "2024-02-05",
    amenities: ["Modern Fittings", "WiFi", "Kitchen", "Security", "Parking"],
    user: {
      id: "user10",
      name: "Grace Eze",
      profilePic: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
    },
    images: ["https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=500&h=350&fit=crop"]
  }
];
