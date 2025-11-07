# Admin and Signup Restriction Features

This document explains the admin user management and signup restriction features implemented in the application.

## Overview

The application now supports:

1. **Admin Users**: Designated users with administrative privileges
2. **Signup Restrictions**: Ability to restrict who can sign up based on email addresses or domains

## Admin Users

### Setting Admin Emails

Admin users are defined via the `ADMIN_EMAILS` environment variable in your `.env` or `.env.local` file:

```bash
ADMIN_EMAILS="admin@example.com,manager@company.com,owner@domain.com"
```

- Multiple emails should be comma-separated
- Emails are case-insensitive
- Users with these emails will automatically be assigned the ADMIN role

### Automatic Admin Role Assignment

When users sign in:

- The system checks if their email is in the `ADMIN_EMAILS` list
- If matched, their role is automatically updated to ADMIN
- This happens on every sign-in, so you can add/remove admins by updating the environment variable

### Manual Admin Seeding

To update existing users to admin role, run:

```bash
pnpm tsx scripts/seed-admins.ts
```

This script:

- Reads the `ADMIN_EMAILS` environment variable
- Updates all matching users to ADMIN role
- Displays a list of all current admin users

## Signup Restrictions

### Accessing Admin Settings

1. Sign in as an admin user
2. Navigate to **Settings** page
3. You'll see an **Admin Settings** section (only visible to admins)

### Configuring Signup Restrictions

Admin users can configure signup restrictions through the Settings page:

#### Enable/Disable Restrictions

- Toggle **Restrict Signups** to enable or disable the feature
- When disabled, anyone can sign up
- When enabled, only allowed emails/domains can sign up

#### Allowed Email Addresses

Add specific email addresses that are allowed to sign up:

- Enter emails one per line or comma-separated
- Example:
  ```
  user1@example.com
  user2@company.com
  approved@domain.org
  ```

#### Allowed Email Domains

Add domains that are allowed to sign up:

- Enter domains one per line or comma-separated
- Do not include the @ symbol
- Example:
  ```
  company.com
  organization.org
  trusted-domain.net
  ```

### How Signup Validation Works

When signup restrictions are enabled:

1. **For Credentials Signup** (email/password):

   - Email is validated before account creation
   - User receives an error message if not authorized

2. **For OAuth Signups** (Google, GitHub, etc.):

   - Email is validated during the sign-in callback
   - User is redirected to sign-in page with an error message if not authorized

3. **Validation Logic**:
   - If email exactly matches an allowed email → ✅ Allowed
   - If email domain matches an allowed domain → ✅ Allowed
   - Otherwise → ❌ Blocked

### Example Configuration

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

### AppSettings Model

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

## Troubleshooting

### User not getting admin role

- Verify email is correctly listed in `ADMIN_EMAILS` environment variable
- Check for typos or extra spaces
- Run the seed-admins script: `pnpm tsx scripts/seed-admins.ts`
- User must sign in again after being added to admin list

### Signup restrictions not working

- Ensure an admin has enabled "Restrict Signups" in Settings
- Verify email/domain lists are properly formatted
- Check browser console and server logs for validation errors
- Settings are stored in database, so changes persist across restarts

### Admin settings not visible

- Ensure user is signed in with an admin account
- Check `session.user.role === 'ADMIN'` in browser console
- Verify ADMIN_EMAILS environment variable is set correctly
