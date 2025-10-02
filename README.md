# Ryder Mtaani - Delivery Management System

A comprehensive delivery management platform built with Laravel and React, designed for connecting customers and riders for efficient last-mile delivery services with comprehensive administrative oversight.

## 🚀 Features

### For Customers
- **Easy Delivery Creation**: Step-by-step delivery request process
- **Real-time Tracking**: Track packages from pickup to delivery
- **OTP Authentication**: Secure login with SMS verification
- **Multiple Payment Options**: Cash, Card, and Mobile Money support
- **Delivery History**: View all past and current deliveries
- **Rating System**: Rate riders and provide feedback

### For Riders
- **Profile Management**: Complete rider verification system
- **Real-time Location**: GPS-based location tracking
- **Earnings Dashboard**: Track daily and total earnings
- **Delivery Management**: Accept, pickup, and deliver packages
- **Online/Offline Status**: Control availability for deliveries
- **Route Optimization**: Find nearby delivery requests

### For Administrators
- **User Management**: Verify and manage customer and rider accounts
- **Platform Analytics**: Monitor delivery metrics and system performance
- **Transaction Oversight**: Real-time monitoring of platform transactions
- **System Configuration**: Configure platform settings and parameters
- **Comprehensive Reporting**: Generate detailed platform reports

## 🛠 Technology Stack

- **Backend**: Laravel 12 with PHP 8.2+
- **Frontend**: React 19 with TypeScript
- **Database**: MySQL/PostgreSQL
- **Authentication**: Laravel Sanctum with OTP
- **UI Framework**: Tailwind CSS with Radix UI
- **Maps Integration**: Google Maps API ready
- **Real-time**: Laravel Broadcasting (WebSockets)
- **Mobile Ready**: PWA support for mobile app conversion

## 📋 Prerequisites

- PHP 8.2 or higher
- Node.js 18 or higher
- Composer
- MySQL or PostgreSQL
- Redis (for queues and caching)

## 🚀 Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/mtaani-ryder-web.git
cd mtaani-ryder-web
```

2. **Install PHP dependencies**
```bash
composer install
```

3. **Install JavaScript dependencies**
```bash
npm install
```

4. **Environment setup**
```bash
cp .env.example .env
php artisan key:generate
```

5. **Configure your environment variables**
```env
# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ryder_mtaani
DB_USERNAME=your_username
DB_PASSWORD=your_password

# SMS/OTP Service (Choose one)
# Twilio
TWILIO_SID=your_twilio_sid
TWILIO_TOKEN=your_twilio_token
TWILIO_FROM=your_twilio_phone

# Vonage (Nexmo)
VONAGE_KEY=your_vonage_key
VONAGE_SECRET=your_vonage_secret
VONAGE_SMS_FROM=your_vonage_number

# Google Maps (for location services)
GOOGLE_MAPS_API_KEY=your_google_maps_key

# Mail Configuration (for notifications)
MAIL_MAILER=smtp
MAIL_HOST=your_smtp_host
MAIL_PORT=587
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
```

6. **Database setup**
```bash
php artisan migrate
php artisan db:seed
```

7. **Build assets**
```bash
npm run build
```

8. **Start the development server**
```bash
# Start Laravel server
php artisan serve

# In another terminal, start Vite dev server
npm run dev

# Start queue worker (for background jobs)
php artisan queue:work
```

## 📱 API Documentation

### Authentication Endpoints

#### Send OTP
```http
POST /api/auth/send-otp
Content-Type: application/json

{
    "phone": "+254712345678",
    "type": "registration" // or "login"
}
```

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+254712345678",
    "password": "password123",
    "password_confirmation": "password123",
    "user_type": "customer", // or "rider", "admin"
    "otp": "123456"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
    "phone": "+254712345678",
    "otp": "123456"
}
```

### Delivery Endpoints

#### Create Delivery
```http
POST /api/deliveries
Authorization: Bearer {token}
Content-Type: application/json

{
    "pickup_name": "John Doe",
    "pickup_phone": "+254712345678",
    "pickup_address": "123 Main St, Nairobi",
    "pickup_latitude": -1.2921,
    "pickup_longitude": 36.8219,
    "delivery_name": "Jane Smith",
    "delivery_phone": "+254798765432",
    "delivery_address": "456 Oak Ave, Karen",
    "delivery_latitude": -1.3197,
    "delivery_longitude": 36.7076,
    "package_type": "Documents",
    "package_description": "Legal documents in envelope",
    "package_size": "small",
    "payment_method": "cash"
}
```

#### Get Available Deliveries (for riders)
```http
GET /api/deliveries/available
Authorization: Bearer {token}
```

#### Accept Delivery
```http
POST /api/deliveries/{id}/accept
Authorization: Bearer {token}
```

#### Update Delivery Status
```http
PUT /api/deliveries/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
    "status": "picked_up", // or "in_transit", "delivered", "cancelled"
    "latitude": -1.2921,
    "longitude": 36.8219,
    "notes": "Package collected successfully"
}
```

## 🔒 Security Features

- **OTP Authentication**: Secure phone-based authentication
- **API Token Authentication**: Laravel Sanctum for API security
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: Prevent API abuse
- **CORS Configuration**: Secure cross-origin requests
- **Data Encryption**: Sensitive data encryption at rest

## 📊 Business Logic

### Pricing Calculation
- **Base Fare**: KES 100 (configurable)
- **Distance Rate**: KES 20 per kilometer
- **Platform Fee**: 15% of total fare
- **Rider Earnings**: 85% of total fare

### Delivery States
1. **Pending**: Waiting for rider acceptance
2. **Accepted**: Rider assigned and en route to pickup
3. **Picked Up**: Package collected from sender
4. **In Transit**: Package being delivered
5. **Delivered**: Package successfully delivered
6. **Cancelled**: Delivery cancelled by customer or rider

## 🚀 Getting Started

To get started with Ryder Mtaani:

1. Follow the installation instructions above
2. Configure your environment variables
3. Run database migrations
4. Start the development servers
5. Access the application at `http://localhost:8000`

## 📱 Mobile App Development

The React frontend is designed to be easily converted to a mobile app using:

### React Native (Recommended)
- Reuse existing React components
- Native performance
- Access to device features (GPS, Camera, Notifications)

### PWA (Progressive Web App)
- Install as app on mobile devices
- Offline functionality
- Push notifications
- Lighter alternative to native apps

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- 📧 Email: support@rydermtaani.com
- 📱 Phone: +254 700 000 000

---

**Ryder Mtaani** - Connecting communities through reliable delivery services 🚴‍♂️📦
