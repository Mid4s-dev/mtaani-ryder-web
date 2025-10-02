import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal,
  Search,
  Filter
} from 'lucide-react'

interface AdminStats {
  total_users: number
  active_users: number
  customers: number
  riders: number
  admins: number
  total_deliveries: number
  pending_deliveries: number
  active_deliveries: number
  completed_deliveries: number
  cancelled_deliveries: number
  today_deliveries: number
  today_earnings: number
  online_riders: number
  verified_riders: number
  pending_rider_verifications: number
}

interface Transaction {
  id: number
  delivery_code: string
  customer: { id: number; name: string; phone: string }
  rider: { id: number; name: string; phone: string }
  total_fare: number
  platform_fee: number
  status: string
  payment_method: string
  created_at: string
}

interface UserManagement {
  id: number
  name: string
  email: string
  phone: string
  user_type: string
  is_active: boolean
  created_at: string
  rider_profile?: {
    verification_status: string
    is_online: boolean
  }

}

interface AdminDashboardEnhancedProps {
  user: any
}

export const AdminDashboardEnhanced: React.FC<AdminDashboardEnhancedProps> = ({ user }) => {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [users, setUsers] = useState<UserManagement[]>([])
  const [loading, setLoading] = useState(false)
  const [transactionFilter, setTransactionFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [userTypeFilter, setUserTypeFilter] = useState('')

  // Fetch admin dashboard data
  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.data.stats)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  // Fetch live transactions
  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/admin/transactions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTransactions(data.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  // Fetch users for management
  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams()
      if (userTypeFilter) params.append('user_type', userTypeFilter)

      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  // Update user verification status
  const updateUserVerification = async (userId: number, action: 'approve' | 'reject') => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/verification`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        fetchUsers()
        fetchDashboardStats()
      } else {
        const errorData = await response.json()
        alert(errorData.message || `Failed to ${action} user verification`)
      }
    } catch (error) {
      console.error(`Error ${action}ing user verification:`, error)
      alert(`Failed to ${action} user verification`)
    } finally {
      setLoading(false)
    }
  }

  // Update user status (ban/unban)
  const updateUserStatus = async (userId: number, action: 'ban' | 'unban') => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        fetchUsers()
        fetchDashboardStats()
      } else {
        const errorData = await response.json()
        alert(errorData.message || `Failed to ${action} user`)
      }
    } catch (error) {
      console.error(`Error ${action}ning user:`, error)
      alert(`Failed to ${action} user`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
    fetchTransactions()
    fetchUsers()
  }, [userTypeFilter])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'verified':
      case 'active':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'cancelled':
      case 'rejected':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const filteredTransactions = transactions.filter(transaction =>
    !transactionFilter || 
    transaction.delivery_code.toLowerCase().includes(transactionFilter.toLowerCase()) ||
    transaction.customer?.name.toLowerCase().includes(transactionFilter.toLowerCase()) ||
    transaction.rider?.name.toLowerCase().includes(transactionFilter.toLowerCase())
  )

  const filteredUsers = users.filter(user =>
    !userFilter || 
    user.name.toLowerCase().includes(userFilter.toLowerCase()) ||
    user.email.toLowerCase().includes(userFilter.toLowerCase()) ||
    user.phone.includes(userFilter)
  )

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor and manage the Ryder Mtaani platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total_users}</div>
                <div className="text-gray-600">Total Users</div>
                <div className="text-sm text-gray-500">
                  {stats.active_users} active
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total_deliveries}</div>
                <div className="text-gray-600">Total Deliveries</div>
                <div className="text-sm text-gray-500">
                  {stats.today_deliveries} today
                </div>
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
                <div className="text-2xl font-bold">{formatCurrency(stats.today_earnings)}</div>
                <div className="text-gray-600">Today's Revenue</div>
                <div className="text-sm text-gray-500">
                  Platform fees earned
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.online_riders}</div>
                <div className="text-gray-600">Online Riders</div>
                <div className="text-sm text-gray-500">
                  of {stats.verified_riders} verified
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">
            Live Transactions ({filteredTransactions.length})
          </TabsTrigger>
          <TabsTrigger value="users">
            User Management ({filteredUsers.length})
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Delivery Status */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span>Pending Deliveries</span>
                    </div>
                    <Badge variant="secondary">{stats.pending_deliveries}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-600" />
                      <span>Active Deliveries</span>
                    </div>
                    <Badge>{stats.active_deliveries}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Completed Deliveries</span>
                    </div>
                    <Badge variant="default">{stats.completed_deliveries}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span>Cancelled Deliveries</span>
                    </div>
                    <Badge variant="destructive">{stats.cancelled_deliveries}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span>Customers</span>
                    <Badge variant="default">{stats.customers}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span>Riders</span>
                    <Badge variant="default">{stats.riders}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span>Admins</span>
                    <Badge variant="default">{stats.admins}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span>Administrators</span>
                    <Badge variant="default">{stats.admins}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Live Transactions</CardTitle>
                  <CardDescription>Monitor all delivery transactions in real-time</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search transactions..."
                      value={transactionFilter}
                      onChange={(e) => setTransactionFilter(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button onClick={fetchTransactions} size="sm">
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Delivery Code</th>
                      <th className="text-left py-3 px-2">Customer</th>
                      <th className="text-left py-3 px-2">Rider</th>
                      <th className="text-left py-3 px-2">Amount</th>
                      <th className="text-left py-3 px-2">Status</th>
                      <th className="text-left py-3 px-2">Date</th>
                      <th className="text-left py-3 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2 font-medium">{transaction.delivery_code}</td>
                        <td className="py-3 px-2">
                          <div>
                            <div className="font-medium">{transaction.customer?.name}</div>
                            <div className="text-sm text-gray-500">{transaction.customer?.phone}</div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div>
                            <div className="font-medium">{transaction.rider?.name || 'Unassigned'}</div>
                            <div className="text-sm text-gray-500">{transaction.rider?.phone}</div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div>
                            <div className="font-medium">{formatCurrency(transaction.total_fare)}</div>
                            <div className="text-sm text-gray-500">
                              Fee: {formatCurrency(transaction.platform_fee)}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant={getStatusBadgeVariant(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-600">
                          {formatDate(transaction.created_at)}
                        </td>
                        <td className="py-3 px-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage user accounts, verification, and access</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search users..."
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Users" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Users</SelectItem>
                      <SelectItem value="customer">Customers</SelectItem>
                      <SelectItem value="rider">Riders</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">User</th>
                      <th className="text-left py-3 px-2">Type</th>
                      <th className="text-left py-3 px-2">Status</th>
                      <th className="text-left py-3 px-2">Verification</th>
                      <th className="text-left py-3 px-2">Joined</th>
                      <th className="text-left py-3 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            <div className="text-sm text-gray-500">{user.phone}</div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant="outline" className="capitalize">
                            {user.user_type}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant={user.is_active ? 'default' : 'destructive'}>
                            {user.is_active ? 'Active' : 'Banned'}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          {user.rider_profile && (
                            <Badge variant={getStatusBadgeVariant(user.rider_profile.verification_status)}>
                              {user.rider_profile.verification_status}
                            </Badge>
                          )}
                          {!user.rider_profile && (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-600">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex gap-1">
                            {/* Verification Actions */}
                            {(user.rider_profile?.verification_status === 'pending') && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => updateUserVerification(user.id, 'approve')}
                                  disabled={loading}
                                >
                                  <CheckCircle className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateUserVerification(user.id, 'reject')}
                                  disabled={loading}
                                >
                                  <XCircle className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                            
                            {/* Ban/Unban Actions */}
                            <Button
                              size="sm"
                              variant={user.is_active ? "destructive" : "default"}
                              onClick={() => updateUserStatus(user.id, user.is_active ? 'ban' : 'unban')}
                              disabled={loading}
                            >
                              {user.is_active ? 'Ban' : 'Unban'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>
                  Advanced analytics and reporting features will be available here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Revenue analytics, user growth charts, and performance metrics
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Platform Health</CardTitle>
                <CardDescription>
                  Key performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Completion Rate</span>
                    <Badge variant="default">
                      {stats.total_deliveries > 0 
                        ? Math.round((stats.completed_deliveries / stats.total_deliveries) * 100)
                        : 0}%
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Active Riders</span>
                    <Badge variant="default">
                      {stats.verified_riders > 0 
                        ? Math.round((stats.online_riders / stats.verified_riders) * 100)
                        : 0}%
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Pending Verifications</span>
                    <Badge variant="secondary">
                      {stats.pending_rider_verifications}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminDashboardEnhanced