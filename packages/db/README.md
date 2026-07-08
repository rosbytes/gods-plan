# @ros/db

This package houses the shared database schema, migrations, and database client powered by Drizzle ORM.

## Scripts

- `pnpm db:up` - Drizzle-kit up command
- `pnpm db:push` - Push typescript schema changes directly to the database (for local development)
- `pnpm db:migrate` - Run database migrations locally
- `pnpm db:generate` - Generate new migration files based on schema changes
- `pnpm db:build` - Seeds the local database using the `./seedl.ts` file
- `pnpm db:prod:build` - Seeds the production database using the `./seedl.ts` file

## Database Seeding

To seed the database with mock records (Admins, Cities, Vegetables, Mandis, Vendors, Stores, and Prices), ensure your database is running and run:

```bash
pnpm --filter @ros/db db:build
```
