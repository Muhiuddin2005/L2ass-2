VEHICLE RENTAL SYSTEM API

A REST API for managing vehicle rentals with JWT authentication, role-based access control, and automated booking management.

================================================================================

FEATURES

- Authentication: JWT-based login/signup with bcryptjs password hashing
- Vehicle Management: Admin CRUD operations with real-time availability tracking
- User Management: Role-based profiles (Admin/Customer) with access restrictions
- Booking System: Create, retrieve, and manage bookings with auto price calculation
- Auto-Return Logic: Automatically marks bookings as returned when rental period expires
- Role-Based Access: Different data views for Admin vs Customer users

================================================================================

TECHNOLOGY STACK

Runtime:         Node.js, TypeScript
Framework:       Express.js
Database:        PostgreSQL
Authentication:  JWT, bcryptjs
Development:     tsx, dotenv

================================================================================

SETUP AND INSTALLATION

Prerequisites

- Node.js 
- PostgreSQL 
- npm 

Installation Steps

1. Clone and Install

   git clone <repo-url>
   cd "PH L2/Assignment/2"
   npm install

2. Configure Environment

   Create .env file with:

   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=vehicle_rental
   PORT=3000
   JWT_SECRET=your_secret_key

3. Setup Database

   createdb vehicle_rental

4. Start Server

   npm run dev

   Server runs on http://localhost:3000

================================================================================

USAGE INSTRUCTIONS

API Base URL

http://localhost:3000/api/v1

Authentication

Include JWT token in request headers:

Authorization: Bearer <token>

Quick Examples

Register User:
POST /auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "01712345678",
  "role": "customer"
}

Login:
POST /auth/signin
{
  "email": "john@example.com",
  "password": "password123"
}

Get All Vehicles (Public):
GET /vehicles

Create Booking:
POST /bookings
Authorization: Bearer <token>
{
  "customer_id": 1,
  "vehicle_id": 1,
  "rent_start_date": "2024-01-15",
  "rent_end_date": "2024-01-20"
}

================================================================================

API ENDPOINTS

Authentication
POST /auth/signup             Public
POST /auth/signin             Public

Vehicles
GET /vehicles                 Public
GET /vehicles/:id             Public
POST /vehicles                Admin
PUT /vehicles/:id             Admin
DELETE /vehicles/:id          Admin

Users
GET /users                    Admin
PUT /users/:id                Admin/Self
DELETE /users/:id             Admin

Bookings
POST /bookings                Customer/Admin
GET /bookings                 Customer/Admin
PUT /bookings/:id             Customer/Admin

================================================================================

PROJECT STRUCTURE

src/
  server.ts
  config/
    db.ts
    index.ts
  middleware/
    auth.ts
  modules/
    bookings/
    users/
    vehicles/
  types/
    express/

================================================================================

BUSINESS RULES

Price Calculation: total_price = daily_rent_price x number_of_days

Vehicle Status Updates:
  - Booking Created: Vehicle status becomes booked
  - Booking Returned: Vehicle status becomes available
  - Booking Cancelled: Vehicle status becomes available

Auto-Return: Bookings marked as returned when rent period expires

Deletion Constraints: Users and vehicles cannot be deleted if they have active bookings

Role Restriction: Customers can only update own profile and cannot change role

================================================================================

RESPONSE FORMAT

Success Response:
{
  "success": true,
  "message": "Operation description",
  "data": {}
}

Error Response:
{
  "success": false,
  "message": "Error description"
}

================================================================================

KEY FEATURES IMPLEMENTED

- JWT authentication with 7-day expiry
- Role-based access control (RBAC)
- Auto-return logic on rent end date
- Vehicle availability real-time tracking
- Secure password hashing
- Parameterized SQL queries (injection-safe)
- Type-safe TypeScript implementation

================================================================================


