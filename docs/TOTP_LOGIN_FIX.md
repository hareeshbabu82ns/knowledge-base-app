# TOTP Login Fix

## Issue

Users with TOTP enabled could not sign in successfully. The sign-in flow was attempting to authenticate without TOTP first, which would fail with a "TOTP verification required" error, but the error handling wasn't working correctly.

## Root Cause

The original implementation tried to sign in without TOTP first and then checked if the error message contained "TOTP" or "2FA". However, NextAuth's error handling doesn't always pass through the exact error message text, making this approach unreliable.

## Solution

Changed the sign-in flow to:

1. **Check TOTP status BEFORE attempting sign-in**
2. Use a new server action `checkTOTPByEmail()` to determine if the user has TOTP enabled
3. If TOTP is enabled, show the TOTP input field immediately
4. Only then attempt sign-in with the TOTP code

## Changes Made

### 1. New Server Action

**File**: `app/actions/totp-actions.ts`

Added a new public function that checks if a user has TOTP enabled:

```typescript
export async function checkTOTPByEmail(
  email: string,
): Promise<TotpActionResponse<{ totpEnabled: boolean }>>;
```

This function:

- Takes an email address
- Returns `{ totpEnabled: true/false }`
- Does not require authentication (public endpoint)
- Does not reveal if user exists (returns false if user not found)

### 2. Updated Sign-In Flow

**File**: `app/(auth)/sign-in/page.tsx`

Changed the `handleCredentialsSignIn` function to:

**Before**:

1. Try to sign in with email/password
2. If error contains "TOTP", show TOTP input
3. Try again with TOTP code

**After**:

1. Check if email has TOTP enabled using `checkTOTPByEmail()`
2. If TOTP enabled → show TOTP input field
3. If TOTP not enabled → proceed with normal sign-in
4. When TOTP input is shown → sign in with email/password/totpCode

## Benefits of New Approach

✅ **More Reliable**: Doesn't depend on error message parsing
✅ **Better UX**: Shows TOTP input immediately if needed
✅ **No Failed Attempts**: Doesn't try to authenticate without TOTP
✅ **Clearer Flow**: Explicit TOTP check before sign-in
✅ **Privacy**: Doesn't reveal if email exists in system

## Testing

### Test Case 1: User WITHOUT TOTP

1. Enter email and password
2. Click "Sign In"
3. ✅ Should sign in successfully

### Test Case 2: User WITH TOTP

1. Enter email and password
2. Click "Sign In"
3. ✅ Should show TOTP input field
4. Enter 6-digit code
5. Click "Verify & Sign In"
6. ✅ Should sign in successfully

### Test Case 3: User WITH TOTP (Invalid Code)

1. Enter email and password
2. Click "Sign In"
3. ✅ Should show TOTP input field
4. Enter invalid code
5. Click "Verify & Sign In"
6. ✅ Should show error "Invalid verification code"
7. ✅ Code field should clear
8. ✅ Should remain on TOTP input screen

### Test Case 4: User WITH TOTP (Backup Code)

1. Enter email and password
2. Click "Sign In"
3. ✅ Should show TOTP input field
4. Enter 8-character backup code
5. Click "Verify & Sign In"
6. ✅ Should sign in successfully
7. ✅ Backup code should be removed from database

## Security Considerations

### Email Enumeration Protection

The `checkTOTPByEmail()` function returns `false` if user doesn't exist, rather than an error. This prevents attackers from discovering which emails are registered in the system.

### No Password Validation Yet

The flow checks TOTP status before validating the password. This is intentional:

- Faster UX (don't wait for bcrypt comparison)
- Still secure (password validated in credentials provider)
- Only reveals if user HAS 2FA, not if password is correct

### Rate Limiting Recommendation

Consider adding rate limiting to `checkTOTPByEmail()` to prevent:

- Email enumeration through timing attacks
- Brute force attempts

Example:

```typescript
// Limit to 10 checks per IP per minute
const ipRateLimit = new Map<string, number>();
```

## Migration Impact

✅ **No Breaking Changes**: Existing users can still sign in
✅ **No Database Changes**: No schema modifications needed  
✅ **Backward Compatible**: Works with and without TOTP
✅ **No Session Impact**: Doesn't affect existing sessions

## Rollback Plan

If issues occur, revert these files:

1. `app/actions/totp-actions.ts` - Remove `checkTOTPByEmail` function
2. `app/(auth)/sign-in/page.tsx` - Revert to previous handleCredentialsSignIn

No database rollback needed.

## Future Enhancements

### Possible Improvements

1. **Rate Limiting**: Add IP-based rate limiting to TOTP check
2. **Remember Device**: Option to skip TOTP for trusted devices
3. **Progressive Disclosure**: Only show TOTP field after password validation
4. **Better Error Messages**: More specific error feedback
5. **Audit Logging**: Log TOTP check and verification attempts

### Alternative Approaches Considered

**Approach 1: Error Message Parsing** (Original)

- ❌ Unreliable - depends on NextAuth error handling
- ❌ Can break with library updates

**Approach 2: Database Query in Client** (Rejected)

- ❌ Security risk - exposes database queries
- ❌ Requires authentication

**Approach 3: Session-Based Check** (Rejected)

- ❌ Requires failed sign-in first
- ❌ Bad UX - extra failed attempt

**Approach 4: Server Action Check** (Implemented)

- ✅ Reliable - direct database query
- ✅ Secure - server-side only
- ✅ Fast - no password hash needed
- ✅ Clean - no failed attempts

## Code Reference

### Key Files

- `app/actions/totp-actions.ts` - TOTP server actions
- `app/(auth)/sign-in/page.tsx` - Sign-in page
- `lib/auth/index.ts` - Credentials provider (unchanged)

### Related Documentation

- `docs/TOTP_IMPLEMENTATION.md` - Full TOTP documentation
- `docs/TOTP_SUMMARY.md` - Quick reference guide
