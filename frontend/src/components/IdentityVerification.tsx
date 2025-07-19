
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

type IdentityVerificationProps = {
  currentStatus?: VerificationStatus;
  onVerificationSubmit?: (data: VerificationData) => void;
};

type VerificationData = {
  idType: string;
  idNumber: string;
  idDocument: File | null;
  selfieDocument: File | null;
};

const IdentityVerification = ({ 
  currentStatus = 'unverified', 
  onVerificationSubmit 
}: IdentityVerificationProps) => {
  const [formData, setFormData] = useState<VerificationData>({
    idType: '',
    idNumber: '',
    idDocument: null,
    selfieDocument: null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'idDocument' | 'selfieDocument') => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.files![0]
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.idType || !formData.idNumber || !formData.idDocument || !formData.selfieDocument) {
      toast.error('Please fill all fields and upload required documents');
      return;
    }

    onVerificationSubmit?.(formData);
    toast.success('Verification documents submitted successfully!');
  };

  const getStatusBadge = () => {
    switch (currentStatus) {
      case 'verified':
        return <Badge className="bg-green-500"><CheckCircle className="w-4 h-4 mr-1" /> Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="w-4 h-4 mr-1" /> Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500"><AlertCircle className="w-4 h-4 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">Not Verified</Badge>;
    }
  };

  if (currentStatus === 'verified') {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Identity Verified</h3>
          <p className="text-gray-600 mb-4">Your identity has been successfully verified. You can now create listings.</p>
          {getStatusBadge()}
        </CardContent>
      </Card>
    );
  }

  if (currentStatus === 'pending') {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Verification Pending</h3>
          <p className="text-gray-600 mb-4">Your documents are being reviewed. This usually takes 1-2 business days.</p>
          {getStatusBadge()}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Identity Verification Required
          {getStatusBadge()}
        </CardTitle>
        <CardDescription>
          Please verify your identity before creating listings. This helps keep our community safe and trustworthy.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="idType">ID Type</Label>
            <select
              id="idType"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-paired-500 focus:border-transparent"
              value={formData.idType}
              onChange={(e) => setFormData(prev => ({ ...prev, idType: e.target.value }))}
              required
            >
              <option value="">Select ID Type</option>
              <option value="nin">National Identification Number (NIN)</option>
              <option value="drivers_license">Driver's License</option>
              <option value="voters_card">Voter's Card</option>
              <option value="passport">International Passport</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idNumber">ID Number</Label>
            <Input
              id="idNumber"
              placeholder="Enter your ID number"
              value={formData.idNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="idDocument">ID Document Photo</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                id="idDocument"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'idDocument')}
                className="hidden"
                required
              />
              <label
                htmlFor="idDocument"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {formData.idDocument ? formData.idDocument.name : 'Upload clear photo of your ID'}
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="selfieDocument">Selfie with ID</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                id="selfieDocument"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'selfieDocument')}
                className="hidden"
                required
              />
              <label
                htmlFor="selfieDocument"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {formData.selfieDocument ? formData.selfieDocument.name : 'Upload selfie holding your ID'}
                </span>
              </label>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="font-medium text-blue-900 mb-2">Verification Requirements:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Upload a clear, legible photo of your government-issued ID</li>
              <li>• Take a selfie while holding your ID next to your face</li>
              <li>• Ensure all text on the ID is clearly visible</li>
              <li>• Use good lighting and avoid shadows or glare</li>
            </ul>
          </div>

          <Button type="submit" className="w-full">
            Submit for Verification
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default IdentityVerification;
