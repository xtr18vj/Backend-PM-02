# Authentication & Security Backend

A complete authentication system with secure token management, email verification, and password reset functionality.

## Features

✅ **User Registration** with email validation  
✅ **Email Verification** flow  
✅ **Secure Login** with bcrypt password hashing  
✅ **JWT Access Tokens** (short-lived, 15min)  
✅ **Refresh Tokens** with rotation (7 days)  
✅ **Logout** (single device & all devices)  
✅ **Password Reset** via email  
✅ **Rate Limiting** protection  
✅ **Security Headers** (Helmet)  
✅ **CORS** configured  

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your settings
```

### 3. Start Server
```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication Flow

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| GET | `/api/auth/verify-email?token=xxx` | Verify email | No |
| POST | `/api/auth/login` | Login & get tokens | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| POST | `/api/auth/logout` | Logout (single device) | Yes |
| POST | `/api/auth/logout-all` | Logout all devices | Yes |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/resend-verification` | Resend verification email | Yes |

## Request Examples

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "SecurePass123"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "SecurePass123"}'
```

### Access Protected Route
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <access_token>"
```

### Refresh Token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<refresh_token>"}'
```

## Security Features

### Password Hashing
- Uses **bcrypt** with configurable rounds (default: 12)
- Passwords are never stored in plain text

### Token Strategy
- **Access Token**: JWT, 15-minute expiry, stored in memory
- **Refresh Token**: Random 64-byte hex, 7-day expiry, stored hashed in DB
- **Token Rotation**: New refresh token issued on each refresh

### Rate Limiting
- General: 100 requests per 15 minutes
- Auth endpoints: 10 requests per 15 minutes

### Additional Security
- Helmet.js for security headers
- CORS properly configured
- Input validation with express-validator
- SQL injection protection (parameterized queries)

## Database Schema

```sql
-- Users table
users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_verified INTEGER DEFAULT 0,
  created_at TEXT,
  updated_at TEXT
)

-- Refresh tokens table
refresh_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked INTEGER DEFAULT 0,
  created_at TEXT
)

-- Verification tokens table
verification_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  token TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0
)

-- Password reset tokens table  
password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0
)
```

## Auth Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                       │
└─────────────────────────────────────────────────────────────┘

 REGISTER ──► Hash Password ──► Store User ──► Send Verification Email
                                                      │
                                                      ▼
 VERIFY EMAIL ◄────────────── Click Link ◄─── User Receives Email
      │
      ▼
 LOGIN ──► Verify Password ──► Generate Access + Refresh Tokens
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    │                                           │
                    ▼                                           ▼
              Access Token                              Refresh Token
              (15 min JWT)                             (7 days, in DB)
                    │                                           │
                    ▼                                           │
              API Requests                                      │
                    │                                           │
              (Token Expired?)                                  │
                    │                                           │
                    ▼                                           │
              REFRESH ◄─────────────────────────────────────────┘
                    │
                    ▼
              New Access Token + Rotated Refresh Token
                    
 LOGOUT ──► Revoke Refresh Token ──► Clear Client Tokens
```

## Project Structure

```
src/
├── config/
│   └── index.js          # Configuration settings
├── database/
│   ├── connection.js     # SQLite connection
│   ├── migrate.js        # Database migrations
│   └── repositories.js   # Data access layer
├── middleware/
│   ├── auth.js           # JWT authentication
│   └── validation.js     # Input validation
├── routes/
│   └── auth.js           # Auth endpoints
├── services/
│   ├── tokenService.js   # Token generation/verification
│   └── emailService.js   # Email sending
└── server.js             # Express app entry point
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `JWT_ACCESS_SECRET` | Access token secret | - |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `JWT_ACCESS_EXPIRY` | Access token expiry | 15m |
| `JWT_REFRESH_EXPIRY` | Refresh token expiry | 7d |
| `DATABASE_PATH` | SQLite database path | ./data/auth.db |
| `BCRYPT_ROUNDS` | Bcrypt cost factor | 12 |
| `FRONTEND_URL` | Frontend URL for emails | http://localhost:3001 |
