import React, { useState, useEffect } from 'react'
import { router } from '@inertiajs/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { MapPin, User, Package, CreditCard, Clock } from 'lucide-react'
import { LocationSearch, MapView, LocationPicker } from '@/components/GoogleMaps'
import UniversalLocationPicker from '@/components/UniversalLocationPicker'
import { Location, RiderInfo } from '@/types/maps'

interface DeliveryFormData {
  // Pickup details
  pickup_name: string
  pickup_phone: string
  pickup_address: string
  pickup_latitude: number | null
  pickup_longitude: number | null
  pickup_notes: string

  // Delivery details
  delivery_name: string
  delivery_phone: string
  delivery_address: string
  delivery_latitude: number | null
  delivery_longitude: number | null
  delivery_notes: string

  // Package details
  package_type: string
  package_description: string
  package_weight: number | null
  package_size: string
  package_photos: string[]

  // Payment
  payment_method: string

  // Rider selection
  preferred_riders: number[]
  customer_can_choose_rider: boolean
}

interface CreateDeliveryEnhancedProps {
  className?: string
}

export const CreateDeliveryEnhanced: React.FC<CreateDeliveryEnhancedProps> = ({ className }) => {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [availableRiders, setAvailableRiders] = useState<RiderInfo[]>([])
  const [previousRiders, setPreviousRiders] = useState<RiderInfo[]>([])
  const [formData, setFormData] = useState<DeliveryFormData>({
    pickup_name: '',
    pickup_phone: '',
    pickup_address: '',
    pickup_latitude: null,
    pickup_longitude: null,
    pickup_notes: '',
    delivery_name: '',
    delivery_phone: '',
    delivery_address: '',
    delivery_latitude: null,
    delivery_longitude: null,
    delivery_notes: '',
    package_type: '',
    package_description: '',
    package_weight: null,
    package_size: 'medium',
    package_photos: [],
    payment_method: 'cash',
    preferred_riders: [],
    customer_can_choose_rider: true,
  })

  const updateFormData = (field: keyof DeliveryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleLocationSelect = (field: 'pickup' | 'delivery') => (location: Location) => {
    updateFormData(`${field}_latitude`, location.lat)
    updateFormData(`${field}_longitude`, location.lng)
    updateFormData(`${field}_address`, location.address || '')
  }

  const fetchAvailableRiders = async () => {
    if (!formData.pickup_latitude || !formData.pickup_longitude) return

    try {
      const response = await fetch('/api/deliveries/available-riders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: formData.pickup_latitude,
          longitude: formData.pickup_longitude,
        })
      })

      if (response.ok) {
        const data = await response.json()
        setAvailableRiders(data.data.nearby_riders || [])
        setPreviousRiders(data.data.previous_riders || [])
      }
    } catch (error) {
      console.error('Error fetching riders:', error)
    }
  }

  useEffect(() => {
    if (step === 4 && formData.pickup_latitude && formData.pickup_longitude) {
      fetchAvailableRiders()
    }
  }, [step, formData.pickup_latitude, formData.pickup_longitude])

  const toggleRiderSelection = (riderId: number) => {
    const currentRiders = formData.preferred_riders
    if (currentRiders.includes(riderId)) {
      updateFormData('preferred_riders', currentRiders.filter(id => id !== riderId))
    } else if (currentRiders.length < 5) {
      updateFormData('preferred_riders', [...currentRiders, riderId])
    }
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/deliveries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        router.visit('/dashboard')
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to create delivery request')
      }
    } catch (error) {
      console.error('Error creating delivery:', error)
      alert('Failed to create delivery request')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (step < 5) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.pickup_name && formData.pickup_phone && formData.pickup_latitude && formData.pickup_longitude
      case 2:
        return formData.delivery_name && formData.delivery_phone && formData.delivery_latitude && formData.delivery_longitude
      case 3:
        return formData.package_type && formData.package_description
      case 4:
        return formData.payment_method
      case 5:
        return true
      default:
        return false
    }
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 ${className}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Delivery</h1>
        <p className="text-gray-600 mt-2">Book a delivery with our trusted riders</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4, 5].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= stepNumber 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {stepNumber}
            </div>
            {stepNumber < 5 && (
              <div className={`w-16 h-0.5 ${
                step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Pickup Location */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Pickup Location
            </CardTitle>
            <CardDescription>
              Where should the rider pick up the package?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pickup_name">Pickup Contact Name</Label>
                <Input
                  id="pickup_name"
                  value={formData.pickup_name}
                  onChange={(e) => updateFormData('pickup_name', e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="pickup_phone">Phone Number</Label>
                <Input
                  id="pickup_phone"
                  value={formData.pickup_phone}
                  onChange={(e) => updateFormData('pickup_phone', e.target.value)}
                  placeholder="+254712345678"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="pickup_address">Pickup Address</Label>
              <UniversalLocationPicker
                onLocationSelect={handleLocationSelect('pickup')}
                placeholder="Search for pickup location or click on map..."
                initialLocation={
                  formData.pickup_latitude && formData.pickup_longitude
                    ? {
                        lat: formData.pickup_latitude,
                        lng: formData.pickup_longitude,
                        address: formData.pickup_address
                      }
                    : undefined
                }
                height="350px"
                showMapToggle={true}
                defaultMapProvider="google"
              />
            </div>

            <div>
              <Label htmlFor="pickup_notes">Pickup Notes (Optional)</Label>
              <Textarea
                id="pickup_notes"
                value={formData.pickup_notes}
                onChange={(e) => updateFormData('pickup_notes', e.target.value)}
                placeholder="Additional instructions for the rider..."
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Delivery Location */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Delivery Location
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
                  onChange={(e) => updateFormData('delivery_name', e.target.value)}
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <Label htmlFor="delivery_phone">Recipient Phone</Label>
                <Input
                  id="delivery_phone"
                  value={formData.delivery_phone}
                  onChange={(e) => updateFormData('delivery_phone', e.target.value)}
                  placeholder="+254798765432"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="delivery_address">Delivery Address</Label>
              <UniversalLocationPicker
                onLocationSelect={handleLocationSelect('delivery')}
                placeholder="Search for delivery location or click on map..."
                initialLocation={
                  formData.delivery_latitude && formData.delivery_longitude
                    ? {
                        lat: formData.delivery_latitude,
                        lng: formData.delivery_longitude,
                        address: formData.delivery_address
                      }
                    : undefined
                }
                height="350px"
                showMapToggle={true}
                defaultMapProvider="google"
              />
              
              {/* Show both locations if pickup is also set */}
              {formData.pickup_latitude && formData.pickup_longitude && formData.delivery_latitude && formData.delivery_longitude && (
                <div className="mt-4">
                  <Label>Route Overview</Label>
                  <MapView
                    center={{ 
                      lat: (formData.pickup_latitude + formData.delivery_latitude) / 2, 
                      lng: (formData.pickup_longitude + formData.delivery_longitude) / 2 
                    }}
                    markers={[
                      { 
                        lat: formData.pickup_latitude, 
                        lng: formData.pickup_longitude, 
                        address: 'Pickup: ' + formData.pickup_address 
                      },
                      { 
                        lat: formData.delivery_latitude, 
                        lng: formData.delivery_longitude, 
                        address: 'Delivery: ' + formData.delivery_address 
                      }
                    ]}
                    height="250px"
                    interactive={false}
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="delivery_notes">Delivery Notes (Optional)</Label>
              <Textarea
                id="delivery_notes"
                value={formData.delivery_notes}
                onChange={(e) => updateFormData('delivery_notes', e.target.value)}
                placeholder="Additional delivery instructions..."
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Package Details */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Package Details
            </CardTitle>
            <CardDescription>
              Tell us about what you're sending
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="package_type">Package Type</Label>
                <Select value={formData.package_type} onValueChange={(value) => updateFormData('package_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select package type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="documents">Documents</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="books">Books</SelectItem>
                    <SelectItem value="gifts">Gifts</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="package_size">Package Size</Label>
                <Select value={formData.package_size} onValueChange={(value) => updateFormData('package_size', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (up to 2kg)</SelectItem>
                    <SelectItem value="medium">Medium (2-10kg)</SelectItem>
                    <SelectItem value="large">Large (10kg+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="package_description">Package Description</Label>
              <Textarea
                id="package_description"
                value={formData.package_description}
                onChange={(e) => updateFormData('package_description', e.target.value)}
                placeholder="Describe what you're sending..."
              />
            </div>

            <div>
              <Label htmlFor="package_weight">Weight (kg) - Optional</Label>
              <Input
                id="package_weight"
                type="number"
                step="0.1"
                min="0"
                value={formData.package_weight || ''}
                onChange={(e) => updateFormData('package_weight', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="2.5"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Choose Riders */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Choose Riders (Optional)
            </CardTitle>
            <CardDescription>
              Select specific riders or let us find the best available rider for you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="auto-assign"
                checked={!formData.customer_can_choose_rider}
                onCheckedChange={(checked) => {
                  updateFormData('customer_can_choose_rider', !checked)
                  if (checked) {
                    updateFormData('preferred_riders', [])
                  }
                }}
              />
              <Label htmlFor="auto-assign">
                Auto-assign to the best available rider
              </Label>
            </div>

            {formData.customer_can_choose_rider && (
              <div className="space-y-4">
                {previousRiders.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Your Previous Riders</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {previousRiders.map((rider) => (
                        <div
                          key={rider.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            formData.preferred_riders.includes(rider.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => toggleRiderSelection(rider.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{rider.name}</h4>
                              <p className="text-sm text-gray-600">{rider.vehicle_type}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary">⭐ {rider.rating}</Badge>
                                {rider.is_online && (
                                  <Badge variant="default" className="bg-green-500">Online</Badge>
                                )}
                              </div>
                            </div>
                            {formData.preferred_riders.includes(rider.id) && (
                              <div className="text-blue-600">✓</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {availableRiders.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Available Riders Nearby</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availableRiders.map((rider) => (
                        <div
                          key={rider.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            formData.preferred_riders.includes(rider.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => toggleRiderSelection(rider.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{rider.name}</h4>
                              <p className="text-sm text-gray-600">{rider.vehicle_type}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary">⭐ {rider.rating}</Badge>
                                {rider.distance && (
                                  <Badge variant="outline">{rider.distance}km away</Badge>
                                )}
                                {rider.is_online && (
                                  <Badge variant="default" className="bg-green-500">Online</Badge>
                                )}
                              </div>
                            </div>
                            {formData.preferred_riders.includes(rider.id) && (
                              <div className="text-blue-600">✓</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.preferred_riders.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Selected {formData.preferred_riders.length} rider{formData.preferred_riders.length > 1 ? 's' : ''}. 
                      They will have 15 minutes to respond before we open the delivery to all available riders.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 5: Payment & Summary */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment & Summary
            </CardTitle>
            <CardDescription>
              Review your delivery details and choose payment method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Payment Method</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                {[
                  { value: 'cash', label: 'Cash on Delivery' },
                  { value: 'card', label: 'Credit/Debit Card' },
                  { value: 'mobile_money', label: 'Mobile Money' },
                ].map((method) => (
                  <div
                    key={method.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.payment_method === method.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => updateFormData('payment_method', method.value)}
                  >
                    <div className="text-center">
                      <div className="font-medium">{method.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Summary */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium mb-4">Delivery Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>From:</span>
                  <span className="text-right max-w-xs truncate">{formData.pickup_address}</span>
                </div>
                <div className="flex justify-between">
                  <span>To:</span>
                  <span className="text-right max-w-xs truncate">{formData.delivery_address}</span>
                </div>
                <div className="flex justify-between">
                  <span>Package:</span>
                  <span>{formData.package_type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span className="capitalize">{formData.package_size}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment:</span>
                  <span className="capitalize">{formData.payment_method.replace('_', ' ')}</span>
                </div>
                {formData.preferred_riders.length > 0 && (
                  <div className="flex justify-between">
                    <span>Preferred Riders:</span>
                    <span>{formData.preferred_riders.length} selected</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={step === 1 || loading}
        >
          Previous
        </Button>
        
        {step < 5 ? (
          <Button
            onClick={nextStep}
            disabled={!canProceed() || loading}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed() || loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </div>
            ) : (
              'Create Delivery'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

export default CreateDeliveryEnhanced