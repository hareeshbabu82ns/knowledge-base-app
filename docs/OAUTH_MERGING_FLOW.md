# OAuth Account Merging Flow

## Overview

This document explains how the signup process handles merging OAuth accounts with credential-based authentication.

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
  - Verify email      - Hash password
        |                    |
        |                    |
        v                    v
   Auto Sign-In User    Auto Sign-In User
   with credentials     with credentials
        |                    |
        v                    v
  "Account created!"   "Password added!"
        |                    |
        +--------------------+
                 |
                 v
        Redirect to Dashboard
```

## Scenarios

### Scenario 1: New User Registration

**User Action**: Signs up with email `john@example.com` and password

**System Behavior**:

1. Validates input
2. Checks database - no user found
3. Creates new user with hashed password
4. Auto-signs in user
5. Shows: "Account created and signed in successfully!"

**Result**: User can sign in with email/password

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
4. Auto-signs in user
5. Shows: "Password added to your account! You can now sign in with email and password."

**Result**: User can now sign in with BOTH:

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

## Database State Changes

### Before OAuth Merging

```javascript
// OAuth User (Google)
{
  id: "123",
  email: "user@gmail.com",
  name: "John Doe",
  password: null,  // No password set
  emailVerified: "2025-01-01T00:00:00Z",
  accounts: [
    {
      provider: "google",
      providerAccountId: "google-123"
    }
  ]
}
```

### After Adding Password via Signup

```javascript
// OAuth User with Credentials
{
  id: "123",  // Same ID
  email: "user@gmail.com",
  name: "John Doe",  // Preserved or updated
  password: "$2a$10$hashedpassword...",  // Now has password
  emailVerified: "2025-01-01T00:00:00Z",  // Preserved
  accounts: [
    {
      provider: "google",  // OAuth account still exists
      providerAccountId: "google-123"
    }
  ]
}
```

## Benefits

1. **Single Account**: Users maintain one account regardless of sign-in method
2. **Flexibility**: Users can choose their preferred sign-in method
3. **No Data Loss**: All user data and relationships are preserved
4. **Better UX**: No confusing "account already exists" errors for OAuth users
5. **Security**: Each method maintains its own security (OAuth tokens vs hashed passwords)

## Implementation Details

### Key Code Logic

```typescript
// Check if user exists
const existingUser = await db.user.findUnique({
  where: { email },
});

if (existingUser) {
  if (existingUser.password) {
    // Scenario 3: User already has credentials
    return { status: "error", error: "Account exists" };
  }

  // Scenario 2: OAuth user - add password
  user = await db.user.update({
    where: { email },
    data: {
      password: hashedPassword,
      name: name || existingUser.name,
      emailVerified: existingUser.emailVerified || new Date(),
    },
  });
} else {
  // Scenario 1: New user
  user = await db.user.create({
    data: { name, email, password: hashedPassword, role: "USER" },
  });
}
```

### Security Considerations

1. **Password Hashing**: All passwords use bcrypt with 10 rounds
2. **Email Verification**: Preserved from OAuth or set for new accounts
3. **Account Linking**: Done via email (unique constraint)
4. **No Password Overwrite**: Existing passwords cannot be changed via signup
5. **Validation**: All inputs validated with zod schema

## User Experience

### UI Message Differences

| Scenario                 | Success Message                                                                | Action                      |
| ------------------------ | ------------------------------------------------------------------------------ | --------------------------- |
| New user signup          | "Account created and signed in successfully!"                                  | Creates account + sign in   |
| OAuth user adds password | "Password added to your account! You can now sign in with email and password." | Updates account + sign in   |
| Duplicate credentials    | "An account with this email already exists. Please sign in instead."           | Error - redirect to sign in |

### Page Description

The signup page description now reads:

> "Enter your information to create an account. If you previously signed up with Google, you can add a password here."

This helps users understand they can merge their accounts.

## Related Files

- `/lib/auth/actions.ts` - Server action implementation
- `/app/(auth)/sign-up/page.tsx` - Signup page UI
- `/prisma/schema.prisma` - User model with optional password field
- `/lib/validations/user.ts` - Validation schemas
