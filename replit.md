# Restaurant Stock Management System

## Overview

This is a full-stack restaurant inventory management application built with React, TypeScript, Express, and Vite. **Recently migrated from Lovable (frontend-only with direct Supabase access) to Replit's fullstack template with Express backend and API-based architecture.** The system enables restaurant owners to track daily stock levels, record sales, calculate profits, and manage product inventory. It features a modern UI built with shadcn/ui components and Tailwind CSS, providing an intuitive interface for daily stock operations.

The application allows users to maintain a product catalog with pricing information, create daily inventory records tracking opening/closing stock levels, and automatically calculate profits based on cost and selling prices. It includes visual analytics through profit charts and summary statistics cards.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Migration (November 2025)

**Status**: ✅ **Migration successfully completed!** The application is fully functional on Replit's fullstack template.

**Completed Work**:
- ✅ Created fullstack directory structure (client/, server/, shared/)
- ✅ Implemented Drizzle schemas matching original Supabase tables
- ✅ Created MemStorage for development (can be swapped to Postgres)
- ✅ Built Express API with routes for products and daily records
- ✅ Migrated all components to use API calls instead of Supabase client
- ✅ Updated routing from react-router-dom to wouter
- ✅ Fixed all TypeScript compilation errors
- ✅ Fixed Express 5 compatibility issues (changed wildcard routes to use `app.use()`)
- ✅ Added `allowedHosts: true` to vite.config.ts for Replit iframe support
- ✅ Resolved server stability issues:
  - Added API request guard in server/vite.ts to prevent Vite from intercepting API calls
  - Added error-handling middleware to prevent crashes from unhandled exceptions
  - Configured tsx watch to ignore Vite timestamp files (preventing infinite restart loop)

**Technical Fixes**:
- **server/vite.ts**: Added guard `if (req.path.startsWith('/api')) return next()` to short-circuit API requests before HTML fallback
- **server/index.ts**: Added comprehensive error-handling middleware and try/catch wrappers for predictable error handling
- **package.json**: Updated dev script to `tsx watch --ignore '**/*.timestamp-*.mjs'` to prevent tsx from restarting when Vite creates cache files

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized builds
- Wouter for lightweight client-side routing (single-page application with Index and NotFound routes)
- File-based routing structure with pages in `client/src/pages/`

**UI Component System**
- shadcn/ui component library built on Radix UI primitives for accessibility
- Tailwind CSS for utility-first styling with custom design tokens defined in HSL color space
- Custom theme system with CSS variables supporting light/dark modes
- Component variants managed through class-variance-authority (CVA)

**State Management & Data Fetching**
- TanStack Query (React Query) for server state management, caching, and automatic refetching
- Custom query client with 1-minute stale time and disabled window focus refetching
- Optimistic updates pattern for mutations with manual cache invalidation
- No global client state management (relies on server state and local component state)

**Form Handling**
- React Hook Form with Zod resolvers for schema-based validation
- Reusable form components leveraging Radix UI primitives

**Design System**
- HSL-based color system with semantic color tokens (primary, secondary, muted, accent, destructive)
- Custom shadows and gradients defined as CSS variables
- Responsive breakpoints with mobile-first approach
- 0.75rem base border radius for consistent roundness

### Backend Architecture

**Server Framework**
- Express.js server with TypeScript for API endpoints
- Custom middleware for request/response logging with duration tracking
- Development mode uses `tsx watch` for hot reloading
- Production mode uses `tsx` to run compiled TypeScript directly

**API Design Pattern**
- RESTful API structure with resource-based endpoints (`/api/products`, `/api/daily-records`)
- Standard HTTP methods (GET, POST, PATCH, DELETE) for CRUD operations
- Query parameters for filtering (e.g., `?date=YYYY-MM-DD` for daily records)
- Zod schemas for request validation with detailed error responses

**Data Storage Strategy**
- Interface-based storage abstraction (`IStorage`) for flexibility
- Current implementation uses in-memory storage (`MemStorage`) with Map data structures
- Designed to support future database integration without API changes
- Auto-incrementing IDs with UUID format using custom generators
- Sample data seeding on initialization for development

**Business Logic**
- Automatic calculation of closing stock, amount sold, and profit in daily records
- Previous day's closing stock becomes next day's opening stock
- Profit calculated as `(sellingPrice - costPrice) × soldStock`

### Build & Development Setup

**Development Workflow**
- Vite dev server runs on port 5000 with HMR enabled
- Server-side rendering (SSR) middleware for HTML transformation
- Express serves Vite middleware in development mode
- Client code in `client/src/`, server code in `server/`
- Shared types and schemas in `shared/` directory

**Production Build**
- `npm run build` compiles React app to `dist/public/`
- Static assets served from compiled output
- Express serves production build with proper routing fallback

**Path Aliases**
- `@/` maps to `client/src/`
- `@shared/` maps to `shared/`
- `@assets/` maps to `attached_assets/`
- Configured in both Vite and TypeScript configs for consistency

### Data Schema

**Products Table**
- UUID primary key with auto-generation
- Text fields: name, category
- Decimal fields (10,2 precision): costPrice, sellingPrice
- Timestamps: createdAt, updatedAt

**Daily Records Table**
- UUID primary key
- Foreign key reference to products with cascade delete
- Date field for record tracking
- Integer fields: openingStock, addedStock, soldStock, closingStock
- Decimal fields (10,2 precision): amountSold, profit
- Timestamps: createdAt, updatedAt

**Schema Validation**
- Drizzle ORM schema definitions with Zod integration via `drizzle-zod`
- Type-safe insert schemas excluding auto-generated fields
- Coercion of string inputs to numbers for price fields
- Minimum length validation for required text fields

## External Dependencies

### UI & Styling
- **@radix-ui/* components**: Comprehensive set of unstyled, accessible UI primitives (accordion, dialog, dropdown, select, tabs, toast, etc.)
- **Tailwind CSS**: Utility-first CSS framework with PostCSS and Autoprefixer
- **class-variance-authority**: Type-safe component variant management
- **tailwind-merge & clsx**: Utility for merging Tailwind classes without conflicts
- **lucide-react**: Icon library for consistent iconography

### Data & Forms
- **@tanstack/react-query**: Server state management and caching
- **zod**: TypeScript-first schema validation
- **react-hook-form & @hookform/resolvers**: Form state management with validation
- **drizzle-orm & drizzle-zod**: TypeScript ORM with Zod schema generation

### Server
- **express**: Web server framework
- **dotenv**: Environment variable management
- **tsx**: TypeScript execution for Node.js

### Development Tools
- **vite**: Build tool and dev server with React SWC plugin
- **@vitejs/plugin-react-swc**: Fast React refresh using SWC compiler
- **typescript & typescript-eslint**: Type checking and linting
- **wouter**: Minimalist routing library (alternative to React Router)

### Additional Libraries
- **date-fns**: Date manipulation and formatting
- **cmdk**: Command menu component
- **embla-carousel-react**: Carousel/slider component
- **sonner**: Toast notification system
- **vaul**: Drawer component library

### Note on Database
The application currently uses in-memory storage but is architected to support Postgres through Drizzle ORM. The schema definitions in `shared/schema.ts` use Drizzle's Postgres table definitions, indicating planned or future database integration. The storage interface abstraction allows switching from `MemStorage` to a Postgres-backed implementation without changing the API layer.