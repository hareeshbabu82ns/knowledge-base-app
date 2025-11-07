# HKBase Application Documentation

**Last Updated:** November 7, 2025

This document provides comprehensive documentation for all features and implementations in the HKBase knowledge base application.

---

## Table of Contents

1. [User Authentication & Signup](#user-authentication--signup)
2. [OAuth Account Merging](#oauth-account-merging)
3. [Two-Factor Authentication (TOTP)](#two-factor-authentication-totp)
4. [Admin & Signup Restrictions](#admin--signup-restrictions)
5. [User Profile & Management](#user-profile--management)

---

# User Authentication & Signup

## Overview

The signup feature allows new users to register for an account in the HKBase application. Users can sign up using email/password credentials or through OAuth providers (Google, GitHub). Additionally, users who previously signed up with OAuth can add a password to their account to enable credentials-based login.

## Implementation Details

### Components and Files

1. **Signup Page**: `/app/(auth)/sign-up/page.tsx`

   - Client-side React component with form validation
   - Uses react-hook-form with zod validation
   - Supports credential-based signup and OAuth (Google)
   - Provides real-time validation feedback

2. **Server Action**: `/lib/auth/actions.ts` - `signUp` function

   - Type-safe server action using TanStack Query pattern
   - Validates user input with zod schema
   - Checks for existing users
   - **Merges with OAuth accounts**: If user exists without password (OAuth user), adds password to enable credentials login
   - Prevents duplicate accounts with existing passwords
   - Hashes passwords with bcrypt (10 rounds)
   - Returns discriminated union response type

3. **Validation Schema**: `/lib/validations/user.ts` - `UserSignupSchema`

   - Name: minimum 5 characters, maximum 100 characters
   - Email: valid email format
   - Password: minimum 4 characters (can be enhanced with complexity rules)

4. **Routes Configuration**: `/config/routes.ts`

   - `/sign-up` is configured as a public route
   - Accessible without authentication

5. **Middleware**: `/middleware.ts`
   - Redirects authenticated users away from `/sign-up` to dashboard
   - Prevents duplicate account creation while logged in

### Features

#### Credential-Based Signup

- Users provide name, email, and password
- Password is securely hashed using bcrypt
- Email verification is auto-completed for credentials signup
- Users are automatically signed in upon successful registration

#### OAuth Signup

- Google OAuth integration
- Seamless account creation via OAuth providers
- Redirects to dashboard after successful signup

#### Form Validation

- Client-side validation using react-hook-form and zod
- Real-time error feedback
- Field-level error messages
- Loading states during submission

#### Error Handling

- Duplicate email detection (only for users with existing passwords)
- OAuth account merging (for users without passwords)
- Validation error messages
- Toast notifications for success/error states
- Type-safe error responses

## User Flow

### New User Signup

1. User navigates to `/sign-up`
2. User fills in registration form (name, email, password)
3. Form validation occurs on blur and submit
4. On submit:
   - Server action validates input
   - Checks for existing user with same email
   - If no user exists, creates new account
   - Hashes password
   - Redirects to TOTP setup
5. Alternatively, user can click "Sign up with Google" for OAuth signup

### OAuth User Adding Password

1. User who previously signed up with Google navigates to `/sign-up`
2. User enters their email (same as OAuth account) and desired password
3. Form validation occurs
4. On submit:
   - Server action validates input
   - Detects existing OAuth user without password
   - Adds hashed password to existing account
   - Updates user name if provided
   - Shows success message: "Password added to your account!"
5. User can now sign in with either Google OAuth or email/password

## Security Features

- Passwords are hashed using bcrypt with 10 rounds
- CSRF protection via NextAuth
- Type-safe server actions prevent injection attacks
- Input sanitization through zod validation
- Secure session management via NextAuth
- Auto email verification for credential signups

## API Response Types

```typescript
export type SignUpResponse =
  | { status: "success"; userId: string }
  | { status: "error"; error: string };
```

---

# OAuth Account Merging

## Overview

The signup process seamlessly handles merging OAuth accounts with credential-based authentication, allowing users to sign in using multiple methods.

## Flow Diagram

```
User Signup Request
        |
        v
   Validate Input
   (zod schema)
        |
        v
  Check Existing User
   (by email)
        |
        +--------------------+--------------------+
        |                    |                    |
        v                    v                    v
   No User Found      User Exists          User Exists
                     (no password)        (with password)
        |                    |                    |
        v                    v                    v
  Create New User     Add Password         Return Error
  - Hash password     to Existing          "Account exists,
  - Set role: USER    - Update name        please sign in"
  - Return userId     - Hash password
        |             - Return userId
        |                    |
        +--------------------+
                 |
                 v
        Redirect to TOTP Setup
```

## Scenarios

### Scenario 1: New User Registration

**User Action**: Signs up with email `john@example.com` and password

**System Behavior**:

1. Validates input
2. Checks database - no user found
3. Creates new user with hashed password
4. Returns userId
5. Shows: "Account created successfully!"

**Result**: User must set up TOTP before accessing the application

---

### Scenario 2: OAuth User Adding Password

**User Action**:

1. Previously signed up with Google (email: `jane@gmail.com`)
2. Now visits signup page and enters same email with password

**System Behavior**:

1. Validates input
2. Checks database - user exists WITHOUT password
3. Updates existing user:
   - Adds hashed password
   - Updates name if provided
   - Preserves email verification status
4. Returns userId
5. Shows: "Password added to your account! You can now sign in with email and password."

**Result**: User must set up TOTP, then can sign in with BOTH:

- Google OAuth
- Email/password credentials

---

### Scenario 3: Duplicate Credentials Account

**User Action**:

1. Previously signed up with email/password
2. Tries to sign up again with same email

**System Behavior**:

1. Validates input
2. Checks database - user exists WITH password
3. Returns error
4. Shows: "An account with this email already exists. Please sign in instead."

**Result**: User needs to sign in with existing credentials

---

## Benefits

1. **Single Account**: Users maintain one account regardless of sign-in method
2. **Flexibility**: Users can choose their preferred sign-in method
3. **No Data Loss**: All user data and relationships are preserved
4. **Better UX**: No confusing "account already exists" errors for OAuth users
5. **Security**: Each method maintains its own security (OAuth tokens vs hashed passwords)

---

# Two-Factor Authentication (TOTP)

## Overview

This implementation adds mandatory Two-Factor Authentication (2FA) using TOTP for all password-based sign-ins and sign-ups in the HKBase application.

## Features

### 1. Mandatory TOTP Setup During Sign-Up

- After creating an account with email/password, users must set up TOTP
- QR code is displayed for easy setup with authenticator apps (Google Authenticator, Authy, etc.)
- Manual entry code provided as fallback
- 10 backup codes generated for account recovery
- Setup cannot be bypassed - users must complete TOTP setup to access the application

### 2. TOTP Verification During Sign-In

- Password authentication validates credentials first
- System checks if user has TOTP enabled before attempting sign-in
- If TOTP is enabled, a second step prompts for the 6-digit code
- Supports both 6-digit TOTP codes and 8-character hexadecimal backup codes
- Clear error messages for invalid codes
- Backup codes are single-use and removed after use

### 3. User Profile TOTP Management

Users can manage their TOTP settings from their profile:

- **View Status**: See if 2FA is enabled and remaining backup codes count
- **Enable 2FA**: Set up TOTP if not already enabled
- **Disable 2FA**: Remove TOTP protection (requires password or TOTP verification)
- **Regenerate Backup Codes**: Generate new backup codes (old ones are invalidated)
- **Download/Copy Codes**: Save backup codes securely

### 4. Admin TOTP Management

Admins can manage TOTP for any user:

- View all users and their 2FA status
- Reset TOTP for locked-out users
- Force disable 2FA for security incidents
- No password required for admin operations

## Technical Implementation

### Database Schema

```prisma
model User {
  // ... existing fields
  totpSecret      String?   // Encrypted TOTP secret
  totpEnabled     Boolean   @default(false)
  totpBackupCodes String[]  @default([]) // Hashed backup codes
}
```

### Key Components

#### 1. TOTP Utilities (`lib/auth/totp.ts`)

- `generateTOTPSecret()`: Creates new TOTP secret
- `generateQRCode()`: Generates QR code data URL
- `verifyTOTP()`: Validates TOTP tokens
- `generateBackupCodes()`: Creates backup codes
- `encrypt()/decrypt()`: Secures TOTP secrets in database

#### 2. Server Actions (`app/actions/totp-actions.ts`)

- `setupTOTP()`: Initiates TOTP setup
- `enableTOTP()`: Activates TOTP after verification
- `verifyUserTOTP()`: Validates TOTP codes
- `disableTOTP()`: Removes TOTP protection
- `regenerateBackupCodes()`: Creates new backup codes
- `getTOTPStatus()`: Retrieves user's 2FA status
- `checkTOTPByEmail()`: Checks if email has TOTP enabled (public endpoint)

#### 3. Authentication Flow (`lib/auth/index.ts`)

Updated credentials provider to check for TOTP:

```typescript
// After password verification
if (dbUser.totpEnabled && dbUser.totpSecret) {
  if (!credentials.totpCode) {
    throw new Error("TOTP verification required");
  }
  // Verify TOTP code
}
```

#### 4. Sign-In Page (`app/(auth)/sign-in/page.tsx`)

Improved two-step authentication process:

1. Email + Password entry
2. Check TOTP status using `checkTOTPByEmail()`
3. If TOTP enabled, show TOTP code input
4. TOTP code verification (supports both 6-digit codes and 8-character backup codes)

#### 5. Sign-Up Page (`app/(auth)/sign-up/page.tsx`)

Three-step registration process:

1. Account creation
2. TOTP setup (scan QR code)
3. Backup codes display

#### 6. Profile Management (`app/(app)/profile/_components/totp-management.tsx`)

Complete TOTP management interface for users

#### 7. Admin Management (`app/(app)/profile/_components/user-management.tsx`)

Admin controls for user TOTP management

## Security Features

### Encryption

- TOTP secrets are encrypted using AES-256-CBC before storage
- Encryption key stored in environment variable (`TOTP_ENCRYPTION_KEY`)
- Each secret has unique initialization vector (IV)

### Backup Codes

- Generated using cryptographically secure random bytes (8 hexadecimal characters)
- Hashed with bcrypt before storage (salt rounds: 10)
- Single-use - removed from database after successful use
- 10 codes generated by default
- Format: `ABCD1234` (8 hex chars = 32 bits of entropy)

### Time Window

- 30-second time step (standard TOTP)
- Accepts codes within ±1 time window (90 seconds total)
- Prevents replay attacks

### Input Validation

**Sign-In Form**:

- Accepts 6-digit TOTP codes OR 8-character backup codes
- Validates length: 6 or 8 characters only
- Filters non-hex characters for backup codes
- Auto-uppercase for consistency
- Clear placeholder: "000000 or ABCD1234"

**Server Validation**:

```typescript
const VerifyTOTPSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  token: z
    .string()
    .min(6, "Token must be at least 6 characters")
    .max(8, "Token must be at most 8 characters"),
});
```

## TOTP Login Flow

### Enhanced Sign-In Process

**Before**:

1. Try to sign in with email/password
2. If error contains "TOTP", show TOTP input
3. Try again with TOTP code
   ❌ Unreliable - depends on error message parsing

**After** (Current Implementation):

1. User enters email and password
2. Click "Sign In"
3. System checks TOTP status using `checkTOTPByEmail()`
4. If TOTP enabled → show TOTP input field immediately
5. If TOTP not enabled → proceed with normal sign-in
6. User enters 6-digit code or 8-character backup code
7. Sign in with email/password/totpCode

✅ **Benefits**:

- More reliable (no error message parsing)
- Better UX (shows TOTP input immediately if needed)
- No failed authentication attempts
- Clearer flow with explicit TOTP check
- Privacy-preserving (doesn't reveal if email exists)

### Backup Code Login Fix

Users can now sign in using their backup codes:

1. Enter email and password
2. Click "Sign In"
3. TOTP field appears
4. Enter 8-character backup code (e.g., `ABCD1234`)
5. Click "Verify & Sign In"
6. ✅ Successfully signed in
7. ✅ Backup code removed from database

**Key Improvements**:

- Input field accepts hexadecimal characters (0-9, A-F)
- Maximum length increased to 8 characters
- Automatic uppercase conversion
- Clear helper text: "6 digits from your authenticator app or 8-character backup code"

### Signup Flow with TOTP

**After Signup Fix (Nov 7, 2025)**:

The signup flow was failing with "Unauthorized" error when trying to set up TOTP. Fixed by modifying the authorization logic in `setupTOTP` and `enableTOTP` server actions:

**Before**:

```typescript
if (userId && userId !== session?.user?.id) {
  if (session?.user?.role !== "ADMIN") {
    return { status: "error", error: "Unauthorized" };
  }
}
```

**After**:

```typescript
if (userId && session && userId !== session?.user?.id) {
  // Only check admin authorization if there's a session
  if (session?.user?.role !== "ADMIN") {
    return { status: "error", error: "Unauthorized" };
  }
}
```

**Flow**:

1. Go to `/sign-up`
2. Fill in name, email, password
3. Click "Create an account"
4. ✅ See TOTP QR code (not "Unauthorized" error)
5. Scan QR code with authenticator app
6. Enter 6-digit code
7. ✅ See backup codes
8. Click "Continue"
9. ✅ Redirect to sign-in page
10. Sign in with email, password, and TOTP code

## Compatible Authenticator Apps

- Google Authenticator (iOS, Android)
- Microsoft Authenticator (iOS, Android)
- Authy (iOS, Android, Desktop)
- 1Password (cross-platform)
- Bitwarden (cross-platform)
- Any RFC 6238 compliant TOTP app

## Environment Variables

```bash
# Required for TOTP encryption
TOTP_ENCRYPTION_KEY=<base64-encoded-32-byte-key>
```

Generate a secure key:

```bash
openssl rand -base64 32
```

## Dependencies

```json
{
  "otpauth": "^9.4.1", // TOTP generation and verification
  "qrcode": "^1.5.4", // QR code generation
  "@types/qrcode": "^1.5.6" // TypeScript types
}
```

## Database Migration

### Migration Steps

1. **Update Prisma Schema** (Already done)
2. **Generate Prisma Client**:
   ```bash
   pnpm db:gen
   ```
3. **Apply Migration**:
   ```bash
   pnpm db:migrate
   ```
   Migration name: `add_totp_fields_to_user`

### Backward Compatibility

✅ **Safe Migration:** All new fields are nullable or have default values

- `totpSecret`: `String?` (optional/nullable)
- `totpEnabled`: `Boolean` with default `false`
- `totpBackupCodes`: `String[]` with default empty array `[]`

### Existing Data

Existing users will have:

- `totpSecret`: `null`
- `totpEnabled`: `false`
- `totpBackupCodes`: `[]`

## Testing Checklist

### Sign-In Tests

- [ ] User WITHOUT TOTP: Enter email/password → Sign in successfully
- [ ] User WITH TOTP: Enter email/password → See TOTP field → Enter code → Sign in
- [ ] Invalid TOTP code: Show error, clear field, remain on TOTP screen
- [ ] Backup code login: Enter 8-char code → Sign in → Code removed from DB
- [ ] Invalid length: Enter 5-digit code → Show error message

### Sign-Up Tests

- [ ] New user signup → TOTP QR code appears
- [ ] Scan QR code → Enter verification code → See backup codes
- [ ] Save backup codes → Continue → Redirect to sign-in
- [ ] Sign in with new credentials and TOTP code

### Input Validation Tests

- [ ] TOTP field accepts 0-9 and A-F characters only
- [ ] Maximum 8 characters enforced
- [ ] Auto-uppercase for backup codes
- [ ] Clear placeholder and helper text shown

## Troubleshooting

### Common Issues

**Issue**: "Invalid TOTP code" error

- Check time sync on server and phone
- Verify code is current (30-second window)
- Try using backup code instead

**Issue**: Backup codes not working

- Ensure code is entered correctly (8 characters)
- Verify code hasn't been used before
- Check uppercase/lowercase (should auto-convert)

**Issue**: Lost authenticator device

- Use backup code to sign in
- Immediately regenerate backup codes
- Set up new authenticator
- If no backup codes, contact admin for TOTP reset

**Issue**: Signup fails with "Unauthorized"

- Verify you're using the latest code with signup fix
- Check server logs for detailed error
- Ensure TOTP encryption key is set in environment

---

# Admin & Signup Restrictions

## Overview

The application supports admin user management and signup restriction features for controlling access to the application.

## Features

### Admin Users

#### Setting Admin Emails

Admin users are defined via the `ADMIN_EMAILS` environment variable:

```bash
ADMIN_EMAILS="admin@example.com,manager@company.com,owner@domain.com"
```

- Multiple emails should be comma-separated
- Emails are case-insensitive
- Users with these emails will automatically be assigned the ADMIN role

#### Automatic Admin Role Assignment

When users sign in:

- The system checks if their email is in the `ADMIN_EMAILS` list
- If matched, their role is automatically updated to ADMIN
- This happens on every sign-in, so you can add/remove admins by updating the environment variable

#### Manual Admin Seeding

To update existing users to admin role:

```bash
pnpm tsx scripts/seed-admins.ts
```

This script:

- Reads the `ADMIN_EMAILS` environment variable
- Updates all matching users to ADMIN role
- Displays a list of all current admin users

### Signup Restrictions

#### Accessing Admin Settings

1. Sign in as an admin user
2. Navigate to **Settings** page
3. You'll see an **Admin Settings** section (only visible to admins)

#### Configuring Signup Restrictions

**Enable/Disable Restrictions**:

- Toggle **Restrict Signups** to enable or disable the feature
- When disabled, anyone can sign up
- When enabled, only allowed emails/domains can sign up

**Allowed Email Addresses**:
Add specific email addresses that are allowed to sign up:

- Enter emails one per line or comma-separated
- Example:
  ```
  user1@example.com
  user2@company.com
  approved@domain.org
  ```

**Allowed Email Domains**:
Add domains that are allowed to sign up:

- Enter domains one per line or comma-separated
- Do not include the @ symbol
- Example:
  ```
  company.com
  organization.org
  trusted-domain.net
  ```

#### Signup Validation Logic

When signup restrictions are enabled:

1. **For Credentials Signup** (email/password):

   - Email is validated before account creation
   - User receives an error message if not authorized

2. **For OAuth Signups** (Google, GitHub, etc.):

   - Email is validated during the sign-in callback
   - User is redirected to sign-in page with an error message if not authorized

3. **Validation Rules**:
   - If email exactly matches an allowed email → ✅ Allowed
   - If email domain matches an allowed domain → ✅ Allowed
   - Otherwise → ❌ Blocked

#### Example Configuration

**Scenario**: Allow only company employees and specific partners

```
Restrict Signups: Enabled

Allowed Emails:
partner1@external.com
consultant@freelancer.net

Allowed Domains:
mycompany.com
subsidiary.net
```

**Results**:

- ✅ `employee@mycompany.com` - Allowed (domain match)
- ✅ `anyone@subsidiary.net` - Allowed (domain match)
- ✅ `partner1@external.com` - Allowed (email match)
- ❌ `random@gmail.com` - Blocked (no match)

## API Reference

### Server Actions

#### `getAppSettings()`

Retrieves current app settings (admin only)

#### `updateAppSettings(data)`

Updates app settings (admin only)

**Parameters**:

```typescript
{
  restrictSignup: boolean;
  allowedSignupEmails: string[];
  allowedSignupDomains: string[];
}
```

### Validation Functions

#### `validateSignupEmail(email: string)`

Validates if an email is allowed to sign up

**Returns**:

```typescript
{
  isAllowed: boolean;
  error?: string;
}
```

#### `isAdminEmail(email: string)`

Checks if email is in ADMIN_EMAILS list

**Returns**: `boolean`

## Database Schema

```prisma
model AppSettings {
  id                   String   @id @default(auto()) @map("_id") @db.ObjectId
  allowedSignupEmails  String[] @default([])
  allowedSignupDomains String[] @default([])
  restrictSignup       Boolean  @default(false)
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}
```

## Security Considerations

1. **Admin Emails**: Store in environment variables, never commit to version control
2. **Settings Page**: Only accessible by admin users (role-based access)
3. **Validation**: Runs on both client and server side for security
4. **Error Handling**: Generic error messages to prevent email enumeration attacks

---

# User Profile & Management

## Overview

The application includes a comprehensive user profile system with profile management and admin-only user management capabilities.

## Features

### User Profile Page

**Location**: `/profile`

All authenticated users can:

- View and update their profile information
- Change their name, email, and profile image
- View their current role (USER or ADMIN)
- Manage Two-Factor Authentication settings

### Admin User Management

**Access**: Admin users only (visible on Profile page)

Administrators can:

- View all registered users
- Promote users to ADMIN role
- Demote ADMIN users to USER role (except themselves)
- Delete user accounts (except their own)
- Reset user TOTP for account recovery
- See user join dates and basic information

## Navigation

### Sidebar User Icon

- **Previous**: Clicking the user icon/avatar in the sidebar navigated to `/settings`
- **Now**: Clicking the user icon/avatar navigates to `/profile`

### Menu Structure

The application has two separate pages:

- **Profile** (`/profile`): User profile and account management
- **Settings** (`/settings`): Application settings and preferences

## Components

### Profile Form

**File**: `/app/(app)/profile/_components/profile-form.tsx`

Features:

- Profile image preview with avatar fallback
- Name field (required, max 100 characters)
- Email field (validated, checked for uniqueness)
- Read-only role display with badge
- Real-time validation
- Optimistic UI updates with session refresh

### User Management

**File**: `/app/(app)/profile/_components/user-management.tsx`

Features:

- Sortable user table
- User avatars with fallbacks
- Role badges (Admin/User)
- 2FA status indicators
- Join date display (relative time)
- Action dropdown menu per user:
  - Toggle admin role
  - Reset 2FA
  - Delete user
- Confirmation dialog for destructive actions
- Real-time updates with TanStack Query

## Server Actions

### Profile Actions

**File**: `/app/actions/profile-actions.ts`

#### `updateProfile(data)`

Updates the current user's profile information.

**Parameters**:

```typescript
{
  name: string;
  email: string;
  image?: string | null;
}
```

**Returns**: Updated user profile data

**Validations**:

- Name: Required, 1-100 characters
- Email: Valid email format, unique across users
- Image: Valid URL (optional)

#### `getAllUsers()`

Retrieves all users (Admin only).

**Returns**: Array of users with:

- id, name, email, role
- totpEnabled status
- createdAt timestamp
- profile image

#### `updateUserRole(userId, role)`

Updates a user's role (Admin only).

**Parameters**:

- `userId`: User ID to update
- `role`: "USER" or "ADMIN"

**Validations**:

- Prevents self-demotion
- Admin-only access

#### `deleteUser(userId)`

Deletes a user account (Admin only).

**Parameters**:

- `userId`: User ID to delete

**Validations**:

- Prevents self-deletion
- Admin-only access
- Cascades to related data via Prisma

## Security

### Authorization

- Profile updates: Own profile only
- User management: Admin role required
- Role changes: Admin only, cannot change own role
- User deletion: Admin only, cannot delete self
- TOTP reset: Admin only, no verification required

### Data Validation

- All inputs validated with Zod schemas
- Email uniqueness checked before update
- Server-side validation on all actions

### Session Management

- Profile updates trigger session refresh
- Changes reflected immediately in UI
- Session data kept in sync with database

## UI/UX Features

### Profile Form

- Live avatar preview
- Inline validation errors
- Loading states during submission
- Success/error toast notifications
- Cancel button returns to previous page

### User Management Table

- Responsive table layout
- Avatar with name display
- Role badges with icons
- 2FA status badges
- Relative timestamps ("2 days ago")
- Dropdown actions menu
- Confirmation dialogs for destructive actions

---

## Related Files

### Authentication

- `/lib/auth/index.ts` - NextAuth configuration
- `/lib/auth/actions.ts` - Auth server actions
- `/lib/auth/totp.ts` - TOTP utilities
- `/lib/db/index.ts` - Prisma client
- `/prisma/schema.prisma` - Database schema

### Components

- `/app/(auth)/sign-in/page.tsx` - Sign-in page
- `/app/(auth)/sign-up/page.tsx` - Sign-up page
- `/app/(app)/profile/page.tsx` - Profile page
- `/app/(app)/settings/page.tsx` - Settings page
- `/components/ui/*` - Shadcn UI components

### Actions

- `/app/actions/totp-actions.ts` - TOTP server actions
- `/app/actions/profile-actions.ts` - Profile server actions
- `/app/actions/app-settings.ts` - App settings actions

### Validation

- `/lib/validations/user.ts` - User validation schemas

---

## Environment Variables Required

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Database
DATABASE_URL=mongodb://...

# Admin Configuration
ADMIN_EMAILS=admin@example.com,manager@company.com

# TOTP Configuration
TOTP_ENCRYPTION_KEY=<base64-encoded-32-byte-key>

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Email (for magic links)
SMTP_FROM=noreply@yourdomain.com
RESEND_API_KEY=your-resend-api-key
```

---

## Future Enhancements

### Authentication

- Email verification for new signups
- Password strength indicator
- Enhanced password validation rules
- Additional OAuth providers (GitHub, Facebook, Twitter)
- Terms of service and privacy policy checkboxes
- reCAPTCHA v3 integration

### TOTP

- WebAuthn/FIDO2 support
- SMS backup codes
- TOTP session trust (remember device)
- Recovery email for TOTP reset
- Audit logging for TOTP operations

### Profile

- Password change functionality
- Email verification for email changes
- User activity logs
- Profile picture upload (vs URL input)
- User status (active/inactive)

### Admin

- Bulk user operations
- User search and filtering
- Export user list
- Enhanced audit logging
- Admin activity dashboard

---

## Support & Documentation

For issues or questions:

1. Check this documentation
2. Review error messages and logs
3. Contact system administrator
4. File issue in project repository

**Documentation Version**: 1.0
**Last Updated**: November 7, 2025
