# Discord Bot License Management System

## Overview

This is a full-stack web application for managing Discord bot licenses and users. It provides an admin dashboard for creating, managing, and monitoring software licenses with Discord OAuth integration capabilities. The system tracks license status (active, expired, suspended), manages user accounts, and provides comprehensive analytics through a modern, data-focused interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR (Hot Module Replacement)
- Wouter for lightweight client-side routing instead of React Router

**UI Component System:**
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Design system inspired by Linear, Vercel Dashboard, and Stripe
- Custom color system using HSL values with CSS variables for theming
- Typography: Inter font for UI elements, JetBrains Mono for technical content (license keys, IDs)

**State Management:**
- TanStack Query (React Query) for server state management with aggressive caching
- No client-side state management library; relies on React hooks and Query for data
- Query client configured with `staleTime: Infinity` to minimize refetching

**Key Design Decisions:**
- **Data-first approach:** Clean tables, clear information hierarchy, minimal distractions
- **Accessibility:** Radix UI provides ARIA-compliant primitives out of the box
- **Performance:** Vite's dev server and optimized production builds, Query caching reduces network requests
- **Developer Experience:** TypeScript for type safety, path aliases for cleaner imports

### Backend Architecture

**Server Framework:**
- Express.js for HTTP server and middleware
- Session-based authentication using express-session
- Passport.js for authentication strategies (Local and planned Discord OAuth)

**Database & ORM:**
- MongoDB as the primary database (currently using MongoDB Atlas)
- Mongoose ODM for schema validation and data modeling
- Planned migration to PostgreSQL with Drizzle ORM (config files present but not actively used)

**Authentication Flow:**
- Email/password authentication via Passport Local Strategy
- Bcrypt for password hashing (10 rounds)
- Express sessions with configurable secret and cookie settings
- Role-based access control with `isAdmin` flag on user records

**API Design:**
- RESTful API endpoints under `/api` prefix
- Standard CRUD operations for users and licenses
- Middleware for authentication (`isAuthenticated`) and authorization (`isAdmin`)
- Centralized error handling and request/response logging

**Key Architectural Decisions:**
- **Session vs JWT:** Sessions chosen for simpler server-side invalidation and built-in Express support
- **MongoDB initially:** Faster initial setup, but Drizzle config suggests future PostgreSQL migration for better relational data handling
- **Monolithic structure:** Single Express server handles both API and serves static frontend, simplifying deployment

### Data Models

**User Schema:**
- Fields: id, email, password (hashed), discordId, discordUsername, isAdmin, createdAt
- Email stored in lowercase for case-insensitive lookups
- Discord fields optional for future OAuth integration

**License Schema:**
- Fields: id, key, userId (optional reference), status (active/expired/suspended), duration (months), createdAt, expiresAt
- License keys follow format: `DISC-XXXX-XXXX-XXXX`
- Expiration calculated from createdAt + duration

**Relationships:**
- User → License: One-to-many (a user can have multiple licenses)
- License → User: Many-to-one optional (licenses can exist without assignment)

### External Dependencies

**Database:**
- MongoDB Atlas (connection string hardcoded in `server/db.ts`)
- Database name: `license_manager`
- Connection managed through Mongoose with automatic reconnection

**Authentication Services:**
- Passport.js for authentication abstraction
- Bcryptjs for password hashing
- Express-session with connect-pg-simple (configured for PostgreSQL but currently using default in-memory store)

**Frontend Libraries:**
- @radix-ui/* components for accessible UI primitives
- @tanstack/react-query for data fetching and caching
- react-hook-form with zod resolvers for form validation
- date-fns for date manipulation
- lucide-react for icons
- react-icons for brand icons (Discord, etc.)

**Development Tools:**
- TypeScript compiler for type checking
- ESBuild for server-side bundling in production
- Vite plugins for Replit integration (cartographer, dev banner, runtime error overlay)
- Drizzle Kit for future database migrations

**Planned Integrations:**
- Discord OAuth (UI elements present but backend not implemented)
- PostgreSQL with Drizzle ORM (migration path prepared)

**Build & Deployment:**
- Development: Vite dev server + tsx for TypeScript execution
- Production: Vite builds frontend to `dist/public`, ESBuild bundles server to `dist/index.js`
- Single Node.js process serves both static files and API endpoints