# User Profile and Management Features

## Overview

The application now includes a comprehensive user profile system with profile management and admin-only user management capabilities.

## Features

### User Profile Page

**Location**: `/profile`

All authenticated users can:

- View and update their profile information
- Change their name, email, and profile image
- View their current role (USER or ADMIN)

### Admin User Management

**Access**: Admin users only (visible on Profile page)

Administrators can:

- View all registered users
- Promote users to ADMIN role
- Demote ADMIN users to USER role (except themselves)
- Delete user accounts (except their own)
- See user join dates and basic information

## Navigation

### Sidebar User Icon

- **Previous**: Clicking the user icon/avatar in the sidebar navigated to `/settings`
- **Now**: Clicking the user icon/avatar navigates to `/profile`

### Menu Structure

The application now has two separate pages:

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
- Join date display (relative time)
- Action dropdown menu per user:
  - Toggle admin role
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

### Data Validation

- All inputs validated with Zod schemas
- Email uniqueness checked before update
- Server-side validation on all actions

### Session Management

- Profile updates trigger session refresh
- Changes reflected immediately in UI
- Session data kept in sync with database

## Usage Examples

### Updating Profile

```typescript
import { updateProfile } from "@/app/actions/profile-actions";

const result = await updateProfile({
  name: "John Doe",
  email: "john@example.com",
  image: "https://example.com/avatar.jpg",
});

if (result.status === "success") {
  // Profile updated successfully
  // Session is automatically refreshed
}
```

### Managing Users (Admin)

```typescript
import { updateUserRole, deleteUser } from "@/app/actions/profile-actions";

// Promote user to admin
await updateUserRole("user-id", "ADMIN");

// Remove user
await deleteUser("user-id");
```

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
- Relative timestamps ("2 days ago")
- Dropdown actions menu
- Confirmation dialogs for destructive actions

## Route Configuration

### Updated Routes

```typescript
// components/routes.tsx
{
  name: "Profile",
  path: "/profile",
  icon: <HiOutlineUser />,
}

// config/routes.ts
export const privateRoutes = [
  "/dashboard",
  "/users",
  "/settings",
  "/profile"  // Added
];
```

### Sidebar Navigation

```tsx
// Before
<a href="/settings">
  <Avatar />
</a>

// After
<a href="/profile">
  <Avatar />
</a>
```

## Dependencies

### Required Packages

- `react-hook-form`: Form state management
- `zod`: Schema validation
- `@tanstack/react-query`: Data fetching and caching
- `sonner`: Toast notifications
- `date-fns`: Date formatting
- `lucide-react`: Icons

### UI Components

- Avatar, AvatarFallback, AvatarImage
- Card, CardHeader, CardContent
- Table, TableHeader, TableBody, TableRow, TableCell
- Badge
- DropdownMenu
- AlertDialog
- Button, Input, Label

## Error Handling

### Profile Updates

- Email already in use
- Validation errors
- Network failures
- Unauthorized access

### User Management

- Self-modification prevention
- Admin-only access enforcement
- Graceful error messages
- Automatic query invalidation

## Testing Checklist

- [ ] Regular user can update own profile
- [ ] Email uniqueness validation works
- [ ] Profile image preview updates correctly
- [ ] Session refreshes after profile update
- [ ] Admin can see user management section
- [ ] Admin can promote/demote users
- [ ] Admin cannot change own role
- [ ] Admin can delete other users
- [ ] Admin cannot delete self
- [ ] Regular users cannot access admin functions
- [ ] Sidebar navigates to profile page
- [ ] Toast notifications appear correctly
- [ ] Confirmation dialogs prevent accidental deletions

## Future Enhancements

Potential improvements:

- Password change functionality
- Email verification for email changes
- User activity logs
- Bulk user operations
- User search and filtering
- Export user list
- User status (active/inactive)
- Profile picture upload (vs URL input)
- Two-factor authentication settings
