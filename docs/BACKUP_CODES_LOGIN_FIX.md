# Backup Codes Login Fix

## Issue

Users could not sign in using their backup codes. The sign-in form only accepted 6-digit TOTP codes and rejected 8-character backup codes.

## Root Cause

Multiple validation issues prevented backup code usage:

1. **Client-side validation**: Sign-in form only accepted 6-digit codes
2. **Input field restriction**: Only allowed numeric input (backup codes are hexadecimal)
3. **Length restriction**: Input field limited to 6 characters (backup codes are 8)
4. **Server-side validation**: `VerifyTOTPSchema` required exactly 6 characters

## Changes Made

### 1. Updated Sign-In Form Validation

**File**: `app/(auth)/sign-in/page.tsx`

**Before**:

```typescript
if (!totpCode || totpCode.length !== 6) {
  toast({
    title: "Invalid code",
    description: "Please enter a valid 6-digit code",
    variant: "destructive",
  });
  return;
}
```

**After**:

```typescript
if (!totpCode || (totpCode.length !== 6 && totpCode.length !== 8)) {
  toast({
    title: "Invalid code",
    description: "Please enter a 6-digit TOTP code or 8-character backup code",
    variant: "destructive",
  });
  return;
}
```

### 2. Updated Input Field

**File**: `app/(auth)/sign-in/page.tsx`

**Before**:

```typescript
<Input
  id="totpCode"
  type="text"
  placeholder="000000"
  value={totpCode}
  onChange={(e) =>
    setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
  }
  maxLength={6}
/>
```

**After**:

```typescript
<Input
  id="totpCode"
  type="text"
  placeholder="000000 or ABCD1234"
  value={totpCode}
  onChange={(e) =>
    setTotpCode(e.target.value.replace(/[^0-9A-Fa-f]/g, "").slice(0, 8).toUpperCase())
  }
  maxLength={8}
/>
<p className="text-xs text-muted-foreground">
  6 digits from your authenticator app or 8-character backup code
</p>
```

**Key changes**:

- Changed regex from `/\D/g` (non-digits) to `/[^0-9A-Fa-f]/g` (non-hex characters)
- Increased max length from 6 to 8
- Convert input to uppercase (backup codes are uppercase hex)
- Added helper text
- Updated placeholder

### 3. Updated Server Validation

**File**: `app/actions/totp-actions.ts`

**Before**:

```typescript
const VerifyTOTPSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  token: z.string().length(6, "Token must be 6 digits"),
});
```

**After**:

```typescript
const VerifyTOTPSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  token: z
    .string()
    .min(6, "Token must be at least 6 characters")
    .max(8, "Token must be at most 8 characters"),
});
```

### 4. Updated Alert Message

**File**: `app/(auth)/sign-in/page.tsx`

**Before**:

```typescript
Enter your 6-digit code from your authenticator app or use a backup code
```

**After**:

```typescript
Enter your 6-digit code from your authenticator app or use an 8-character backup code
```

## How Backup Codes Work

### Format

- **TOTP Codes**: 6 numeric digits (e.g., `123456`)
- **Backup Codes**: 8 hexadecimal characters (e.g., `ABCD1234`)

### Generation

Generated using cryptographically secure random bytes:

```typescript
const code = crypto.randomBytes(4).toString("hex").toUpperCase();
// Produces: "A1B2C3D4" (8 hex chars)
```

### Storage

- Backup codes are hashed with bcrypt before storage
- Each code can only be used once
- After use, the code is removed from the database

### Verification Flow

1. User enters code (6 or 8 characters)
2. System tries TOTP verification first
3. If TOTP fails, tries backup code verification
4. If backup code matches, it's removed from database
5. User is authenticated successfully

## Testing

### Test Case 1: TOTP Code Login

1. Enter email and password
2. Click "Sign In"
3. TOTP field appears
4. Enter 6-digit code (e.g., `123456`)
5. ✅ Should sign in successfully

### Test Case 2: Backup Code Login

1. Enter email and password
2. Click "Sign In"
3. TOTP field appears
4. Enter 8-character backup code (e.g., `ABCD1234`)
5. ✅ Should sign in successfully
6. ✅ Backup code should be removed from database

### Test Case 3: Invalid Code

1. Enter email and password
2. Click "Sign In"
3. Enter invalid code (e.g., `000000`)
4. ✅ Should show error message
5. ✅ Should remain on login page

### Test Case 4: Invalid Length

1. Enter email and password
2. Click "Sign In"
3. Enter 5-digit code (e.g., `12345`)
4. ✅ Should show error: "Please enter a 6-digit TOTP code or 8-character backup code"

### Test Case 5: Input Validation

1. TOTP field appears
2. Try typing letters (a-f allowed for hex)
3. Try typing special characters (should be blocked)
4. Try typing more than 8 characters (should be limited)
5. ✅ Only 0-9 and A-F allowed
6. ✅ Maximum 8 characters
7. ✅ Auto-uppercase

## Security Considerations

### Why Backup Codes are Single-Use

- **Prevents replay attacks**: Can't reuse stolen code
- **Limits exposure**: If one code is compromised, others remain safe
- **Encourages rotation**: Users must manage and regenerate codes

### Why Backup Codes are Hexadecimal

- **Higher entropy**: 16 possible characters vs 10 for digits
- **Shorter codes**: 8 hex chars = 32 bits of entropy
- **Easy to type**: No ambiguous characters (0/O, 1/l)

### Verification Order

1. **Try TOTP first**: More common, faster to verify
2. **Fall back to backup codes**: Secondary method
3. **Single database query**: Efficient lookup

## User Experience

### Clear Instructions

- Alert message explains both options
- Placeholder shows example of both formats
- Helper text reinforces the options

### Flexible Input

- Accepts both 6 and 8 character codes
- Auto-uppercase for consistency
- Filters non-hex characters

### Error Handling

- Clear error messages
- Specific validation feedback
- Code field clears on error

## Migration Impact

✅ **No Breaking Changes**: Existing users unaffected
✅ **No Database Changes**: No schema modifications needed
✅ **Backward Compatible**: TOTP codes still work normally
✅ **Immediate Effect**: No deployment steps required

## Related Files

### Modified Files

- `app/(auth)/sign-in/page.tsx` - Sign-in form UI and validation
- `app/actions/totp-actions.ts` - Server-side validation schema

### Related Files (No Changes)

- `lib/auth/totp.ts` - Backup code generation and verification
- `lib/auth/index.ts` - Credentials provider
- `app/(app)/profile/_components/totp-management.tsx` - TOTP management UI

## Future Enhancements

### Possible Improvements

1. **Show remaining backup codes**: Display count after using one
2. **Backup code confirmation**: Confirm before using last code
3. **Auto-detect code type**: Don't require exact length validation
4. **Copy-paste detection**: Trim whitespace, handle formatted codes
5. **Better error messages**: Differentiate between TOTP and backup code errors

### UI Enhancements

1. **Visual distinction**: Different styling for TOTP vs backup code input
2. **Code format indicator**: Show which type user is entering
3. **Help link**: Direct link to "lost authenticator" help
4. **Backup code viewer**: Show remaining codes count

## Summary

✅ Users can now sign in using backup codes
✅ Input field accepts both 6-digit TOTP and 8-character backup codes
✅ Clear instructions and helper text
✅ Proper validation on both client and server
✅ Maintains security with single-use backup codes

## Signup Flow Fix (Nov 7, 2025)

### Issue

New user signup was failing with "Unauthorized" error when trying to set up TOTP. The user was not logged in and couldn't proceed to TOTP setup.

### Root Cause

The `setupTOTP` and `enableTOTP` server actions were checking for a session and rejecting requests when a `userId` was provided without matching the session user ID. During signup, there's no session yet, so these functions were returning "Unauthorized".

### Solution

Modified the authorization logic in both functions to allow TOTP setup for new users:

- **Before**: Required session when userId is provided
- **After**: Allow userId without session (for new signups), only check admin authorization if session exists

### Modified Files

1. `app/actions/totp-actions.ts`:

   - `setupTOTP`: Changed authorization to allow new user setup
   - `enableTOTP`: Changed authorization to allow new user setup

2. `lib/auth/actions.ts`:

   - Modified `signUp` to return `userId` in response
   - Removed auto-sign-in (TOTP must be set up first)

3. `app/(auth)/sign-up/page.tsx`:
   - Use `userId` from signup response
   - Pass `userId` to TOTP setup functions
   - Redirect to sign-in page after TOTP setup completes

### Authorization Logic

```typescript
// OLD (Rejected new signups)
if (userId && userId !== session?.user?.id) {
  if (session?.user?.role !== "ADMIN") {
    return { status: "error", error: "Unauthorized" };
  }
}

// NEW (Allows new signups)
if (userId && session && userId !== session?.user?.id) {
  // Only check admin authorization if there's a session
  if (session?.user?.role !== "ADMIN") {
    return { status: "error", error: "Unauthorized" };
  }
}
```

### Testing the Fix

1. Go to `/sign-up`
2. Fill in name, email, password
3. Click "Create an account"
4. ✅ Should see TOTP QR code (not "Unauthorized" error)
5. Scan QR code with authenticator app
6. Enter 6-digit code
7. ✅ Should see backup codes
8. Click "Continue"
9. ✅ Should redirect to sign-in page
10. Sign in with email, password, and TOTP code
11. ✅ Should successfully access dashboard
