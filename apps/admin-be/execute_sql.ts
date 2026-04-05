import { db } from "./src/db"
import { sql } from "drizzle-orm"

async function run() {
    try {
        console.log("Running direct sql commands...")

        await db.execute(sql`CREATE EXTENSION IF NOT EXISTS postgis;`)

        await db.execute(sql`
            DO $$ BEGIN
                CREATE TYPE "public"."kyc_doc_type" AS ENUM('aadhar', 'pan');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `)

        await db.execute(sql`
            DO $$ BEGIN
                CREATE TYPE "public"."vendor_type" AS ENUM('market_vendor', 'mandi_vendor');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `)

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "vendors" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                "full_name" varchar(255) NOT NULL,
                "primary_phone" varchar(20) NOT NULL,
                "alternate_phone" varchar(20),
                "type" "vendor_type" NOT NULL,
                "created_by" uuid NOT NULL,
                "created_at" timestamp DEFAULT now() NOT NULL,
                "updated_at" timestamp DEFAULT now() NOT NULL,
                CONSTRAINT "vendors_primaryPhone_unique" UNIQUE("primary_phone")
            );
        `)

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "stores" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                "vendor_id" uuid NOT NULL,
                "lat" double precision NOT NULL,
                "lng" double precision NOT NULL,
                "radius_km" integer DEFAULT 4,
                "full_address" varchar(500) NOT NULL,
                "store_name" varchar(255),
                "store_image" varchar(500),
                "created_at" timestamp DEFAULT now() NOT NULL,
                "updated_at" timestamp DEFAULT now() NOT NULL
            );
        `)

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "kyc_docs" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                "vendor_id" uuid NOT NULL,
                "type" "kyc_doc_type" NOT NULL,
                "doc_id" varchar(255) NOT NULL,
                "front_url" varchar(500),
                "back_url" varchar(500),
                "signed_kyc_doc_url" varchar(500),
                "created_at" timestamp DEFAULT now() NOT NULL,
                "updated_at" timestamp DEFAULT now() NOT NULL
            );
        `)

        console.log("Tables created successfully.")
        process.exit(0)
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

run()
