# Testing OAuth Account Merging

## Test Scenarios Checklist

Use this checklist to verify the OAuth account merging functionality works correctly.

---

## ✅ Test Case 1: New User Signup

**Objective**: Verify new users can create accounts with email/password

### Steps

1. [ ] Navigate to `http://localhost:3000/sign-up`
2. [ ] Enter unique email (e.g., `newuser@example.com`)
3. [ ] Enter name (e.g., `New User`)
4. [ ] Enter password (min 4 characters)
5. [ ] Click "Create an account"

### Expected Results

- [ ] No validation errors appear
- [ ] Success toast: "Account created and signed in successfully!"
- [ ] User is redirected to `/dashboard`
- [ ] User is signed in (check user avatar/menu)

### Cleanup

- [ ] Sign out
- [ ] Verify user can sign in with created credentials

---

## ✅ Test Case 2: OAuth User Adds Password (Happy Path)

**Objective**: Verify OAuth users can add password to enable credentials login

### Setup

1. [ ] Navigate to `http://localhost:3000/sign-up`
2. [ ] Click "Sign up with Google"
3. [ ] Complete Google OAuth flow
4. [ ] Verify redirect to dashboard
5. [ ] Note the email used (e.g., `oauth@gmail.com`)
6. [ ] Sign out

### Steps

1. [ ] Navigate to `http://localhost:3000/sign-up`
2. [ ] Enter the same email as OAuth account
3. [ ] Enter name (can be same or different)
4. [ ] Enter password (min 4 characters)
5. [ ] Click "Create an account"

### Expected Results

- [ ] No validation errors
- [ ] Success toast: "Password added to your account! You can now sign in with email and password."
- [ ] User is redirected to `/dashboard`
- [ ] User is signed in

### Verification

- [ ] Sign out
- [ ] Sign in with Google OAuth - should work
- [ ] Sign out
- [ ] Sign in with email/password - should work
- [ ] Both methods access the same account (same user data)

---

## ✅ Test Case 3: Duplicate Credentials Account

**Objective**: Verify users with existing passwords cannot create duplicate accounts

### Setup

1. [ ] Create account with email `duplicate@example.com` and password
2. [ ] Sign out

### Steps

1. [ ] Navigate to `http://localhost:3000/sign-up`
2. [ ] Enter same email `duplicate@example.com`
3. [ ] Enter any name and password
4. [ ] Click "Create an account"

### Expected Results

- [ ] Error toast appears
- [ ] Error message: "An account with this email already exists. Please sign in instead."
- [ ] User is NOT signed in
- [ ] User remains on signup page

---

## ✅ Test Case 4: Form Validation

**Objective**: Verify all form validations work correctly

### Steps

1. [ ] Navigate to `http://localhost:3000/sign-up`

#### Name Validation

2. [ ] Leave name empty, submit
   - [ ] Error: Name is required
3. [ ] Enter 3 characters, submit
   - [ ] Error: Name must be at least 5 characters
4. [ ] Enter 101+ characters
   - [ ] Error: Name must be max 100 characters

#### Email Validation

5. [ ] Enter invalid email (e.g., `notanemail`)
   - [ ] Error: Invalid email format
6. [ ] Leave email empty
   - [ ] Error: Email is required

#### Password Validation

7. [ ] Enter password with 3 characters
   - [ ] Error: Password must be at least 4 characters
8. [ ] Leave password empty
   - [ ] Error: Password is required

---

## ✅ Test Case 5: OAuth Signup Flow

**Objective**: Verify Google OAuth signup works correctly

### Steps

1. [ ] Navigate to `http://localhost:3000/sign-up`
2. [ ] Click "Sign up with Google"
3. [ ] Complete Google OAuth flow
4. [ ] Grant permissions if requested

### Expected Results

- [ ] User is redirected to `/dashboard`
- [ ] User is signed in
- [ ] User profile shows Google account info
- [ ] Account has NO password set in database

---

## ✅ Test Case 6: Loading States

**Objective**: Verify UI shows proper loading states

### Steps

1. [ ] Navigate to `http://localhost:3000/sign-up`
2. [ ] Fill form with valid data
3. [ ] Click "Create an account"
4. [ ] Observe button state

### Expected Results

- [ ] Button shows spinner icon
- [ ] Button text changes to "Creating account..."
- [ ] Button is disabled during submission
- [ ] Form inputs are disabled during submission

### OAuth Loading

5. [ ] Click "Sign up with Google"
6. [ ] Observe button state

### Expected Results

- [ ] Button shows spinner icon
- [ ] Button text changes to "Connecting..."
- [ ] Button is disabled

---

## ✅ Test Case 7: Navigation Links

**Objective**: Verify navigation between auth pages works

### Steps

1. [ ] Navigate to `http://localhost:3000/sign-up`
2. [ ] Click "Sign in" link at bottom
3. [ ] Verify redirect to `/sign-in`
4. [ ] Click "Sign up" link at bottom
5. [ ] Verify redirect to `/sign-up`

### Expected Results

- [ ] Links are visible and properly styled
- [ ] Navigation works without errors
- [ ] URL changes correctly

---

## ✅ Test Case 8: Middleware Protection

**Objective**: Verify authenticated users are redirected from signup

### Steps

1. [ ] Sign in to the application
2. [ ] Manually navigate to `http://localhost:3000/sign-up`

### Expected Results

- [ ] User is automatically redirected to `/dashboard`
- [ ] Signup page is not accessible when authenticated

---

## Database Verification Queries

Use these Prisma Studio queries or MongoDB queries to verify data:

### Check User After OAuth Signup

```javascript
// Expected: password should be null
{
  email: "oauth@gmail.com",
  password: null,
  accounts: [{ provider: "google" }]
}
```

### Check User After Adding Password

```javascript
// Expected: password should be hashed string
{
  email: "oauth@gmail.com",
  password: "$2a$10$...",  // bcrypt hash
  accounts: [{ provider: "google" }]  // OAuth still linked
}
```

### Check Credentials User

```javascript
// Expected: password set, no OAuth accounts
{
  email: "user@example.com",
  password: "$2a$10$...",
  accounts: []  // No OAuth accounts
}
```

---

## Performance Testing

### Load Test Signup

- [ ] Submit signup form 10 times with different emails
- [ ] Verify all submissions succeed
- [ ] Check database for 10 new users
- [ ] Verify no duplicate users

### Concurrent OAuth Merging

- [ ] Create OAuth account
- [ ] Try to add password from 2 different sessions simultaneously
- [ ] Verify only one succeeds or both succeed with same result
- [ ] Check database has only one password hash

---

## Error Scenarios

### Network Errors

- [ ] Disable network during signup submission
- [ ] Verify error toast appears
- [ ] Verify user can retry after network restored

### Database Errors

- [ ] Stop database during signup
- [ ] Verify graceful error handling
- [ ] Check error message is user-friendly

---

## Browser Compatibility

Test signup on:

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

---

## Accessibility Testing

- [ ] Tab through form - proper focus order
- [ ] Submit with Enter key - works correctly
- [ ] Screen reader announces errors properly
- [ ] Error messages have proper ARIA labels
- [ ] Loading states announced to screen readers

---

## Notes

- Use different email addresses for each test
- Clear browser cache between major test runs
- Check browser console for any errors
- Monitor network tab for API calls
- Use Prisma Studio to verify database state

## Test Environment

- Node version: **\_\_\_**
- Database: MongoDB
- Browser: **\_\_\_**
- Date tested: **\_\_\_**
- Tester: **\_\_\_**
