CREATE TYPE "public"."kyc_doc_type" AS ENUM('aadhar', 'pan');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('upi', 'card', 'net_banking', 'cash');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'success', 'failed');--> statement-breakpoint
CREATE TYPE "public"."vendor_type" AS ENUM('market_vendor', 'mandi_vendor');--> statement-breakpoint
CREATE TABLE "admin" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"pin" varchar(6),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "kyc_docs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"store_id" uuid NOT NULL,
	"type" "kyc_doc_type" NOT NULL,
	"doc_id" varchar(255) NOT NULL,
	"front_url" varchar(500),
	"back_url" varchar(500),
	"storefront_url" varchar(500),
	"signed_kyc_doc_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registration_charges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"transaction_id" varchar(255),
	"payment_date" timestamp NOT NULL,
	"payment_status" "payment_status" NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"cash_collected_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stores" (
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
--> statement-breakpoint
CREATE TABLE "vendors" (
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
--> statement-breakpoint
ALTER TABLE "kyc_docs" ADD CONSTRAINT "kyc_docs_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_docs" ADD CONSTRAINT "kyc_docs_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_charges" ADD CONSTRAINT "registration_charges_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_charges" ADD CONSTRAINT "registration_charges_cash_collected_by_admin_id_fk" FOREIGN KEY ("cash_collected_by") REFERENCES "public"."admin"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;