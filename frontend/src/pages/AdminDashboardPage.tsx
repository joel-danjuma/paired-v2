import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const AdminDashboardPage = () => {
    const { token } = useAuth();
    const [users, setUsers] = useState<any[]>([]);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch users.",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        if (token) {
            fetchUsers();
        }
    }, [token]);

    const handleVerification = async (userId: string, isVerified: boolean) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ user_id: userId, is_verified: isVerified })
            });

            if (!response.ok) {
                throw new Error('Failed to update verification status');
            }
            toast({
                title: "Success",
                description: "User verification status updated.",
            });
            fetchUsers(); // Refresh the user list
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update verification status.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>User Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Verification Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>{user.first_name} {user.last_name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.user_type}</TableCell>
                            <TableCell>
                                {user.is_active ? 'Active' : 'Inactive'}
                            </TableCell>
                            <TableCell>
                                {user.is_verified_identity ? 'Verified' : 'Not Verified'}
                            </TableCell>
                            <TableCell className="space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleVerification(user.id, !user.is_verified_identity)}
                                >
                                    {user.is_verified_identity ? 'Un-verify' : 'Verify'}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default AdminDashboardPage; 