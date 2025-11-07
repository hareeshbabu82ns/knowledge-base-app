# User Signup Feature Documentation

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
   - Auto-signs in users after successful registration
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

#### OAuth Account Merging

- **Password Addition for OAuth Users**: Users who signed up with Google/GitHub can add a password
- Enables multiple login methods for the same account
- Preserves existing user data (name, email verification, role)
- Seamless integration without creating duplicate accounts
- Clear messaging to users about account updates

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
   - Auto-signs in the user
   - Redirects to dashboard
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
   - Auto-signs in the user with credentials
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
  | { status: "success"; message: string }
  | { status: "error"; error: string };
```

## Usage Example

### Server Action - New User

```typescript
import { signUp } from "@/lib/auth/actions";

const result = await signUp({
  name: "John Doe",
  email: "john@example.com",
  password: "securepassword123",
});

if (result.status === "success") {
  // Handle success - new account created
  // Message: "Account created and signed in successfully!"
  router.push("/dashboard");
} else {
  // Handle error
  setError(result.error);
}
```

### Server Action - OAuth User Adding Password

```typescript
import { signUp } from "@/lib/auth/actions";

// User previously signed up with Google (user@gmail.com)
const result = await signUp({
  name: "Jane Smith", // Optional - can update name
  email: "user@gmail.com", // Same email as OAuth account
  password: "newpassword123",
});

if (result.status === "success") {
  // Handle success - password added to OAuth account
  // Message: "Password added to your account! You can now sign in with email and password."
  router.push("/dashboard");
} else {
  // Handle error - user already has a password set
  // Error: "An account with this email already exists. Please sign in instead."
  setError(result.error);
}
```

### Component Usage

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserSignupSchema } from "@/lib/validations/user";
import { signUp } from "@/lib/auth/actions";

const form = useForm({
  resolver: zodResolver(UserSignupSchema),
  defaultValues: {
    name: "",
    email: "",
    password: "",
  },
});

const handleSignup = async (values) => {
  const result = await signUp(values);
  // Handle result
};
```

## Integration with Sign-In

- Sign-in page includes link to signup: "Don't have an account? Sign up"
- Signup page includes link to sign-in: "Already have an account? Sign in"
- Seamless navigation between authentication flows

## Future Enhancements

1. **Email Verification**

   - Send verification email after signup
   - Require email verification before full access

2. **Password Strength Indicator**

   - Visual feedback on password strength
   - Requirements checklist

3. **Enhanced Password Validation**

   - Uncomment complex password rules in schema
   - Require uppercase, lowercase, numbers, special characters

4. **Social OAuth Providers**

   - Add GitHub OAuth integration
   - Support additional providers (Facebook, Twitter, etc.)

5. **Terms and Privacy**

   - Add terms of service checkbox
   - Privacy policy agreement

6. **Captcha Integration**
   - Prevent bot signups
   - reCAPTCHA v3 integration

## Testing

To test the signup feature:

### New User Signup

1. Navigate to `http://localhost:3000/sign-up`
2. Fill in the form with valid data (name, email, password)
3. Verify validation errors for invalid input
4. Verify successful signup redirects to dashboard
5. Check that user can sign in with credentials

### OAuth User Adding Password

1. Sign up with Google OAuth first:
   - Navigate to `http://localhost:3000/sign-up`
   - Click "Sign up with Google"
   - Complete OAuth flow
2. Sign out from the dashboard
3. Navigate to `http://localhost:3000/sign-up` again
4. Enter the same email used for Google signup
5. Enter name and password
6. Submit the form
7. Verify success message: "Password added to your account!"
8. Sign out
9. Test signing in with both methods:
   - Sign in with Google (should work)
   - Sign in with email/password (should work)

### Duplicate Account Testing

1. Create account with email/password
2. Sign out
3. Try to sign up again with same email and different password
4. Verify error: "An account with this email already exists. Please sign in instead."

### OAuth Signup Flow

1. Navigate to `http://localhost:3000/sign-up`
2. Click "Sign up with Google"
3. Complete OAuth flow
4. Verify redirect to dashboard

## Troubleshooting

**Issue**: "An account with this email already exists"

- **Solution**: This appears when a user already has a password set. Sign in with existing credentials instead.

**Issue**: OAuth user can't add password

- **Solution**: Ensure the email matches exactly with the OAuth account email. Check database to verify user has no password set.

**Issue**: Password added but can't sign in with credentials

- **Solution**: Verify the credentials provider is properly configured in NextAuth. Check that password was hashed correctly.

**Issue**: Validation errors not showing

- **Solution**: Check form registration and error state binding

**Issue**: OAuth signup fails

- **Solution**: Verify OAuth provider credentials in environment variables

**Issue**: User not auto-signed in after signup

- **Solution**: Check credentials provider configuration in NextAuth

## Environment Variables Required

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Database
DATABASE_URL=mongodb://...

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Email (for magic links)
SMTP_FROM=noreply@yourdomain.com
RESEND_API_KEY=your-resend-api-key
```

## Related Files

- `/lib/auth/index.ts` - NextAuth configuration
- `/lib/db/index.ts` - Prisma client
- `/prisma/schema.prisma` - User model schema
- `/components/ui/*` - Shadcn UI components
- `/app/(auth)/layout.tsx` - Auth layout wrapper
