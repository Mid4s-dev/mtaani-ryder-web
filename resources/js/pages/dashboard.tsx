import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, MapPin, Clock, Star, Phone, Package, Users, DollarSign } from 'lucide-react';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface User {
  id: number;
  name: string;
  email: string;
  user_type: 'customer' | 'rider' | 'admin';
  phone?: string;
  rating: number;
  total_ratings: number;
  rider_profile?: RiderProfile;
}

interface RiderProfile {
  id: number;
  vehicle_type: string;
  is_online: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
  total_earnings: number;
  earnings_today: number;
}



interface Delivery {
  id: number;
  delivery_code: string;
  status: string;
  pickup_address: string;
  delivery_address: string;
  total_fare: number;
  created_at: string;
  customer?: User;
  rider?: User;
}

interface DashboardProps {
  auth: {
    user: User;
  };
  stats?: any;
  active_delivery?: Delivery;
  active_deliveries?: Delivery[];
}

export default function Dashboard({ auth, stats, active_delivery, active_deliveries }: DashboardProps) {
  const [loading, setLoading] = useState(false);
  const user = auth?.user || {
    id: 1,
    name: 'Demo User',
    email: 'demo@example.com',
    user_type: 'customer' as const,
    rating: 4.8,
    total_ratings: 25
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      picked_up: 'bg-purple-100 text-purple-800',
      in_transit: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCreateDelivery = () => {
    router.visit('/deliveries/create');
  };

  const handleViewDeliveries = () => {
    router.visit('/deliveries');
  };

  const renderCustomerDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-2">Welcome to Ryder Mtaani</h2>
        <p className="opacity-90">Your trusted partner for fast and reliable deliveries in your neighborhood</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Create Delivery
            </CardTitle>
            <CardDescription>
              Send packages to your customers quickly and safely
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreateDelivery} className="w-full bg-blue-600 hover:bg-blue-700">
              Create New Delivery
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-green-600" />
              Track Deliveries
            </CardTitle>
            <CardDescription>
              Monitor your packages in real-time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleViewDeliveries} className="w-full">
              View All Deliveries
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">12</div>
            <div className="text-sm text-muted-foreground">Total Deliveries</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">8</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">2</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold flex items-center gap-1">
              {user.rating}
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </div>
            <div className="text-sm text-muted-foreground">Your Rating</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">#RYD123ABC</div>
                <div className="text-sm text-muted-foreground">Delivered to Westlands</div>
              </div>
              <Badge className="bg-green-100 text-green-800">Delivered</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">#RYD456DEF</div>
                <div className="text-sm text-muted-foreground">En route to Karen</div>
              </div>
              <Badge className="bg-blue-100 text-blue-800">In Transit</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRiderDashboard = () => (
    <div className="space-y-6">
      {/* Rider Status */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Rider Status</span>
            <Badge variant="default" className="bg-green-500">
              Available
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-600 mb-4">You're online and ready to receive delivery requests!</p>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" size="sm">
              Go Offline
            </Button>
            <Button variant="outline" size="sm">
              Update Location
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Earnings Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(2450)}</div>
            <div className="text-sm text-muted-foreground">Today's Earnings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">8</div>
            <div className="text-sm text-muted-foreground">Deliveries Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(15670)}</div>
            <div className="text-sm text-muted-foreground">Total Earnings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold flex items-center gap-1">
              4.9
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </div>
            <div className="text-sm text-muted-foreground">Rating (127)</div>
          </CardContent>
        </Card>
      </div>

      {/* Available Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Available Deliveries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">{formatCurrency(320)}</div>
                <Badge className="bg-yellow-100 text-yellow-800">2.5 km</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 text-green-500" />
                  <span>Pickup: Westlands Shopping Mall</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 text-red-500" />
                  <span>Delivery: Karen Hardy Shopping Center</span>
                </div>
              </div>
              <Button size="sm" className="w-full mt-3">
                Accept Delivery
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* Admin Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Overview</CardTitle>
          <CardDescription>Administrative dashboard for platform management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats?.total_users || 0}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats?.active_riders || 0}</div>
              <div className="text-sm text-muted-foreground">Active Riders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats?.total_deliveries || 0}</div>
              <div className="text-sm text-muted-foreground">Total Deliveries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats?.platform_revenue || 0}</div>
              <div className="text-sm text-muted-foreground">Platform Revenue</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>Access comprehensive admin tools</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => router.visit('/admin/dashboard')}
            >
              Go to Admin Panel
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Delivery Analytics</CardTitle>
            <CardDescription>View detailed reports and insights</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">View Reports</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard - Ryder Mtaani" />
      
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground">
            {user.user_type === 'customer' && 'Manage your deliveries and track packages'}
            {user.user_type === 'rider' && 'Start earning by delivering packages'}
            {user.user_type === 'admin' && 'Manage platform operations and user oversight'}
          </p>
        </div>

        {user.user_type === 'customer' && renderCustomerDashboard()}
        {user.user_type === 'rider' && renderRiderDashboard()}
        {user.user_type === 'admin' && renderAdminDashboard()}
      </div>
    </AppLayout>
  );
}
