CREATE TYPE "public"."admin_role" AS ENUM('super_admin', 'admin', 'operator');--> statement-breakpoint
CREATE TYPE "public"."kyc_doc" AS ENUM('aadhar', 'pan');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('upi', 'card', 'net_banking', 'cash');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'success', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."market_mandi_order_status" AS ENUM('pending', 'rejected', 'confirmed', 'preparing', 'packing', 'waiting_for_delivery_partner', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TABLE "admin" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"phone" varchar(20) NOT NULL,
	"pin" varchar(255),
	"role" "admin_role" DEFAULT 'admin' NOT NULL,
	"refresh_token" varchar(255),
	"last_login_at" timestamp with time zone DEFAULT now(),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "admin_email_unique" UNIQUE("email"),
	CONSTRAINT "admin_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "city" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"state" varchar(255) NOT NULL,
	"pincode" varchar(10),
	"city_image" varchar(500),
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "city_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "mandi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"city_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"full_address" varchar(500),
	"mandi_image" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mandi_kyc_docs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"store_id" uuid NOT NULL,
	"type" "kyc_doc" NOT NULL,
	"doc_id" varchar(255) NOT NULL,
	"front_url" varchar(500),
	"back_url" varchar(500),
	"storefront_url" varchar(500),
	"signed_kyc_doc_url" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mandi_price" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mandi_store_id" uuid NOT NULL,
	"veg_id" uuid NOT NULL,
	"price" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mandi_store" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mandi_id" uuid NOT NULL,
	"vendor_id" uuid NOT NULL,
	"veg_id" uuid NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"store_name" varchar(255),
	"store_image" varchar(500),
	"full_address" varchar(500) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mandi_subcription_charges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"transaction_id" varchar(255),
	"payment_date" timestamp NOT NULL,
	"payment_status" "payment_status" NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"payment_collected_by" uuid NOT NULL,
	"note" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mandi_vendor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"primary_phone" varchar(20) NOT NULL,
	"alternate_phone" varchar(20),
	"pin" varchar(255),
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "mandi_vendor_primary_phone_unique" UNIQUE("primary_phone")
);
--> statement-breakpoint
CREATE TABLE "market_kyc_docs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"store_id" uuid NOT NULL,
	"type" "kyc_doc" NOT NULL,
	"doc_id" varchar(255) NOT NULL,
	"front_url" varchar(500),
	"back_url" varchar(500),
	"storefront_url" varchar(500),
	"signed_kyc_doc_url" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "market_mandi_order" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_code" varchar(32) NOT NULL,
	"market_store_id" uuid NOT NULL,
	"mandi_store_id" uuid NOT NULL,
	"veg_id" uuid NOT NULL,
	"mandi_store_name" varchar(255) NOT NULL,
	"market_store_name" varchar(255) NOT NULL,
	"veg_name" varchar(255) NOT NULL,
	"quantity_in_gram" integer NOT NULL,
	"price_per_kg_in_paise" integer NOT NULL,
	"total_amount_in_paise" integer NOT NULL,
	"status" "market_mandi_order_status" DEFAULT 'pending' NOT NULL,
	"confirmed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "market_mandi_order_order_code_unique" UNIQUE("order_code")
);
--> statement-breakpoint
CREATE TABLE "market_mandi_order_payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"amount_in_paise" integer NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"transaction_id" varchar(255),
	"gateway_order_id" varchar(255),
	"gateway_payment_id" varchar(255),
	"paid_at" timestamp with time zone,
	"note" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "market_mandi_order_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"status" "market_mandi_order_status" NOT NULL,
	"changed_by_type" varchar(32) NOT NULL,
	"changed_by_id" uuid,
	"note" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "market_store" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mandi_id" uuid NOT NULL,
	"vendor_id" uuid NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"store_name" varchar(255),
	"store_image" varchar(500),
	"full_address" varchar(500) NOT NULL,
	"radius_m" integer DEFAULT 4000,
	"slot" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "market_subcription_charges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"transaction_id" varchar(255),
	"payment_date" timestamp NOT NULL,
	"payment_status" "payment_status" NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"payment_collected_by" uuid NOT NULL,
	"note" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "market_vendor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"primary_phone" varchar(20) NOT NULL,
	"alternate_phone" varchar(20),
	"pin" varchar(255),
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "market_vendor_primary_phone_unique" UNIQUE("primary_phone")
);
--> statement-breakpoint
CREATE TABLE "veg" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(500) NOT NULL,
	"name_in_hindi" varchar(255),
	"veg_primary_image" varchar(500),
	"veg_image_gallery" varchar(500)[],
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "veg_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "city" ADD CONSTRAINT "city_created_by_admin_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandi" ADD CONSTRAINT "mandi_city_id_city_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."city"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandi" ADD CONSTRAINT "mandi_created_by_admin_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandi_kyc_docs" ADD CONSTRAINT "mandi_kyc_docs_vendor_id_mandi_vendor_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."mandi_vendor"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandi_kyc_docs" ADD CONSTRAINT "mandi_kyc_docs_store_id_mandi_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."mandi_store"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandi_price" ADD CONSTRAINT "mandi_price_mandi_store_id_mandi_store_id_fk" FOREIGN KEY ("mandi_store_id") REFERENCES "public"."mandi_store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandi_price" ADD CONSTRAINT "mandi_price_veg_id_veg_id_fk" FOREIGN KEY ("veg_id") REFERENCES "public"."veg"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandi_store" ADD CONSTRAINT "mandi_store_mandi_id_mandi_id_fk" FOREIGN KEY ("mandi_id") REFERENCES "public"."mandi"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandi_store" ADD CONSTRAINT "mandi_store_vendor_id_mandi_vendor_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."mandi_vendor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandi_store" ADD CONSTRAINT "mandi_store_veg_id_veg_id_fk" FOREIGN KEY ("veg_id") REFERENCES "public"."veg"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandi_subcription_charges" ADD CONSTRAINT "mandi_subcription_charges_vendor_id_mandi_vendor_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."mandi_vendor"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandi_subcription_charges" ADD CONSTRAINT "mandi_subcription_charges_payment_collected_by_admin_id_fk" FOREIGN KEY ("payment_collected_by") REFERENCES "public"."admin"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandi_vendor" ADD CONSTRAINT "mandi_vendor_created_by_admin_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_kyc_docs" ADD CONSTRAINT "market_kyc_docs_vendor_id_market_vendor_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."market_vendor"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_kyc_docs" ADD CONSTRAINT "market_kyc_docs_store_id_market_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."market_store"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_mandi_order" ADD CONSTRAINT "market_mandi_order_market_store_id_market_store_id_fk" FOREIGN KEY ("market_store_id") REFERENCES "public"."market_store"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_mandi_order" ADD CONSTRAINT "market_mandi_order_mandi_store_id_mandi_store_id_fk" FOREIGN KEY ("mandi_store_id") REFERENCES "public"."mandi_store"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_mandi_order" ADD CONSTRAINT "market_mandi_order_veg_id_veg_id_fk" FOREIGN KEY ("veg_id") REFERENCES "public"."veg"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_mandi_order_payment" ADD CONSTRAINT "market_mandi_order_payment_order_id_market_mandi_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."market_mandi_order"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_mandi_order_status_history" ADD CONSTRAINT "market_mandi_order_status_history_order_id_market_mandi_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."market_mandi_order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_store" ADD CONSTRAINT "market_store_mandi_id_mandi_id_fk" FOREIGN KEY ("mandi_id") REFERENCES "public"."mandi"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_store" ADD CONSTRAINT "market_store_vendor_id_market_vendor_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."market_vendor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_subcription_charges" ADD CONSTRAINT "market_subcription_charges_vendor_id_market_vendor_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."market_vendor"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_subcription_charges" ADD CONSTRAINT "market_subcription_charges_payment_collected_by_admin_id_fk" FOREIGN KEY ("payment_collected_by") REFERENCES "public"."admin"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_vendor" ADD CONSTRAINT "market_vendor_created_by_admin_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "veg" ADD CONSTRAINT "veg_created_by_admin_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin"("id") ON DELETE set null ON UPDATE no action;