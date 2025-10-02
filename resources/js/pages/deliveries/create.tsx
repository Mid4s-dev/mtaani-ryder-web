import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Package, User, Phone, CreditCard } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Create Delivery', href: '/deliveries/create' },
];

interface CreateDeliveryProps {
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
      phone?: string;
    };
  };
}

export default function CreateDelivery({ auth }: CreateDeliveryProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Pickup details
    pickup_name: '',
    pickup_phone: '',
    pickup_address: '',
    pickup_latitude: 0,
    pickup_longitude: 0,
    pickup_notes: '',
    
    // Delivery details
    delivery_name: '',
    delivery_phone: '',
    delivery_address: '',
    delivery_latitude: 0,
    delivery_longitude: 0,
    delivery_notes: '',
    
    // Package details
    package_type: '',
    package_description: '',
    package_weight: '',
    package_size: 'medium',
    
    // Payment
    payment_method: 'cash',
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationSearch = async (field: 'pickup' | 'delivery', address: string) => {
    // In a real app, you'd use Google Maps Geocoding API or similar
    // For demo purposes, we'll use dummy coordinates
    const dummyCoords = {
      latitude: -1.2921 + (Math.random() - 0.5) * 0.1,
      longitude: 36.8219 + (Math.random() - 0.5) * 0.1,
    };

    handleInputChange(`${field}_latitude`, dummyCoords.latitude);
    handleInputChange(`${field}_longitude`, dummyCoords.longitude);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/deliveries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        router.visit(`/deliveries/${data.data.delivery.id}`);
      } else {
        console.error('Failed to create delivery');
      }
    } catch (error) {
      console.error('Error creating delivery:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-green-600" />
          Pickup Details
        </CardTitle>
        <CardDescription>
          Where should the rider pick up the package?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pickup_name">Contact Name</Label>
            <Input
              id="pickup_name"
              value={formData.pickup_name}
              onChange={(e) => handleInputChange('pickup_name', e.target.value)}
              placeholder="Full name"
              required
            />
          </div>
          <div>
            <Label htmlFor="pickup_phone">Phone Number</Label>
            <Input
              id="pickup_phone"
              value={formData.pickup_phone}
              onChange={(e) => handleInputChange('pickup_phone', e.target.value)}
              placeholder="+254 7XX XXX XXX"
              required
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="pickup_address">Pickup Address</Label>
          <Textarea
            id="pickup_address"
            value={formData.pickup_address}
            onChange={(e) => {
              handleInputChange('pickup_address', e.target.value);
              if (e.target.value.length > 10) {
                handleLocationSearch('pickup', e.target.value);
              }
            }}
            placeholder="Enter detailed pickup address including building name, floor, apartment number..."
            rows={3}
            required
          />
        </div>

        <div>
          <Label htmlFor="pickup_notes">Special Instructions (Optional)</Label>
          <Textarea
            id="pickup_notes"
            value={formData.pickup_notes}
            onChange={(e) => handleInputChange('pickup_notes', e.target.value)}
            placeholder="Any special instructions for the pickup location..."
            rows={2}
          />
        </div>

        <Button 
          onClick={() => setStep(2)} 
          className="w-full"
          disabled={!formData.pickup_name || !formData.pickup_phone || !formData.pickup_address}
        >
          Next: Delivery Details
        </Button>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-red-600" />
          Delivery Details
        </CardTitle>
        <CardDescription>
          Where should the package be delivered?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="delivery_name">Recipient Name</Label>
            <Input
              id="delivery_name"
              value={formData.delivery_name}
              onChange={(e) => handleInputChange('delivery_name', e.target.value)}
              placeholder="Full name"
              required
            />
          </div>
          <div>
            <Label htmlFor="delivery_phone">Phone Number</Label>
            <Input
              id="delivery_phone"
              value={formData.delivery_phone}
              onChange={(e) => handleInputChange('delivery_phone', e.target.value)}
              placeholder="+254 7XX XXX XXX"
              required
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="delivery_address">Delivery Address</Label>
          <Textarea
            id="delivery_address"
            value={formData.delivery_address}
            onChange={(e) => {
              handleInputChange('delivery_address', e.target.value);
              if (e.target.value.length > 10) {
                handleLocationSearch('delivery', e.target.value);
              }
            }}
            placeholder="Enter detailed delivery address including building name, floor, apartment number..."
            rows={3}
            required
          />
        </div>

        <div>
          <Label htmlFor="delivery_notes">Special Instructions (Optional)</Label>
          <Textarea
            id="delivery_notes"
            value={formData.delivery_notes}
            onChange={(e) => handleInputChange('delivery_notes', e.target.value)}
            placeholder="Any special instructions for the delivery location..."
            rows={2}
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
            Previous
          </Button>
          <Button 
            onClick={() => setStep(3)} 
            className="flex-1"
            disabled={!formData.delivery_name || !formData.delivery_phone || !formData.delivery_address}
          >
            Next: Package Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          Package Details
        </CardTitle>
        <CardDescription>
          Tell us about the package you're sending
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="package_type">Package Type</Label>
            <Input
              id="package_type"
              value={formData.package_type}
              onChange={(e) => handleInputChange('package_type', e.target.value)}
              placeholder="e.g., Documents, Food, Electronics"
              required
            />
          </div>
          <div>
            <Label htmlFor="package_size">Package Size</Label>
            <Select
              value={formData.package_size}
              onValueChange={(value) => handleInputChange('package_size', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small (fits in a bag)</SelectItem>
                <SelectItem value="medium">Medium (box size)</SelectItem>
                <SelectItem value="large">Large (requires special handling)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="package_weight">Weight (kg) - Optional</Label>
          <Input
            id="package_weight"
            type="number"
            step="0.1"
            value={formData.package_weight}
            onChange={(e) => handleInputChange('package_weight', e.target.value)}
            placeholder="0.5"
          />
        </div>
        
        <div>
          <Label htmlFor="package_description">Package Description</Label>
          <Textarea
            id="package_description"
            value={formData.package_description}
            onChange={(e) => handleInputChange('package_description', e.target.value)}
            placeholder="Describe the package contents (required for rider safety)..."
            rows={3}
            required
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
            Previous
          </Button>
          <Button 
            onClick={() => setStep(4)} 
            className="flex-1"
            disabled={!formData.package_type || !formData.package_description}
          >
            Next: Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-purple-600" />
          Payment & Summary
        </CardTitle>
        <CardDescription>
          Review your delivery details and choose payment method
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Method */}
        <div>
          <Label>Payment Method</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
            <Button
              variant={formData.payment_method === 'cash' ? 'default' : 'outline'}
              onClick={() => handleInputChange('payment_method', 'cash')}
              className="justify-start"
            >
              Cash on Delivery
            </Button>
            <Button
              variant={formData.payment_method === 'card' ? 'default' : 'outline'}
              onClick={() => handleInputChange('payment_method', 'card')}
              className="justify-start"
            >
              Credit/Debit Card
            </Button>
            <Button
              variant={formData.payment_method === 'mobile_money' ? 'default' : 'outline'}
              onClick={() => handleInputChange('payment_method', 'mobile_money')}
              className="justify-start"
            >
              M-Pesa
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-semibold mb-3">Delivery Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Base fare</span>
              <span>KES 100</span>
            </div>
            <div className="flex justify-between">
              <span>Distance (estimated)</span>
              <span>KES 60</span>
            </div>
            <div className="flex justify-between">
              <span>Service fee</span>
              <span>KES 25</span>
            </div>
            <hr />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>KES 185</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
            Previous
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="flex-1"
            disabled={loading}
          >
            {loading ? 'Creating Delivery...' : 'Create Delivery'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Delivery - Ryder Mtaani" />
      
      <div className="container mx-auto py-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Create New Delivery</h1>
          <p className="text-muted-foreground">
            Fill in the details below to create your delivery request
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-16 h-1 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            <span>Pickup</span>
            <span>Delivery</span>
            <span>Package</span>
            <span>Payment</span>
          </div>
        </div>

        {/* Form Steps */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>
    </AppLayout>
  );
}