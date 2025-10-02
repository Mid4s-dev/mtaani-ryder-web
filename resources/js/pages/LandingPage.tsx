import React from 'react'
import { Link } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Users,
  Clock,
  Shield,
  Smartphone,
  Star,
  Truck,
  CreditCard,
  CheckCircle,
  ArrowRight,
  Globe,
  Zap,
  Award,
  Phone,
  Mail
} from 'lucide-react'

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: <MapPin className="w-8 h-8 text-blue-600" />,
      title: "Smart Location Services",
      description: "Integrated Google Maps for precise pickup and delivery location selection with real-time tracking."
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Choose Your Rider",
      description: "Select from available riders based on ratings, past experiences, and proximity to your location."
    },
    {
      icon: <Clock className="w-8 h-8 text-orange-600" />,
      title: "Real-Time Tracking",
      description: "Track your delivery in real-time from pickup to doorstep with live GPS updates."
    },
    {
      icon: <Shield className="w-8 h-8 text-purple-600" />,
      title: "Secure & Reliable",
      description: "All riders are verified with background checks. Your packages are insured and tracked."
    },
    {
      icon: <Smartphone className="w-8 h-8 text-red-600" />,
      title: "Mobile Optimized",
      description: "Works seamlessly across web and mobile platforms with responsive design."
    },
    {
      icon: <CreditCard className="w-8 h-8 text-indigo-600" />,
      title: "Flexible Payments",
      description: "Multiple payment options including mobile money, cards, and cash on delivery."
    }
  ]

  const userTypes = [
    {
      type: "Customers",
      icon: <Users className="w-12 h-12 text-blue-600 mb-4" />,
      benefits: [
        "Easy delivery booking with Google Maps",
        "Choose preferred riders",
        "Real-time package tracking",
        "Multiple payment options",
        "Rate and review system"
      ],
      cta: "Send a Package"
    },
    {
      type: "Riders",
      icon: <Truck className="w-12 h-12 text-green-600 mb-4" />,
      benefits: [
        "Flexible working hours",
        "Competitive earnings",
        "Real-time job notifications",
        "Performance analytics",
        "Weekly payouts"
      ],
      cta: "Become a Rider"
    },
    {
      type: "Administrators",
      icon: <Award className="w-12 h-12 text-purple-600 mb-4" />,
      benefits: [
        "Comprehensive dashboard",
        "User management tools",
        "Real-time analytics",
        "Transaction monitoring",
        "Platform oversight"
      ],
      cta: "Admin Portal"
    }
  ]

  const stats = [
    { number: "10,000+", label: "Deliveries Completed", icon: <CheckCircle className="w-6 h-6" /> },
    { number: "500+", label: "Verified Riders", icon: <Users className="w-6 h-6" /> },
    { number: "50+", label: "Locations Covered", icon: <MapPin className="w-6 h-6" /> },
    { number: "4.8/5", label: "Customer Rating", icon: <Star className="w-6 h-6" /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Ryder Mtaani</h1>
                <p className="text-xs text-gray-600">Fast. Reliable. Local.</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            <Zap className="w-4 h-4 mr-2" />
            Now Available in Nairobi
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Local Delivery
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}Made Simple
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Ryder Mtaani connects you with trusted local riders for fast, affordable deliveries. 
            Send packages across the city with real-time tracking and rider selection.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="px-8 py-3 text-lg">
                Start Delivering
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
              <Phone className="mr-2 w-5 h-5" />
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2 text-blue-600">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Ryder Mtaani?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We've built the most advanced local delivery platform with features designed for the Kenyan market.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for Everyone
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you're sending packages, looking to earn, or managing the platform - we've got you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {userTypes.map((userType, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-all transform hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="flex justify-center">{userType.icon}</div>
                  <CardTitle className="text-2xl">{userType.type}</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <ul className="space-y-3 mb-6">
                    {userType.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center text-left">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">
                    <Button className="w-full">
                      {userType.cta}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sending a package is as easy as 1-2-3
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Set Locations</h3>
              <p className="text-gray-600">
                Use our Google Maps integration to set pickup and delivery locations with precision.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Choose Rider</h3>
              <p className="text-gray-600">
                Select from available riders based on ratings, location, and your preferences.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Track & Receive</h3>
              <p className="text-gray-600">
                Track your package in real-time and receive notifications at every step.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied customers and riders already using Ryder Mtaani
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
                Sign Up Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 py-3 text-lg text-white border-white hover:bg-white hover:text-blue-600">
              <Globe className="mr-2 w-5 h-5" />
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Ryder Mtaani</h3>
                  <p className="text-gray-400 text-sm">Fast. Reliable. Local.</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                Your trusted local delivery partner, connecting communities across Kenya with fast, reliable, and affordable delivery services.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Phone className="w-4 h-4 mr-2" />
                  +254 700 000 000
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Mail className="w-4 h-4 mr-2" />
                  hello@rydermtaani.com
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white">How It Works</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/safety" className="hover:text-white">Safety</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Ryder Mtaani. All rights reserved. Built for Kenya, by Kenyans.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage