import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MapPin, 
  Package, 
  Clock, 
  DollarSign, 
  Phone, 
  Navigation,
  CheckCircle,
  XCircle,
  Star,
  User
} from 'lucide-react'
import { MapView } from '@/components/GoogleMaps'
import { Location } from '@/types/maps'

interface Delivery {
  id: number
  delivery_code: string
  pickup_name: string
  pickup_phone: string
  pickup_address: string
  pickup_latitude: number
  pickup_longitude: number
  pickup_notes?: string
  delivery_name: string
  delivery_phone: string
  delivery_address: string
  delivery_latitude: number
  delivery_longitude: number
  delivery_notes?: string
  package_type: string
  package_description: string
  package_size: string
  distance: number
  total_fare: number
  rider_earnings: number
  payment_method: string
  status: string
  created_at: string
  assignment_type: string
  customer?: {
    id: number
    name: string
    rating: number
    phone: string
  }

}

interface RiderDashboardEnhancedProps {
  user: any
  riderProfile: any
}

export const RiderDashboardEnhanced: React.FC<RiderDashboardEnhancedProps> = ({ 
  user, 
  riderProfile 
}) => {
  const [availableDeliveries, setAvailableDeliveries] = useState<Delivery[]>([])
  const [activeDeliveries, setActiveDeliveries] = useState<Delivery[]>([])
  const [completedDeliveries, setCompletedDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null)
  const [isOnline, setIsOnline] = useState(riderProfile?.is_online || false)

  // Fetch available deliveries
  const fetchAvailableDeliveries = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/deliveries/available-for-rider', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAvailableDeliveries(data.data.available_deliveries || [])
      }
    } catch (error) {
      console.error('Error fetching available deliveries:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch rider's deliveries
  const fetchRiderDeliveries = async () => {
    try {
      const response = await fetch('/api/deliveries', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        const deliveries = data.data.deliveries || []
        setActiveDeliveries(deliveries.filter((d: Delivery) => 
          ['accepted', 'picked_up', 'in_transit'].includes(d.status)
        ))
        setCompletedDeliveries(deliveries.filter((d: Delivery) => 
          d.status === 'delivered'
        ).slice(0, 10))
      }
    } catch (error) {
      console.error('Error fetching rider deliveries:', error)
    }
  }

  // Toggle online status
  const toggleOnlineStatus = async () => {
    try {
      const response = await fetch('/api/rider/online-status', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_online: !isOnline })
      })

      if (response.ok) {
        setIsOnline(!isOnline)
        if (!isOnline) {
          fetchAvailableDeliveries()
        }
      }
    } catch (error) {
      console.error('Error updating online status:', error)
    }
  }

  // Accept delivery
  const acceptDelivery = async (deliveryId: number) => {
    try {
      const response = await fetch(`/api/deliveries/${deliveryId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        fetchAvailableDeliveries()
        fetchRiderDeliveries()
        setSelectedDelivery(null)
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to accept delivery')
      }
    } catch (error) {
      console.error('Error accepting delivery:', error)
      alert('Failed to accept delivery')
    }
  }

  // Reject delivery
  const rejectDelivery = async (deliveryId: number, reason?: string) => {
    try {
      const response = await fetch(`/api/deliveries/${deliveryId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason })
      })

      if (response.ok) {
        fetchAvailableDeliveries()
        setSelectedDelivery(null)
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to reject delivery')
      }
    } catch (error) {
      console.error('Error rejecting delivery:', error)
    }
  }

  useEffect(() => {
    if (isOnline) {
      fetchAvailableDeliveries()
    }
    fetchRiderDeliveries()
  }, [isOnline])

  const getMapMarkers = (deliveries: Delivery[]): Location[] => {
    const markers: Location[] = []
    
    deliveries.forEach(delivery => {
      markers.push({
        lat: delivery.pickup_latitude,
        lng: delivery.pickup_longitude,
        address: `Pickup: ${delivery.pickup_address}`
      })
      markers.push({
        lat: delivery.delivery_latitude,
        lng: delivery.delivery_longitude,
        address: `Delivery: ${delivery.delivery_address}`
      })
    })

    return markers
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hr ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`
    }
  }

  const DeliveryCard = ({ delivery, showActions = false }: { delivery: Delivery; showActions?: boolean }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{delivery.delivery_code}</CardTitle>
            <CardDescription>
              {delivery.package_type} • {delivery.package_size} • {formatTimeAgo(delivery.created_at)}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">
              KES {delivery.rider_earnings}
            </div>
            <Badge 
              variant={delivery.assignment_type === 'customer_selected' ? 'default' : 'secondary'}
            >
              {delivery.assignment_type === 'customer_selected' ? 'Selected for you' : 'Open'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer Info */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <User className="w-4 h-4 text-gray-600" />
          <div>
            <div className="font-medium">{delivery.customer?.name}</div>
            <div className="text-sm text-gray-600 flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {delivery.customer?.rating || 'New customer'}
            </div>
          </div>
        </div>

        {/* Route Info */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium">Pickup</div>
              <div className="text-sm text-gray-600">{delivery.pickup_address}</div>
              <div className="text-xs text-gray-500">
                {delivery.pickup_name} • {delivery.pickup_phone}
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Navigation className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium">Delivery</div>
              <div className="text-sm text-gray-600">{delivery.delivery_address}</div>
              <div className="text-xs text-gray-500">
                {delivery.delivery_name} • {delivery.delivery_phone}
              </div>
            </div>
          </div>
        </div>

        {/* Package Info */}
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
          <Package className="w-4 h-4 text-gray-600" />
          <div className="flex-1">
            <div className="text-sm font-medium">{delivery.package_description}</div>
            <div className="text-xs text-gray-500">
              {delivery.distance}km • {delivery.payment_method}
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => acceptDelivery(delivery.id)}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept
            </Button>
            <Button
              variant="outline"
              onClick={() => rejectDelivery(delivery.id)}
              className="flex-1"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rider Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.name}!</p>
        </div>
        <Button
          onClick={toggleOnlineStatus}
          variant={isOnline ? "destructive" : "default"}
          className={isOnline ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
        >
          {isOnline ? 'Go Offline' : 'Go Online'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{availableDeliveries.length}</div>
                <div className="text-gray-600">Available Deliveries</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeDeliveries.length}</div>
                <div className="text-gray-600">Active Deliveries</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  KES {riderProfile?.earnings_today || 0}
                </div>
                <div className="text-gray-600">Today's Earnings</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="available" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="available">Available ({availableDeliveries.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({activeDeliveries.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="available" className="mt-6">
              {!isOnline ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">You're currently offline</h3>
                    <p className="text-gray-600 mb-4">
                      Go online to start receiving delivery requests from customers in your area.
                    </p>
                    <Button onClick={toggleOnlineStatus}>
                      Go Online
                    </Button>
                  </CardContent>
                </Card>
              ) : availableDeliveries.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No available deliveries</h3>
                    <p className="text-gray-600">
                      Check back soon for new delivery requests in your area.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {availableDeliveries.map(delivery => (
                    <DeliveryCard 
                      key={delivery.id} 
                      delivery={delivery} 
                      showActions={true}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="active" className="mt-6">
              {activeDeliveries.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No active deliveries</h3>
                    <p className="text-gray-600">
                      Your accepted deliveries will appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {activeDeliveries.map(delivery => (
                    <DeliveryCard 
                      key={delivery.id} 
                      delivery={delivery}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="mt-6">
              {completedDeliveries.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No completed deliveries</h3>
                    <p className="text-gray-600">
                      Your completed deliveries and earnings will appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {completedDeliveries.map(delivery => (
                    <DeliveryCard 
                      key={delivery.id} 
                      delivery={delivery}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Map Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Map</CardTitle>
              <CardDescription>
                View pickup and delivery locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {riderProfile?.current_latitude && riderProfile?.current_longitude ? (
                <MapView
                  center={{
                    lat: riderProfile.current_latitude,
                    lng: riderProfile.current_longitude
                  }}
                  markers={getMapMarkers(availableDeliveries.concat(activeDeliveries))}
                  height="400px"
                  showCurrentLocation={true}
                />
              ) : (
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Update your location to view map</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default RiderDashboardEnhanced