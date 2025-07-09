
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Header = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container px-4 py-3 mx-auto sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/3c8dca59-6766-4f42-ba05-749572556204.png" 
              alt="Paired Logo" 
              className="w-[25px] h-[15.44px]"
            />
            <span className="text-xl font-bold" style={{ color: "#2D1E57" }}>Paired App</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium ${
                location.pathname === "/" ? "text-paired-600" : "text-gray-600 hover:text-paired-600"
              }`}
            >
              Home
            </Link>
            <Link
              to="/posts"
              className={`text-sm font-medium ${
                location.pathname === "/posts" ? "text-paired-600" : "text-gray-600 hover:text-paired-600"
              }`}
            >
              Find Rooms
            </Link>
            <Link
              to="/roommates"
              className={`text-sm font-medium ${
                location.pathname === "/roommates" ? "text-paired-600" : "text-gray-600 hover:text-paired-600"
              }`}
            >
              Find Roommates
            </Link>
            {user && (
              <Link
                to="/messages"
                className={`text-sm font-medium ${
                  location.pathname === "/messages" ? "text-paired-600" : "text-gray-600 hover:text-paired-600"
                }`}
              >
                Messages
              </Link>
            )}
            {user && (
              <Link
                to="/create-listing"
                className={`text-sm font-medium ${
                  location.pathname === "/create-listing" ? "text-paired-600" : "text-gray-600 hover:text-paired-600"
                }`}
              >
                Create Listing
              </Link>
            )}
          </nav>

          {/* Desktop CTA/Login */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-paired-200 hover:bg-paired-50">
                    {user?.profilePic ? (
                      <img 
                        src={user.profilePic} 
                        alt={user.name} 
                        className="w-6 h-6 rounded-full mr-2"
                      />
                    ) : (
                      <User className="w-5 h-5 mr-2" />
                    )}
                    {user.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">View Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-listings" className="cursor-pointer">My Listings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" /> Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-paired-600">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="pt-4 pb-3 md:hidden">
            <div className="space-y-1">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 text-base text-gray-600 hover:text-paired-600"
              >
                Home
              </Link>
              <Link
                to="/posts"
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 text-base text-gray-600 hover:text-paired-600"
              >
                Find Rooms
              </Link>
              <Link
                to="/roommates"
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 text-base text-gray-600 hover:text-paired-600"
              >
                Find Roommates
              </Link>
              {user && (
                <>
                  <Link
                    to="/messages"
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 text-base text-gray-600 hover:text-paired-600"
                  >
                    Messages
                  </Link>
                  <Link
                    to="/create-listing"
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 text-base text-gray-600 hover:text-paired-600"
                  >
                    Create Listing
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 text-base text-gray-600 hover:text-paired-600"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/my-listings"
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 text-base text-gray-600 hover:text-paired-600"
                  >
                    My Listings
                  </Link>
                </>
              )}
              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full py-2 text-base text-red-600"
                  >
                    <LogOut className="w-5 h-5 mr-2" /> Log Out
                  </button>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-center py-2 rounded-md border border-paired-200 text-paired-600"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-center py-2 rounded-md bg-primary text-white"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
