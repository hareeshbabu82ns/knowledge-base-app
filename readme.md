# HKBase - Knowledge Base Application

A full-stack financial knowledge base application built with Next.js, featuring secure authentication, two-factor authentication (TOTP), and comprehensive user management.

## Features

- 🔐 **Secure Authentication**: Email/password and OAuth (Google) sign-in
- 🔒 **Two-Factor Authentication**: Mandatory TOTP for password-based accounts
- 👥 **User Management**: Admin controls for user roles and account management
- 🎨 **Modern UI**: Built with Tailwind CSS and Shadcn components
- 📱 **Responsive Design**: Mobile-first approach with dark/light mode support
- 💾 **MongoDB Database**: Prisma ORM for type-safe database operations

## Documentation

📚 **[Complete Documentation](docs/DOCUMENTATION.md)** - Comprehensive guide covering:

- User Authentication & Signup
- OAuth Account Merging
- Two-Factor Authentication (TOTP)
- Admin & Signup Restrictions
- User Profile & Management

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- MongoDB database (local or cloud)

### Installation

```sh
# Clone the repository
git clone <repository-url>
cd knowledge-base-app

# Install dependencies
pnpm install

# Set up environment variables
cp .env.sample .env
# Edit .env with your configuration
```

### Database Setup

```sh
# Generate Prisma client
pnpm db:gen

# Run migrations (if applicable)
pnpm db:migrate

# Open Prisma Studio to view data
pnpm db:studio
```

### Development

```sh
# Start development server
pnpm dev

# Preview email templates
pnpm dev:emails
```

Visit `http://localhost:3000` to see the application.

### Optional: Local MongoDB

```sh
docker compose up -d
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="mongodb://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Admin Configuration
ADMIN_EMAILS="admin@example.com"

# TOTP Configuration
TOTP_ENCRYPTION_KEY="<base64-encoded-32-byte-key>"

# OAuth (Optional)
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Email (Optional)
SMTP_FROM="noreply@yourdomain.com"
RESEND_API_KEY="your-resend-api-key"
```

Generate TOTP encryption key:

```sh
openssl rand -base64 32
```

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript 5.0+
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js with TOTP support
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Forms**: React Hook Form with Zod validation
- **State Management**: TanStack Query

## Project Structure

```
knowledge-base-app/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (app)/             # Protected app routes
│   ├── actions/           # Server actions
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   └── features/          # Feature-specific components
├── lib/                   # Utility functions
│   ├── auth/              # Authentication utilities
│   ├── db/                # Database client
│   └── validations/       # Zod schemas
├── prisma/                # Prisma schema and migrations
├── docs/                  # Documentation
└── public/                # Static assets
```

## Scripts

```sh
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm db:gen       # Generate Prisma client
pnpm db:migrate   # Run database migrations
pnpm db:studio    # Open Prisma Studio
pnpm dev:emails   # Preview email templates
```

## Authentication Setup

### OAuth Providers

- **Google**: https://console.cloud.google.com/apis/credentials
- **GitHub**: https://github.com/settings/apps

Add credentials to your `.env` file.

### Admin Users

Set admin emails in `.env`:

```env
ADMIN_EMAILS="admin@example.com,manager@company.com"
```

Seed admin users:

```sh
pnpm tsx scripts/seed-admins.ts
```

## Icon Generation

![Settings](/public/assets/icon-kitchen-settings.png)

- Tool: https://icon.kitchen
- Source image: `/public/assets/KBase App Icon.png`
- Settings:
  - Icons Set: Web Icons
  - Scaling: Crop
  - Mask: False
  - Padding: 2%
  - Bg Type: Color
  - Bg Color: #070F31
  - Fav icon: Squircle

## Git & Version Control

```sh
# Configure git (if needed)
git config --local commit.gpgsign false
git config --local user.email your-email@example.com

# Commit changes
git add .
git commit -m "your commit message"
git push origin main

# Tagging
git tag -a v1.0.0 -m "tag description"
git push origin v1.0.0

# Push multiple tags
git push origin --tags

# Using release script
pnpm run release:patch  # Auto-tags and pushes
```

## References

- Config: https://github.com/Blazity/next-enterprise
- UI Components:
  - [shadcn-nextjs-boilerplate](https://github.com/horizon-ui/shadcn-nextjs-boilerplate)
  - [Flowbite](https://flowbite.com/docs/components/pagination/)
  - [React Icons](https://react-icons.github.io/react-icons/search/#q=)

## License

See [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For issues, questions, or contributions, please refer to the [documentation](docs/DOCUMENTATION.md) or open an issue on GitHub.
