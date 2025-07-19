
export type Roommate = {
  id: string;
  name: string;
  age: number;
  occupation: string;
  bio: string;
  profilePic: string;
  location: string;
  lifestyle: string[];
  interests: string[];
  lookingFor: string;
  moveInDate: string;
};

export const MOCK_ROOMMATES: Roommate[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    age: 28,
    occupation: 'Software Engineer',
    bio: 'Easy-going tech professional who enjoys cooking and occasional game nights. Clean and respectful of shared spaces. Looking for a compatible roommate in the downtown area.',
    profilePic: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=150&h=150&fit=crop',
    location: 'Downtown, San Francisco',
    lifestyle: ['Early riser', 'Tidy', 'Non-smoker', 'Social'],
    interests: ['Cooking', 'Gaming', 'Hiking', 'Technology'],
    lookingFor: 'Professional roommate who is respectful of privacy but also open to occasional shared meals and activities.',
    moveInDate: '2023-07-01',
  },
  {
    id: '2',
    name: 'Jamie Smith',
    age: 25,
    occupation: 'Digital Marketer',
    bio: 'Creative professional who works from home part-time. I love trying new restaurants, going to concerts, and weekend exploring. Looking for a roommate who has similar interests!',
    profilePic: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop',
    location: 'Mission District, San Francisco',
    lifestyle: ['Night owl', 'Clean', 'Vegetarian', 'Social'],
    interests: ['Music', 'Art', 'Food', 'Travel'],
    lookingFor: 'Someone who appreciates creative living and doesn\'t mind occasional work meetings at home.',
    moveInDate: '2023-06-15',
  },
  {
    id: '3',
    name: 'Taylor Wong',
    age: 32,
    occupation: 'Healthcare Professional',
    bio: 'Medical resident with crazy but consistent schedule. Neat, quiet, and respectful. Looking for a peaceful living situation where I can recharge after busy shifts.',
    profilePic: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop',
    location: 'SoMa, San Francisco',
    lifestyle: ['Varied schedule', 'Very clean', 'Non-smoker', 'Quiet'],
    interests: ['Reading', 'Fitness', 'Cooking', 'Documentaries'],
    lookingFor: 'Considerate roommate who values cleanliness and quieter living environment.',
    moveInDate: '2023-07-01',
  },
  {
    id: '4',
    name: 'Jordan Lee',
    age: 22,
    occupation: 'Graduate Student',
    bio: 'PhD student in environmental science. Passionate about sustainability and outdoor activities. Looking for an eco-conscious living situation with like-minded individuals.',
    profilePic: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop',
    location: 'University District, San Francisco',
    lifestyle: ['Early riser', 'Eco-friendly', 'Vegetarian', 'Active'],
    interests: ['Nature', 'Hiking', 'Gardening', 'Volunteering'],
    lookingFor: 'Environmentally conscious roommate who enjoys shared activities and community involvement.',
    moveInDate: '2023-06-01',
  },
  {
    id: '5',
    name: 'Morgan Chen',
    age: 29,
    occupation: 'Product Manager',
    bio: 'Tech professional who loves hosting small gatherings and trying new recipes. I\'m organized, sociable, but also value personal space and downtime.',
    profilePic: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&h=150&fit=crop',
    location: 'Hayes Valley, San Francisco',
    lifestyle: ['Balanced', 'Organized', 'Social', 'Clean'],
    interests: ['Cooking', 'Wine tasting', 'Tech', 'Movies'],
    lookingFor: 'Social roommate who appreciates good food, conversation, but also respects privacy.',
    moveInDate: '2023-07-15',
  },
  {
    id: '6',
    name: 'Riley Garcia',
    age: 27,
    occupation: 'Graphic Designer',
    bio: 'Creative freelancer with flexible schedule. I love art, design, and creating cozy spaces. Looking for a roommate who appreciates aesthetic living and creative energy.',
    profilePic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
    location: 'Haight-Ashbury, San Francisco',
    lifestyle: ['Night owl', 'Artistic', 'Plant lover', 'Tidy'],
    interests: ['Art', 'Design', 'Photography', 'Vintage shopping'],
    lookingFor: 'Creative individual who values aesthetic living spaces and respects artistic workflow.',
    moveInDate: '2023-06-15',
  },
  {
    id: '7',
    name: 'Quinn Rivera',
    age: 31,
    occupation: 'Music Producer',
    bio: 'Professional musician who works from home studio. I keep reasonable hours and use headphones when needed. Looking for a roommate who appreciates music and creative living.',
    profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    location: 'Outer Sunset, San Francisco',
    lifestyle: ['Varied schedule', 'Considerate', 'Musical', 'Neat'],
    interests: ['Music production', 'Live shows', 'Vinyl collecting', 'Beach walks'],
    lookingFor: 'Someone who appreciates music culture and doesn\'t mind living with a working artist.',
    moveInDate: '2023-06-10',
  },
  {
    id: '8',
    name: 'Casey Kim',
    age: 35,
    occupation: 'Financial Analyst',
    bio: 'Finance professional with regular 9-5 schedule. I enjoy fitness, quiet evenings, and occasional social outings. Looking for a compatible roommate with similar lifestyle.',
    profilePic: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop',
    location: 'Financial District, San Francisco',
    lifestyle: ['Early riser', 'Very clean', 'Minimalist', 'Fitness enthusiast'],
    interests: ['Finance', 'Running', 'Cooking', 'Podcasts'],
    lookingFor: 'Responsible professional with clean habits and similar quiet lifestyle.',
    moveInDate: '2023-07-15',
  },
  {
    id: '9',
    name: 'Avery Thompson',
    age: 26,
    occupation: 'PhD Student',
    bio: 'Focused academic who spends most days at the university. I\'m quiet, organized, and respectful of shared spaces. Looking for a calm living environment conducive to study.',
    profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    location: 'Inner Richmond, San Francisco',
    lifestyle: ['Studious', 'Quiet', 'Organized', 'Tea drinker'],
    interests: ['Academia', 'Reading', 'Chess', 'Documentaries'],
    lookingFor: 'Fellow academic or quiet professional who values peace and focus at home.',
    moveInDate: '2023-06-01',
  }
];
