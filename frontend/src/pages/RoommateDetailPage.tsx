
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, ArrowLeft, Calendar, MapPin, Briefcase, User } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MOCK_ROOMMATES } from '@/data/roommates';

const RoommateDetailPage = () => {
  const { id } = useParams();
  const roommate = MOCK_ROOMMATES.find(r => r.id === id);

  if (!roommate) {
    return (
      <>
        <Header />
        <div className="container px-4 py-8 mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Roommate Not Found</h1>
            <Button asChild>
              <Link to="/roommates">Back to Find Roommates</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container px-4 py-8 mx-auto max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/roommates">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Find Roommates
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  {roommate.profilePic ? (
                    <img
                      src={roommate.profilePic}
                      alt={`${roommate.name}'s profile`}
                      className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-paired-100"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full mx-auto bg-paired-100 flex items-center justify-center border-4 border-paired-200">
                      <User className="w-16 h-16 text-paired-400" />
                    </div>
                  )}
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">{roommate.name}</h1>
                <Badge className="bg-paired-100 text-paired-700 mb-4">{roommate.age} years old</Badge>

                <div className="space-y-3 text-left">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{roommate.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Briefcase className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{roommate.occupation}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">Move-in: {new Date(roommate.moveInDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <Button asChild className="w-full mt-6">
                  <Link to={`/messages/${roommate.id}`}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About {roommate.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{roommate.bio}</p>
              </CardContent>
            </Card>

            {/* Lifestyle */}
            <Card>
              <CardHeader>
                <CardTitle>Lifestyle & Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {roommate.lifestyle.map((trait, index) => (
                    <Badge key={index} variant="outline" className="bg-paired-50">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Interests */}
            <Card>
              <CardHeader>
                <CardTitle>Interests & Hobbies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {roommate.interests.map((interest, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* What They're Looking For */}
            <Card>
              <CardHeader>
                <CardTitle>What I'm Looking For</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{roommate.lookingFor}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RoommateDetailPage;
