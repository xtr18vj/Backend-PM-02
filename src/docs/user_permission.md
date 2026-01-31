# User Field-Level Permissions

## Overview
This document defines which user profile fields can be edited by different roles.

## Permission Matrix

| Field             | User Can Edit | Admin Can Edit | Notes |
|-------------------|---------------|----------------|-------|
| Name              | ✅ Yes        | ✅ Yes         | Display name |
| Email             | ❌ No         | ✅ Yes         | Requires re-verification |
| Password          | ✅ Yes        | ❌ No          | Via reset flow only |
| Role              | ❌ No         | ✅ Yes         | user/admin/moderator |
| Status            | ❌ No         | ✅ Yes         | active/inactive/suspended/pending |
| Profile Photo     | ✅ Yes        | ✅ Yes         | URL to image |
| Phone             | ✅ Yes        | ✅ Yes         | Contact number |
| Bio               | ✅ Yes        | ✅ Yes         | Max 500 chars |
| Is Verified       | ❌ No         | ✅ Yes         | Email verification status |

## User Editable Fields
Users can update their own profile with these fields:
- `name` - Display name (2-100 characters)
- `profile_photo` - Valid URL to profile image
- `phone` - Phone number (7-20 characters)
- `bio` - Biography (max 500 characters)

## Admin Only Fields
Only administrators can modify:
- `email` - User's email address (must be unique)
- `role` - User role (user, admin, moderator)
- `status` - Account status (active, inactive, suspended, pending)
- `is_verified` - Email verification status

## API Endpoints

### User Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get own profile |
| PUT | `/api/users/profile` | Update own profile (user-editable fields only) |
| GET | `/api/users/profile/:userId` | Get public profile of another user |

### Admin Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/admin/users` | List all users (with filters) |
| GET | `/api/users/admin/users/:userId` | Get any user's full profile |
| PUT | `/api/users/admin/users/:userId` | Update any user (all fields) |
| DELETE | `/api/users/admin/users/:userId` | Delete a user |

## Roles

### User
- Default role for new registrations
- Can view and edit own profile
- Can view public profiles of other users

### Moderator
- Extended permissions for content management
- Same profile permissions as regular users

### Admin
- Full access to user management
- Can modify any user's profile
- Can change roles and account status
- Can delete user accounts