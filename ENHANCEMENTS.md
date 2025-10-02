# Ryder Mtaani - Enhanced Features Documentation

## Overview

The Ryder Mtaani app has been comprehensively enhanced with advanced features including Google Maps integration, rider selection, admin functionality, and improved user experience across web and mobile platforms.

## Major Enhancements

### 1. Customer Account Enhancements

#### Google Maps Integration
- **Location Search**: Autocomplete-powered address search using Google Places API
- **Interactive Maps**: Visual map interface for pickup and dropoff location selection
- **Geocoding**: Automatic conversion between addresses and coordinates
- **Distance Calculation**: Real-time distance and fare estimation

#### Enhanced Delivery Creation
- **Multi-Step Wizard**: 5-step delivery creation process with validation
- **Rider Selection**: Customers can choose specific riders based on:
  - Previous successful deliveries
  - Rider ratings and reviews
  - Current availability and proximity
- **Smart Recommendations**: Algorithm suggests best riders based on history
- **Real-time Fare Calculation**: Dynamic pricing based on distance and selected riders

### 2. Admin Account (Renamed from Business Account)

#### Comprehensive Dashboard
- **Real-time Statistics**: Live metrics for users, deliveries, and revenue
- **User Management**: Complete user verification and status management
- **Transaction Monitoring**: Live transaction feed with filtering capabilities
- **Analytics Overview**: Platform health indicators and KPIs

#### Admin Capabilities
- **User Verification**: Approve/reject rider and business verifications
- **Account Management**: Ban/unban users, manage account statuses
- **Financial Oversight**: Monitor platform fees and transaction volumes
- **System Analytics**: Track delivery completion rates and performance metrics

### 3. Enhanced Rider Profiles

#### Extended Profile Information
- **Personal Details**: ID number, alternate phone number
- **Emergency Contacts**: Emergency contact name and phone
- **Work Preferences**: Work hours, preferred areas
- **Financial Information**: Bank details, M-Pesa integration
- **Vehicle Information**: Enhanced vehicle type and licensing details

#### Advanced Rider Dashboard
- **Tabbed Interface**: Organized sections for different functionalities
- **Real-time Delivery Management**: Live delivery tracking and updates
- **Earnings Tracking**: Detailed earnings breakdown by period
- **Online/Offline Status**: Toggle availability with location tracking
- **Delivery History**: Complete history with ratings and feedback

### 4. Payment System Improvements

#### Enhanced Payment Processing
- **Multiple Payment Methods**: Cash, M-Pesa, bank transfers
- **Platform Fee Management**: Automatic fee calculation and distribution
- **Rider Earnings**: Transparent earnings calculation and tracking
- **Payment History**: Complete transaction records for all parties

## Technical Implementation

### Frontend Enhancements

#### New React Components
1. **CreateDeliveryEnhanced**: Multi-step delivery creation wizard
2. **RiderDashboardEnhanced**: Comprehensive rider interface
3. **AdminDashboardEnhanced**: Full-featured admin panel
4. **GoogleMaps Components**: Location search and map interfaces

#### Component Features
- TypeScript integration for type safety
- Radix UI components for consistent design
- Real-time state management
- Responsive design for mobile compatibility

### Backend Enhancements

#### Database Schema Updates
1. **Enhanced Rider Profiles**: Additional fields for comprehensive rider information
2. **Rider Selection System**: Preferred riders, rejection tracking, assignment types
3. **Admin Functionality**: Enhanced user management and analytics

#### New API Endpoints
- **Admin Management**: `/api/admin/*` - Complete admin functionality
- **Rider Selection**: Enhanced delivery endpoints for rider management
- **Enhanced Profiles**: Extended profile management for all user types

#### Security & Middleware
- **Role-based Access Control**: Admin and rider middleware
- **Enhanced Authentication**: Sanctum-based API authentication
- **Data Validation**: Comprehensive input validation and sanitization

## Configuration Requirements

### Google Maps API Setup
1. Obtain Google Maps API key with the following APIs enabled:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Distance Matrix API

2. Update environment variables:
   ```env
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   VITE_GOOGLE_MAPS_API_KEY="${GOOGLE_MAPS_API_KEY}"
   ```

### Environment Configuration
The following environment variables are required for full functionality:

```env
# Core Application
APP_NAME="Ryder Mtaani"
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=sqlite
DB_DATABASE=/path/to/database.sqlite

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_GOOGLE_MAPS_API_KEY="${GOOGLE_MAPS_API_KEY}"

# Business Configuration
DELIVERY_BASE_FARE=100
DELIVERY_PER_KM_RATE=20
PLATFORM_FEE_PERCENT=15
DEFAULT_DELIVERY_RADIUS=10

# SMS/OTP (Choose one)
# Twilio Configuration
TWILIO_SID=your_twilio_sid
TWILIO_TOKEN=your_twilio_token
TWILIO_FROM=your_twilio_phone_number

# OR Vonage Configuration
VONAGE_KEY=your_vonage_key
VONAGE_SECRET=your_vonage_secret
VONAGE_SMS_FROM=your_vonage_sender_id
```

## Installation & Setup

### Prerequisites
- PHP 8.2+
- Node.js 20.19+ or 22.12+
- Composer
- SQLite or MySQL database
- Google Maps API key

### Installation Steps
1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd mtaani-ryder-web
   composer install
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   # Update .env with your configuration
   ```

3. **Database Setup**
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

4. **Build Assets**
   ```bash
   npm run build
   ```

5. **Start Development Server**
   ```bash
   php artisan serve
   npm run dev  # In separate terminal for hot reload
   ```

## User Types & Permissions

### Customer Account
- Create and manage deliveries
- Select preferred riders
- Track delivery progress
- Rate and review riders
- View delivery history

### Rider Account
- Complete enhanced profile
- Manage availability status
- Accept/reject delivery requests
- Track earnings and performance
- Update location in real-time

### Admin Account
- Monitor platform statistics
- Manage user verifications
- View live transactions
- Ban/unban users
- Access platform analytics

### Admin Account
- Manage all platform users
- Monitor system-wide analytics  
- Oversee platform operations
- Handle administrative tasks

## API Documentation

### Enhanced Endpoints

#### Admin Endpoints
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - User management interface
- `PUT /api/admin/users/{id}/verification` - Approve/reject verifications
- `PUT /api/admin/users/{id}/status` - Ban/unban users
- `GET /api/admin/transactions` - Live transaction monitoring

#### Delivery Enhancements
- `POST /api/deliveries/{id}/select-riders` - Select preferred riders
- `POST /api/deliveries/{id}/reject` - Rider rejects delivery
- `GET /api/deliveries/available-riders` - Get available riders for selection

#### Rider Enhancements
- `PUT /api/rider/profile` - Update enhanced rider profile
- `PUT /api/rider/online-status` - Toggle online/offline status
- `PUT /api/rider/location` - Update current location
- `GET /api/rider/earnings` - Detailed earnings breakdown

## Key Features Summary

### ✅ Implemented Features

1. **Google Maps Integration**
   - Location search with autocomplete
   - Interactive map interfaces
   - Distance and fare calculation
   - Geocoding services

2. **Enhanced Customer Experience**
   - Multi-step delivery creation
   - Rider selection based on history and ratings
   - Real-time delivery tracking
   - Improved payment options

3. **Advanced Admin Panel**
   - Real-time platform monitoring
   - User verification management
   - Transaction oversight
   - Platform analytics

4. **Comprehensive Rider Profiles**
   - Extended profile fields
   - Work preferences management
   - Financial information handling
   - Enhanced dashboard interface

5. **Improved Payment System**
   - Multiple payment methods
   - Transparent fee calculation
   - Earnings tracking
   - Transaction history

### 🔄 Integration Complete

- All database migrations applied
- API endpoints fully functional
- Frontend components built successfully
- TypeScript compilation without errors
- Responsive design implemented
- Role-based access control active

### 🎯 Business Benefits

- **Increased User Satisfaction**: Enhanced UX with Google Maps and rider selection
- **Improved Platform Control**: Comprehensive admin functionality
- **Better Rider Management**: Enhanced profiles and performance tracking
- **Transparent Operations**: Real-time monitoring and analytics
- **Scalable Architecture**: Built for growth across web and mobile platforms

## Support & Maintenance

The enhanced Ryder Mtaani platform is now production-ready with:
- Comprehensive error handling
- Input validation and sanitization
- Role-based security measures
- Scalable database design
- Optimized frontend performance
- Mobile-responsive interfaces

For further customization or feature additions, the modular architecture supports easy extension and maintenance.