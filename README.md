
## Project Name : Vehicle Rental System
## Live URL : https://assignment-2-kappa-one.vercel.app

This project implements a backend API for a Vehicle Rental System. It supports managing vehicles, users, and bookings — with role-based access (admin and customer), JWT authentication, password hashing, and PostgreSQL persistence. The backend is developed using Node.js + TypeScript and Express.js.

# Features List
## User & Auth
- User Registration (Signup)
- User Login (Signin)
- Password hashing using bcrypt
- JWT authentication
- Role-based access: admin and customer

## Vehicles

- Admin can create, update, delete vehicles
- Public endpoints to view all vehicles or single vehicle
- Vehicles have: Name, type, registration number, Daily rent price, Availability status (available / booked)

## Bookings
- Customer can create a booking
- System checks vehicle availability
- Total price auto-calculated
- Admin/Customer can update booking: Cancel booking, Mark returned
- System updates vehicle status accordingly

## Architecture
- Feature-based modular structure
- Routes -> Controllers -> Services -> Database
- Centralized error handling
- PostgreSQL queries using pg pool
## Technology Stack

**Node.js** for Runtime

**Express.js** for Server Framework

**TypeScript** for Type Safety 

**PostgreSQL** for Database

**bcryptjs** for Password Hashing

**jsonwebtoken** for Authentication

**dotenv** for Environment Variables

# How to setup
## 1. Clone repository  
```bash
  git clone https://github.com/devnayemali/assignment-2
  cd assignment-2 
```

## 2. Install dependencies  
```bash
npm install
```

## 3. Setup environment variables (create a .env file) 
```bash
CONNECTION_STRING=
PORT=
SECRET_KEY=
``` 

## 5. Start server  

```bash
npm run dev
npm run build    // for deploy
``` 