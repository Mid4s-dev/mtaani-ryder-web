# 🚚 Ryder Mtaani - Modern Delivery Platform

**Fast. Reliable. Local.**

Ryder Mtaani is a comprehensive delivery platform built for the Kenyan market, connecting customers with trusted local riders for fast, affordable package deliveries across the city.

## 🌟 Key Features

### 🗺️ **Smart Location Services**
- **Google Maps Integration**: Precise pickup and delivery location selection
- **Real-time GPS Tracking**: Track packages from pickup to doorstep
- **Address Geocoding**: Convert addresses to coordinates automatically
- **Interactive Map Interface**: Visual location selection and confirmation

### 👥 **Intelligent Rider Selection**
- **Choose Your Rider**: Select from available riders based on ratings and proximity
- **Historical Preferences**: System remembers your preferred riders
- **Smart Matching**: Algorithm matches customers with suitable riders
- **Rejection Handling**: Automatic fallback if riders decline

### 📱 **Multi-Platform Experience**
- **Responsive Web App**: Works seamlessly on desktop and mobile
- **Progressive Web App (PWA)**: App-like experience in browsers
- **Real-time Updates**: Live notifications and status updates
- **Cross-platform Compatibility**: Consistent experience across devices

### 🛡️ **Security & Trust**
- **Rider Verification**: Background checks and document verification
- **Rating System**: Two-way rating system for quality assurance
- **Secure Payments**: Multiple payment options with secure processing
- **Package Insurance**: Protection for valuable items

### 💰 **Flexible Payment Options**
- **Mobile Money**: M-Pesa and other mobile payment platforms
- **Credit/Debit Cards**: Secure card processing
- **Cash on Delivery**: Traditional payment method
- **Digital Wallets**: Support for popular digital payment solutions

### 📊 **Advanced Analytics**
- **Customer Dashboard**: Order history and tracking
- **Rider Analytics**: Earnings, performance metrics, and insights
- **Admin Portal**: Comprehensive platform management
- **Real-time Reporting**: Live transaction and performance data

## 🏗️ Technical Architecture

### **Frontend Stack**
- **React 19**: Modern component-based UI framework
- **TypeScript**: Type-safe JavaScript for better development experience
- **Inertia.js**: Server-side rendering with SPA-like experience
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Beautiful, customizable icon library

### **Backend Stack**
- **Laravel 11**: Robust PHP framework for web applications
- **PHP 8.2+**: Modern PHP with latest features
- **SQLite/MySQL**: Reliable database solutions
- **Laravel Sanctum**: API authentication and token management
- **Laravel Fortify**: Authentication scaffolding

### **Integration & Services**
- **Google Maps API**: Location services and mapping
- **SMS Services**: OTP verification via Twilio/Vonage
- **Real-time Updates**: WebSocket connections for live data
- **Cloud Storage**: File upload and management

## 👥 User Types & Capabilities

### 🛍️ **Customers**
```typescript
interface CustomerFeatures {
  deliveryCreation: 'Multi-step wizard with Google Maps'
  riderSelection: 'Choose from available riders'
  realTimeTracking: 'GPS tracking with live updates'
  paymentOptions: 'Multiple payment methods'
  orderHistory: 'Complete delivery history'
  ratingSystem: 'Rate riders and deliveries'
}
```

**Customer Journey:**
1. **Create Account** → Phone verification with OTP
2. **Book Delivery** → 5-step wizard with location selection
3. **Choose Rider** → Select from available, rated riders
4. **Track Package** → Real-time GPS tracking
5. **Complete & Rate** → Payment processing and rating

### 🏍️ **Riders**
```typescript
interface RiderFeatures {
  profileManagement: 'Complete profile with verification'
  jobNotifications: 'Real-time delivery opportunities'
  earningsTracking: 'Performance analytics and payouts'
  routeOptimization: 'GPS navigation and route planning'
  onlineStatus: 'Control availability and working hours'
  customerHistory: 'Previous delivery relationships'
}
```

**Rider Journey:**
1. **Register & Verify** → Document upload and background check
2. **Complete Profile** → Vehicle, bank, and contact details
3. **Go Online** → Receive delivery notifications
4. **Accept Jobs** → Choose deliveries based on preferences
5. **Deliver & Earn** → Complete deliveries and track earnings

### 👨‍💼 **Administrators**
```typescript
interface AdminFeatures {
  userManagement: 'User verification and account management'
  platformAnalytics: 'Revenue, usage, and performance metrics'
  transactionMonitoring: 'Real-time transaction oversight'
  riderVerification: 'Background check and document approval'
  systemConfiguration: 'Platform settings and configurations'
  reportGeneration: 'Comprehensive reporting tools'
}
```

**Admin Capabilities:**
- **Dashboard Overview** → Key metrics and platform health
- **User Management** → Verify, ban, or approve users
- **Transaction Monitoring** → Real-time financial oversight
- **Analytics & Reports** → Business intelligence and insights
- **System Settings** → Configure platform parameters

## 🚀 Getting Started

### Prerequisites
- **Node.js 20.19+** or **22.12+**
- **PHP 8.2+**
- **Composer**
- **SQLite** or **MySQL**

### Installation

1. **Clone the Repository**
```bash
git clone https://github.com/Mid4s-dev/mtaani-ryder-web.git
cd mtaani-ryder-web
```

2. **Install Dependencies**
```bash
# PHP dependencies
composer install

# Node.js dependencies
npm install
```

3. **Environment Setup**
```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database and services in .env
```

4. **Database Setup**
```bash
# Run migrations
php artisan migrate

# Seed sample data (optional)
php artisan db:seed --class=RyderMtaaniSeeder
```

5. **Build Assets**
```bash
# Development build
npm run dev

# Production build
npm run build
```

6. **Start Development Server**
```bash
# Laravel development server
php artisan serve

# Vite development server (separate terminal)
npm run dev
```

### Configuration

#### Google Maps API
```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_GOOGLE_MAPS_API_KEY="${GOOGLE_MAPS_API_KEY}"
```

#### SMS Services (Optional)
```env
# Twilio Configuration
TWILIO_SID=your_twilio_sid
TWILIO_TOKEN=your_twilio_token
TWILIO_FROM=your_twilio_phone_number

# Vonage Configuration (Alternative)
VONAGE_KEY=your_vonage_key
VONAGE_SECRET=your_vonage_secret
VONAGE_SMS_FROM=your_vonage_sender_id
```

## 📱 API Documentation

### Authentication Endpoints
```http
POST /api/auth/send-otp        # Send OTP for verification
POST /api/auth/register        # Register new user
POST /api/auth/login          # Login with OTP
GET  /api/auth/me             # Get current user
POST /api/auth/logout         # Logout user
PUT  /api/auth/profile        # Update user profile
```

### Delivery Endpoints
```http
POST /api/deliveries                    # Create new delivery
GET  /api/deliveries                    # Get user deliveries
GET  /api/deliveries/available          # Get available deliveries
GET  /api/deliveries/available-riders   # Get available riders
POST /api/deliveries/{id}/select-riders # Select preferred riders
POST /api/deliveries/{id}/accept        # Accept delivery (rider)
POST /api/deliveries/{id}/reject        # Reject delivery (rider)
PUT  /api/deliveries/{id}/status        # Update delivery status
GET  /api/deliveries/{id}/tracking      # Get tracking information
```

### Rider Endpoints
```http
PUT /api/rider/profile        # Update rider profile
PUT /api/rider/online-status  # Toggle online status
PUT /api/rider/location       # Update current location
GET /api/rider/dashboard      # Get rider dashboard data
GET /api/rider/earnings       # Get earnings summary
```

### Admin Endpoints
```http
GET /api/admin/dashboard      # Get admin dashboard stats
GET /api/admin/transactions   # Get live transactions
GET /api/admin/users          # Get user management data
PUT /api/admin/users/{id}/verification  # Update user verification
PUT /api/admin/users/{id}/status        # Ban/unban users
GET /api/admin/analytics      # Get platform analytics
```

## 🎨 UI Components

The application uses a comprehensive design system built with **Tailwind CSS** and **Radix UI**:

### Component Library
```
📁 resources/js/components/
├── 🎨 ui/                    # Base UI components
│   ├── button.tsx           # Button variations
│   ├── card.tsx             # Card layouts
│   ├── input.tsx            # Form inputs
│   ├── select.tsx           # Dropdown selections
│   ├── tabs.tsx             # Tabbed interfaces
│   └── badge.tsx            # Status indicators
├── 🗺️ maps/                  # Google Maps components
│   ├── GoogleMaps.tsx       # Main map component
│   ├── LocationSearch.tsx   # Address autocomplete
│   └── MapView.tsx          # Interactive map view
└── 📋 forms/                # Form components
    ├── DeliveryForm.tsx     # Delivery creation form
    └── ProfileForm.tsx      # User profile form
```

### Enhanced Pages
```
📁 resources/js/pages/
├── 🏠 LandingPage.tsx           # Marketing landing page
├── 📦 deliveries/
│   ├── CreateEnhanced.tsx       # Multi-step delivery wizard
│   └── TrackingPage.tsx         # Real-time tracking interface
├── 🏍️ rider/
│   ├── DashboardEnhanced.tsx    # Comprehensive rider dashboard
│   └── ProfilePage.tsx          # Rider profile management
└── 👨‍💼 admin/
    └── DashboardEnhanced.tsx    # Admin management portal
```

## 🔐 Security Features

### Authentication & Authorization
- **JWT Token Authentication** via Laravel Sanctum
- **OTP Verification** for phone number confirmation
- **Role-based Access Control** (Customer, Rider, Admin)
- **Session Management** with secure cookie handling

### Data Protection
- **HTTPS Enforcement** in production
- **SQL Injection Prevention** via Eloquent ORM
- **XSS Protection** with input sanitization
- **CSRF Protection** for form submissions

### Privacy Compliance
- **Data Encryption** for sensitive information
- **GDPR Compliance** ready with data export/deletion
- **Audit Logging** for administrative actions
- **Secure File Uploads** with validation and scanning

## 📊 Performance & Scaling

### Frontend Optimization
- **Code Splitting** for faster page loads
- **Image Optimization** with lazy loading
- **Bundle Analysis** and size optimization
- **Progressive Web App** capabilities

### Backend Performance
- **Database Indexing** for query optimization
- **Caching Strategy** with Redis/Memcached
- **Queue Processing** for background tasks
- **API Rate Limiting** to prevent abuse

### Monitoring & Analytics
- **Error Tracking** with detailed logging
- **Performance Monitoring** for response times
- **User Analytics** for behavior insights
- **System Health Checks** and alerts

## 🌍 Deployment

### Production Requirements
- **PHP 8.2+** with required extensions
- **Node.js 20.19+** for asset compilation
- **MySQL/PostgreSQL** for production database
- **Redis** for caching and sessions
- **HTTPS Certificate** for secure connections

### Environment Setup
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=your-database-host
DB_DATABASE=ryder_mtaani
DB_USERNAME=your-db-username
DB_PASSWORD=your-db-password

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
```

### Deployment Script
```bash
#!/bin/bash
# Production deployment script

# Pull latest changes
git pull origin main

# Install/update dependencies
composer install --optimize-autoloader --no-dev
npm ci --production

# Build assets
npm run build

# Database migrations
php artisan migrate --force

# Clear and cache configs
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart queue workers
php artisan queue:restart

echo "Deployment completed successfully!"
```

## 🤝 Contributing

We welcome contributions to Ryder Mtaani! Please follow our contribution guidelines:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit with conventional commits: `git commit -m 'feat: add amazing feature'`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Standards
- **PSR-12** coding standard for PHP
- **ESLint + Prettier** for TypeScript/JavaScript
- **PHPStan Level 8** for static analysis
- **Jest/PHPUnit** for testing coverage

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- **API Documentation**: [https://docs.rydermtaani.com](https://docs.rydermtaani.com)
- **User Guides**: Available in the help section
- **Developer Resources**: Technical documentation for integrations

### Contact
- **Email**: support@rydermtaani.com
- **Phone**: +254 700 000 000
- **GitHub Issues**: [Report bugs and request features](https://github.com/Mid4s-dev/mtaani-ryder-web/issues)

### Community
- **Discord**: Join our developer community
- **Twitter**: [@RyderMtaani](https://twitter.com/RyderMtaani)
- **LinkedIn**: [Company Page](https://linkedin.com/company/ryder-mtaani)

---

**Built with ❤️ for Kenya, by Kenyans** 🇰🇪

*Ryder Mtaani - Connecting communities through technology*