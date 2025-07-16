import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Failed to fetch notifications");
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load notifications.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, [token]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Notifications</h1>
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : notifications.length > 0 ? (
          <ul>
            {notifications.map(notification => (
              <li key={notification.id} className="p-4 border-b">
                <h2 className="font-semibold">{notification.title}</h2>
                <p className="text-sm text-gray-600">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center text-gray-500">
            You have no new notifications.
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage; 