# Database Migration Guide for TOTP Implementation

## Overview

This guide covers the database migration steps required for the TOTP (Two-Factor Authentication) implementation.

## Schema Changes

### User Model Updates

Added three new fields to the `User` model:

```prisma
model User {
  // ... existing fields

  // TOTP (Time-based One-Time Password) fields
  totpSecret      String?   // Encrypted TOTP secret
  totpEnabled     Boolean   @default(false)
  totpBackupCodes String[]  @default([]) // Array of hashed backup codes

  // ... rest of fields
}
```

## Migration Steps

### 1. Ensure Prisma Client is Updated

```bash
cd /root/knowledge-base-app
pnpm db:gen
```

Expected output:

```
✔ Generated Prisma Client to ./app/generated/prisma
```

### 2. Create and Apply Migration

```bash
pnpm db:migrate
```

When prompted for migration name, use:

```
add_totp_fields_to_user
```

### 3. Verify Migration

After migration completes, verify the changes in your MongoDB database:

```javascript
// Using MongoDB shell or MongoDB Compass
db.User.findOne()

// Expected output should include:
{
  _id: ObjectId("..."),
  // ... other fields
  totpSecret: null,
  totpEnabled: false,
  totpBackupCodes: []
}
```

## Important Notes

### Backward Compatibility

✅ **Safe Migration:** All new fields are nullable or have default values

- `totpSecret`: `String?` (optional/nullable)
- `totpEnabled`: `Boolean` with default `false`
- `totpBackupCodes`: `String[]` with default empty array `[]`

### Existing Data

- Existing users will have:

  - `totpSecret`: `null`
  - `totpEnabled`: `false`
  - `totpBackupCodes`: `[]`

- These users will be prompted to set up TOTP on next password-based sign-in

### Data Integrity

- **No data loss:** Migration only adds new fields
- **No breaking changes:** Existing authentication flows continue to work
- **OAuth users:** Not affected by TOTP requirement

## Post-Migration Verification

### 1. Check Prisma Client Types

```bash
# Verify TypeScript types are updated
grep -A 5 "totpSecret" app/generated/prisma/index.d.ts
```

### 2. Test Database Connection

Create a test script: `scripts/verify-totp-schema.ts`

```typescript
import { db } from "@/lib/db";

async function verifySchema() {
  try {
    // Try to query with new fields
    const user = await db.user.findFirst({
      select: {
        id: true,
        email: true,
        totpSecret: true,
        totpEnabled: true,
        totpBackupCodes: true,
      },
    });

    console.log("✅ Schema verified successfully");
    console.log("Sample user:", user);
  } catch (error) {
    console.error("❌ Schema verification failed:", error);
  }
}

verifySchema();
```

Run verification:

```bash
npx tsx scripts/verify-totp-schema.ts
```

### 3. Test TOTP Operations

```typescript
import { db } from "@/lib/db";
import { encrypt } from "@/lib/auth/totp";

async function testTotpOperations() {
  // Find a test user
  const testUser = await db.user.findFirst({
    where: { email: "test@example.com" },
  });

  if (!testUser) {
    console.log("No test user found");
    return;
  }

  // Test updating TOTP fields
  await db.user.update({
    where: { id: testUser.id },
    data: {
      totpSecret: encrypt("TEST_SECRET"),
      totpEnabled: true,
      totpBackupCodes: ["hash1", "hash2"],
    },
  });

  console.log("✅ TOTP operations successful");
}

testTotpOperations();
```

## Rollback Plan

If you need to rollback the migration:

### Option 1: Remove Fields (Recommended)

```bash
# Edit prisma/schema.prisma - remove the three TOTP fields
# Then run:
pnpm db:migrate
```

### Option 2: Manual MongoDB Update

```javascript
// Using MongoDB shell
db.User.updateMany(
  {},
  {
    $unset: {
      totpSecret: "",
      totpEnabled: "",
      totpBackupCodes: "",
    },
  },
);
```

## Troubleshooting

### Issue: Migration Fails

**Error:** `P3006: Migration failed to apply`

**Solution:**

1. Check MongoDB connection
2. Verify schema syntax
3. Check for field conflicts
4. Review migration logs

```bash
# Check connection
pnpm prisma db pull

# Validate schema
pnpm prisma validate
```

### Issue: Prisma Client Not Updated

**Error:** TypeScript errors about missing fields

**Solution:**

```bash
# Force regenerate Prisma client
rm -rf node_modules/.prisma
rm -rf app/generated/prisma
pnpm db:gen
```

### Issue: Database Sync Problems

**Error:** Schema drift detected

**Solution:**

```bash
# Pull current database state
pnpm prisma db pull

# Compare with schema.prisma
# Resolve conflicts manually
# Then push changes
pnpm db:migrate
```

## Environment Requirements

### Required Environment Variables

```bash
# Database connection
DATABASE_URL="mongodb+srv://..."

# TOTP encryption (added automatically)
TOTP_ENCRYPTION_KEY="<base64-encoded-key>"
```

### Verify Environment

```bash
# Check if all required vars exist
grep -E "(DATABASE_URL|TOTP_ENCRYPTION_KEY)" .env
```

## Migration Checklist

- [ ] Backup database before migration
- [ ] Update schema.prisma with TOTP fields
- [ ] Run `pnpm db:gen` to update Prisma client
- [ ] Run `pnpm db:migrate` to apply migration
- [ ] Verify TypeScript types are updated
- [ ] Test database queries with new fields
- [ ] Verify existing data integrity
- [ ] Test TOTP operations (enable/disable)
- [ ] Document migration date and version
- [ ] Notify team of changes

## Production Deployment

### Pre-Deployment

1. Test migration in staging environment
2. Verify no errors in staging
3. Create database backup
4. Schedule maintenance window (if needed)

### Deployment Steps

1. Stop application (if zero-downtime not possible)
2. Backup production database
3. Run migration: `pnpm db:migrate`
4. Verify migration success
5. Restart application
6. Monitor for errors
7. Test TOTP functionality

### Post-Deployment

1. Monitor application logs
2. Check user reports
3. Verify TOTP setup flow
4. Test sign-in with TOTP
5. Verify admin TOTP management

## Support

For migration issues:

1. Check Prisma documentation: https://www.prisma.io/docs/
2. Review MongoDB logs
3. Check application error logs
4. Consult this guide's troubleshooting section
