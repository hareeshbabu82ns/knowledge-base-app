/**
 * Script to update existing users to ADMIN role based on ADMIN_EMAILS environment variable
 * Run this script with: pnpm tsx scripts/seed-admins.ts
 */

import { PrismaClient } from "../app/generated/prisma";

const prisma = new PrismaClient();

async function seedAdmins() {
  try {
    const adminEmailsEnv = process.env.ADMIN_EMAILS;

    if (!adminEmailsEnv) {
      console.log("No ADMIN_EMAILS environment variable found. Skipping...");
      return;
    }

    const adminEmails = adminEmailsEnv
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (adminEmails.length === 0) {
      console.log("No admin emails configured. Skipping...");
      return;
    }

    console.log(`Found ${adminEmails.length} admin email(s):`, adminEmails);

    // Update all users with matching emails to ADMIN role
    const result = await prisma.user.updateMany({
      where: {
        email: {
          in: adminEmails,
        },
        role: {
          not: "ADMIN",
        },
      },
      data: {
        role: "ADMIN",
      },
    });

    console.log(
      `✅ Successfully updated ${result.count} user(s) to ADMIN role`,
    );

    // List all current admins
    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
      select: {
        email: true,
        name: true,
        role: true,
      },
    });

    console.log("\nCurrent admin users:");
    admins.forEach((admin) => {
      console.log(`  - ${admin.email} (${admin.name || "No name"})`);
    });
  } catch (error) {
    console.error("Error seeding admin users:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmins();
