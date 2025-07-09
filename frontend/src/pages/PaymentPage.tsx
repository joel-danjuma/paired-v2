
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  // Get payment details from location state
  const paymentDetails = location.state || { 
    plan: 'premium', 
    amount: 7000,
    listingId: '101'
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setFormData(prev => ({ ...prev, [name]: formatted }));
    }
    // Format expiry date with slash
    else if (name === 'expiry') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 2) {
        setFormData(prev => ({ ...prev, [name]: cleaned }));
      } else {
        const formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
        setFormData(prev => ({ ...prev, [name]: formatted }));
      }
    }
    // Limit CVV to 3 or 4 digits
    else if (name === 'cvv') {
      const cleaned = value.replace(/\D/g, '').slice(0, 4);
      setFormData(prev => ({ ...prev, [name]: cleaned }));
    }
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      
      // Simulate redirect after showing success message
      setTimeout(() => {
        toast.success("Your listing has been boosted successfully!");
        navigate('/profile');
      }, 2000);
    }, 1500);
  };

  const getPlanDescription = () => {
    switch(paymentDetails.plan) {
      case 'premium':
        return 'Basic visibility boost for 7 days';
      case 'featured':
        return 'Enhanced visibility package for 14 days';
      case 'ultimate':
        return 'Maximum exposure for 30 days';
      default:
        return 'Listing boost';
    }
  };

  const getPlanFeatures = () => {
    switch(paymentDetails.plan) {
      case 'premium':
        return [
          { label: "Higher Ranking", description: "Better search position" },
          { label: "Premium Badge", description: "Stand out in listings" },
          { label: "7 Days", description: "Duration of boost" }
        ];
      case 'featured':
        return [
          { label: "Featured", description: "Homepage prominence" },
          { label: "Top Results", description: "Priority in search" },
          { label: "Premium Badge", description: "Stand out in listings" },
          { label: "14 Days", description: "Duration of boost" }
        ];
      case 'ultimate':
        return [
          { label: "Top Listing", description: "Maximum visibility" },
          { label: "Email Promo", description: "Sent to matching users" },
          { label: "Full Analytics", description: "Track performance" },
          { label: "30 Days", description: "Duration of boost" }
        ];
      default:
        return [
          { label: "Premium", description: "Enhanced visibility" }
        ];
    }
  };

  return (
    <div className="container max-w-xl py-16 mx-auto px-4">
      {paymentSuccess ? (
        <div className="text-center py-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">Your listing has been boosted and is now featured</p>
          <div className="flex justify-center">
            <Button onClick={() => navigate('/profile')}>
              View Your Profile
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Complete Your Payment</h1>
            <p className="text-gray-600">Boost your listing with premium features</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <form onSubmit={handleSubmit}>
                  <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>
                      Enter your card information to complete your purchase
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input 
                        id="cardName" 
                        name="cardName" 
                        placeholder="Name as it appears on card" 
                        required
                        value={formData.cardName}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <div className="relative">
                        <Input 
                          id="cardNumber" 
                          name="cardNumber" 
                          placeholder="1234 5678 9012 3456" 
                          required
                          maxLength={19}
                          value={formData.cardNumber}
                          onChange={handleChange}
                        />
                        <CreditCard className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input 
                          id="expiry" 
                          name="expiry" 
                          placeholder="MM/YY" 
                          required
                          maxLength={5}
                          value={formData.expiry}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input 
                          id="cvv" 
                          name="cvv" 
                          placeholder="123" 
                          required
                          maxLength={4}
                          value={formData.cvv}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isProcessing}>
                      {isProcessing ? 'Processing...' : `Pay ₦${paymentDetails.amount.toLocaleString()}`}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>
            
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="capitalize">{paymentDetails.plan} Listing Boost</span>
                    <span>₦{paymentDetails.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₦{paymentDetails.amount.toLocaleString()}</span>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Plan Features</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {getPlanFeatures().map((feature, index) => (
                        <li key={index}>
                          <Badge className="mr-2">{feature.label}</Badge>
                          {feature.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Lock className="h-4 w-4 mr-1" />
                    Secure encrypted payment
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>By completing this purchase, you agree to our <a href="/terms" className="text-paired-600 hover:underline">Terms of Service</a>.</p>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentPage;
