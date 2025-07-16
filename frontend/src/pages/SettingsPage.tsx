import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SettingsPage = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto p-4 md:p-8">
                <h1 className="text-3xl font-bold mb-8">Settings</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Account Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Settings page is under construction. Please check back later.</p>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
};

export default SettingsPage; 