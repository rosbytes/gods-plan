CREATE TYPE "public"."fulfillment_type" AS ENUM('delivery', 'self_pickup');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'accepted', 'rejected', 'confirmed', 'preparing', 'packing', 'waiting_for_delivery_partner', 'ready_for_pickup', 'pickuped_up', 'out_for_delivery', 'delivered', 'fulfilled', 'partially_fulfilled', 'cancelled', 'refunded', 'partially_refunded');--> statement-breakpoint
CREATE TYPE "public"."payment_provider" AS ENUM('razorpay', 'stripe', 'cashfree', 'phonepe', 'manual');--> statement-breakpoint
CREATE TYPE "public"."payment_split_type" AS ENUM('vendor_payout', 'platform_commission', 'delivery_partner', 'tax');--> statement-breakpoint
CREATE TYPE "public"."wallet_transaction_type" AS ENUM('credit', 'debit');--> statement-breakpoint
CREATE TYPE "public"."wallet_reference_type" AS ENUM('order', 'payment', 'admin', 'gateway');--> statement-breakpoint
CREATE TYPE "public"."wallet_transaction_category" AS ENUM('topup', 'order_payment', 'order_refund', 'withdrawal', 'admin_adjustment', 'cashback');--> statement-breakpoint
CREATE TYPE "public"."wallet_transaction_status" AS ENUM('pending', 'success', 'failed', 'cancelled');--> statement-breakpoint
ALTER TYPE "public"."admin_role" ADD VALUE 'customer_support';--> statement-breakpoint
ALTER TYPE "public"."admin_role" ADD VALUE 'ros_counter_operator';--> statement-breakpoint
ALTER TYPE "public"."payment_method" ADD VALUE 'wallet';--> statement-breakpoint
ALTER TYPE "public"."payment_method" ADD VALUE 'bank_transfer';--> statement-breakpoint
CREATE TABLE "mandi_counter" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mandi_id" uuid NOT NULL,
	"counter_name" varchar(255) NOT NULL,
	"counter_code" varchar(32) NOT NULL,
	"operator_id" uuid,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"full_address" varchar(500),
	"mandi_counter_image" varchar(500),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "mandi_counter_counter_code_unique" UNIQUE("counter_code")
);
--> statement-breakpoint
CREATE TABLE "market_mandi_order_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"mandi_store_id" uuid NOT NULL,
	"veg_id" uuid NOT NULL,
	"veg_name_snapshot" varchar(255) NOT NULL,
	"mandi_store_name_snapshot" varchar(255) NOT NULL,
	"quantity_in_gram" integer NOT NULL,
	"price_per_kg" integer NOT NULL,
	"total_amount" integer NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "market_mandi_payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"mandi_counter_id" uuid,
	"collected_by_operator_id" uuid,
	"idempotency_key" varchar(128) NOT NULL,
	"provider" "payment_provider" NOT NULL,
	"method" "payment_method",
	"gateway_order_id" varchar(128),
	"gateway_payment_id" varchar(128),
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"status" "payment_status" DEFAULT 'created' NOT NULL,
	"gateway_fee" integer,
	"failure_reason" text,
	"gateway_metadata" jsonb,
	"version" integer DEFAULT 1 NOT NULL,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "market_mandi_payment_split" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" uuid NOT NULL,
	"split_type" "payment_split_type" NOT NULL,
	"vendor_id" uuid,
	"amount" integer NOT NULL,
	"settled" boolean DEFAULT false NOT NULL,
	"settled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_mandi_payment_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" uuid NOT NULL,
	"from_status" "payment_status",
	"to_status" "payment_status" NOT NULL,
	"reason" text,
	"triggered_by" varchar(32) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_mandi_payment_webhook_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" "payment_provider" NOT NULL,
	"event_id" varchar(128) NOT NULL,
	"event_type" varchar(64) NOT NULL,
	"payment_id" uuid,
	"raw_payload" jsonb NOT NULL,
	"processed" boolean DEFAULT false NOT NULL,
	"processed_at" timestamp with time zone,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_vendor_cart" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"market_store_id" uuid NOT NULL,
	"mandi_store_id" uuid NOT NULL,
	"veg_id" uuid NOT NULL,
	"quantity_in_gram" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "market_vendor_cart_unique" UNIQUE("market_store_id","mandi_store_id","veg_id")
);
--> statement-breakpoint
CREATE TABLE "market_vendor_wallet" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"frozen_balance" integer DEFAULT 0 NOT NULL,
	"currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "market_vendor_wallet_transaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" uuid NOT NULL,
	"vendor_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"type" "wallet_transaction_type" NOT NULL,
	"category" "wallet_transaction_category" NOT NULL,
	"status" "wallet_transaction_status" DEFAULT 'success' NOT NULL,
	"reference_type" "wallet_reference_type",
	"reference_id" varchar(255),
	"balance_before" integer,
	"balance_after" integer,
	"description" varchar(500),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "market_mandi_order_payment" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "market_mandi_order_payment" CASCADE;--> statement-breakpoint
ALTER TABLE "market_mandi_order" DROP CONSTRAINT "market_mandi_order_mandi_store_id_mandi_store_id_fk";
--> statement-breakpoint
ALTER TABLE "market_mandi_order" DROP CONSTRAINT "market_mandi_order_veg_id_veg_id_fk";
--> statement-breakpoint
ALTER TABLE "mandi_subcription_charges" ALTER COLUMN "payment_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "market_mandi_payment" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "market_mandi_payment" ALTER COLUMN "status" SET DEFAULT 'created'::text;--> statement-breakpoint
ALTER TABLE "market_mandi_payment_status_history" ALTER COLUMN "from_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "market_mandi_payment_status_history" ALTER COLUMN "to_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "market_subcription_charges" ALTER COLUMN "payment_status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."payment_status";--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('created', 'pending', 'authorized', 'captured', 'failed', 'cancelled', 'refunded', 'partially_refunded', 'expired');--> statement-breakpoint
ALTER TABLE "mandi_subcription_charges" ALTER COLUMN "payment_status" SET DATA TYPE "public"."payment_status" USING "payment_status"::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "market_mandi_payment" ALTER COLUMN "status" SET DEFAULT 'created'::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "market_mandi_payment" ALTER COLUMN "status" SET DATA TYPE "public"."payment_status" USING "status"::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "market_mandi_payment_status_history" ALTER COLUMN "from_status" SET DATA TYPE "public"."payment_status" USING "from_status"::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "market_mandi_payment_status_history" ALTER COLUMN "to_status" SET DATA TYPE "public"."payment_status" USING "to_status"::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "market_subcription_charges" ALTER COLUMN "payment_status" SET DATA TYPE "public"."payment_status" USING "payment_status"::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "mandi_subcription_charges" ALTER COLUMN "payment_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "market_mandi_order" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "market_mandi_order" ALTER COLUMN "status" SET DATA TYPE "public"."order_status" USING "status"::text::"public"."order_status";--> statement-breakpoint
ALTER TABLE "market_mandi_order" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "mandi_subcription_charges" ADD COLUMN "gateway_order_id" varchar(255);--> statement-breakpoint
ALTER TABLE "mandi_subcription_charges" ADD COLUMN "gateway_payment_id" varchar(255);--> statement-breakpoint
ALTER TABLE "market_mandi_order" ADD COLUMN "idempotency_key" varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE "market_mandi_order" ADD COLUMN "fulfillment_type" "fulfillment_type" DEFAULT 'delivery' NOT NULL;--> statement-breakpoint
ALTER TABLE "market_mandi_order" ADD COLUMN "mandi_counter_id" uuid;--> statement-breakpoint
ALTER TABLE "market_mandi_order" ADD COLUMN "pickup_code" varchar(16);--> statement-breakpoint
ALTER TABLE "market_mandi_order" ADD COLUMN "counter_paid_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "market_mandi_order" ADD COLUMN "subtotal" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "market_mandi_order" ADD COLUMN "tax" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "market_mandi_order" ADD COLUMN "delivery_fee" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "market_mandi_order" ADD COLUMN "discount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "market_mandi_order" ADD COLUMN "total_amount" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "market_mandi_order" ADD COLUMN "delivery_address_line1" text;--> statement-breakpoint
ALTER TABLE "market_mandi_order" ADD COLUMN "delivery_address_line2" text;--> statement-breakpoint
ALTER TABLE "market_mandi_order" ADD COLUMN "delivery_city" varchar(100);--> statement-breakpoint
ALTER TABLE "market_mandi_order" ADD COLUMN "delivery_state" varchar(100);--> statement-breakpoint
ALTER TABLE "market_mandi_order" ADD COLUMN "delivery_pincode" varchar(10);--> statement-breakpoint
ALTER TABLE "market_mandi_order" ADD COLUMN "delivery_lat" double precision;--> statement-breakpoint
ALTER TABLE "market_mandi_order" ADD COLUMN "delivery_lng" double precision;--> statement-breakpoint
ALTER TABLE "market_mandi_order" ADD COLUMN "cancellation_reason" text;--> statement-breakpoint
ALTER TABLE "market_mandi_order" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "market_mandi_order" ADD COLUMN "placed_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "market_mandi_order_status_history" ADD COLUMN "order_item_id" uuid;--> statement-breakpoint
ALTER TABLE "market_mandi_order_status_history" ADD COLUMN "from_status" "order_status";--> statement-breakpoint
ALTER TABLE "market_mandi_order_status_history" ADD COLUMN "to_status" "order_status" NOT NULL;--> statement-breakpoint
ALTER TABLE "market_mandi_order_status_history" ADD COLUMN "reason" text;--> statement-breakpoint
ALTER TABLE "market_mandi_order_status_history" ADD COLUMN "triggered_by" varchar(32) NOT NULL;--> statement-breakpoint
ALTER TABLE "market_subcription_charges" ADD COLUMN "gateway_order_id" varchar(255);--> statement-breakpoint
ALTER TABLE "market_subcription_charges" ADD COLUMN "gateway_payment_id" varchar(255);--> statement-breakpoint
ALTER TABLE "mandi_counter" ADD CONSTRAINT "mandi_counter_mandi_id_mandi_id_fk" FOREIGN KEY ("mandi_id") REFERENCES "public"."mandi"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandi_counter" ADD CONSTRAINT "mandi_counter_operator_id_admin_id_fk" FOREIGN KEY ("operator_id") REFERENCES "public"."admin"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_mandi_order_item" ADD CONSTRAINT "market_mandi_order_item_order_id_market_mandi_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."market_mandi_order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_mandi_order_item" ADD CONSTRAINT "market_mandi_order_item_mandi_store_id_mandi_store_id_fk" FOREIGN KEY ("mandi_store_id") REFERENCES "public"."mandi_store"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_mandi_order_item" ADD CONSTRAINT "market_mandi_order_item_veg_id_veg_id_fk" FOREIGN KEY ("veg_id") REFERENCES "public"."veg"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_mandi_payment" ADD CONSTRAINT "market_mandi_payment_order_id_market_mandi_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."market_mandi_order"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_mandi_payment" ADD CONSTRAINT "market_mandi_payment_mandi_counter_id_mandi_counter_id_fk" FOREIGN KEY ("mandi_counter_id") REFERENCES "public"."mandi_counter"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_mandi_payment" ADD CONSTRAINT "market_mandi_payment_collected_by_operator_id_admin_id_fk" FOREIGN KEY ("collected_by_operator_id") REFERENCES "public"."admin"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_mandi_payment_split" ADD CONSTRAINT "market_mandi_payment_split_payment_id_market_mandi_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."market_mandi_payment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_mandi_payment_status_history" ADD CONSTRAINT "market_mandi_payment_status_history_payment_id_market_mandi_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."market_mandi_payment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_mandi_payment_webhook_event" ADD CONSTRAINT "market_mandi_payment_webhook_event_payment_id_market_mandi_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."market_mandi_payment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_vendor_cart" ADD CONSTRAINT "market_vendor_cart_market_store_id_market_store_id_fk" FOREIGN KEY ("market_store_id") REFERENCES "public"."market_store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_vendor_cart" ADD CONSTRAINT "market_vendor_cart_mandi_store_id_mandi_store_id_fk" FOREIGN KEY ("mandi_store_id") REFERENCES "public"."mandi_store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_vendor_cart" ADD CONSTRAINT "market_vendor_cart_veg_id_veg_id_fk" FOREIGN KEY ("veg_id") REFERENCES "public"."veg"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_vendor_wallet" ADD CONSTRAINT "market_vendor_wallet_vendor_id_market_vendor_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."market_vendor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_vendor_wallet_transaction" ADD CONSTRAINT "market_vendor_wallet_transaction_wallet_id_market_vendor_wallet_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."market_vendor_wallet"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_vendor_wallet_transaction" ADD CONSTRAINT "market_vendor_wallet_transaction_vendor_id_market_vendor_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."market_vendor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "mandi_counter_code_unique" ON "mandi_counter" USING btree ("counter_code");--> statement-breakpoint
CREATE INDEX "mandi_counter_mandi_id_idx" ON "mandi_counter" USING btree ("mandi_id");--> statement-breakpoint
CREATE INDEX "mandi_counter_operator_id_idx" ON "mandi_counter" USING btree ("operator_id");--> statement-breakpoint
CREATE INDEX "mandi_counter_is_active_idx" ON "mandi_counter" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "market_mandi_order_item_order_id_idx" ON "market_mandi_order_item" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "market_mandi_order_item_mandi_store_id_idx" ON "market_mandi_order_item" USING btree ("mandi_store_id");--> statement-breakpoint
CREATE INDEX "market_mandi_order_item_veg_id_idx" ON "market_mandi_order_item" USING btree ("veg_id");--> statement-breakpoint
CREATE INDEX "market_mandi_order_item_status_idx" ON "market_mandi_order_item" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "market_mandi_payment_idempotency_key_unique" ON "market_mandi_payment" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "market_mandi_payment_order_id_idx" ON "market_mandi_payment" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "market_mandi_payment_mandi_counter_id_idx" ON "market_mandi_payment" USING btree ("mandi_counter_id");--> statement-breakpoint
CREATE INDEX "market_mandi_payment_status_idx" ON "market_mandi_payment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "market_mandi_payment_gateway_payment_id_idx" ON "market_mandi_payment" USING btree ("gateway_payment_id");--> statement-breakpoint
CREATE INDEX "market_mandi_payment_created_at_idx" ON "market_mandi_payment" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "market_mandi_payment_split_payment_id_idx" ON "market_mandi_payment_split" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "market_mandi_payment_split_vendor_id_idx" ON "market_mandi_payment_split" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "market_mandi_payment_split_settled_idx" ON "market_mandi_payment_split" USING btree ("settled");--> statement-breakpoint
CREATE INDEX "market_mandi_payment_status_history_payment_id_idx" ON "market_mandi_payment_status_history" USING btree ("payment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "market_mandi_payment_webhook_event_unique" ON "market_mandi_payment_webhook_event" USING btree ("provider","event_id");--> statement-breakpoint
CREATE INDEX "market_mandi_payment_webhook_processed_idx" ON "market_mandi_payment_webhook_event" USING btree ("processed");--> statement-breakpoint
CREATE UNIQUE INDEX "market_vendor_wallet_vendor_id_unique" ON "market_vendor_wallet" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "market_vendor_wallet_is_active_idx" ON "market_vendor_wallet" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "market_vendor_wallet_tx_wallet_id_idx" ON "market_vendor_wallet_transaction" USING btree ("wallet_id");--> statement-breakpoint
CREATE INDEX "market_vendor_wallet_tx_vendor_id_idx" ON "market_vendor_wallet_transaction" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "market_vendor_wallet_tx_type_idx" ON "market_vendor_wallet_transaction" USING btree ("type");--> statement-breakpoint
CREATE INDEX "market_vendor_wallet_tx_category_idx" ON "market_vendor_wallet_transaction" USING btree ("category");--> statement-breakpoint
CREATE INDEX "market_vendor_wallet_tx_created_at_idx" ON "market_vendor_wallet_transaction" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "market_mandi_order" ADD CONSTRAINT "market_mandi_order_mandi_counter_id_mandi_counter_id_fk" FOREIGN KEY ("mandi_counter_id") REFERENCES "public"."mandi_counter"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_mandi_order_status_history" ADD CONSTRAINT "market_mandi_order_status_history_order_item_id_market_mandi_order_item_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."market_mandi_order_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "market_mandi_order_order_code_unique" ON "market_mandi_order" USING btree ("order_code");--> statement-breakpoint
CREATE UNIQUE INDEX "market_mandi_order_idempotency_key_unique" ON "market_mandi_order" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "market_mandi_order_market_store_id_idx" ON "market_mandi_order" USING btree ("market_store_id");--> statement-breakpoint
CREATE INDEX "market_mandi_order_mandi_counter_id_idx" ON "market_mandi_order" USING btree ("mandi_counter_id");--> statement-breakpoint
CREATE INDEX "market_mandi_order_status_idx" ON "market_mandi_order" USING btree ("status");--> statement-breakpoint
CREATE INDEX "market_mandi_order_fulfillment_type_idx" ON "market_mandi_order" USING btree ("fulfillment_type");--> statement-breakpoint
CREATE INDEX "market_mandi_order_placed_at_idx" ON "market_mandi_order" USING btree ("placed_at");--> statement-breakpoint
CREATE INDEX "market_mandi_order_status_history_order_id_idx" ON "market_mandi_order_status_history" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "market_mandi_order_status_history_order_item_id_idx" ON "market_mandi_order_status_history" USING btree ("order_item_id");--> statement-breakpoint
ALTER TABLE "mandi_subcription_charges" DROP COLUMN "transaction_id";--> statement-breakpoint
ALTER TABLE "market_mandi_order" DROP COLUMN "mandi_store_id";--> statement-breakpoint
ALTER TABLE "market_mandi_order" DROP COLUMN "veg_id";--> statement-breakpoint
ALTER TABLE "market_mandi_order" DROP COLUMN "mandi_store_name";--> statement-breakpoint
ALTER TABLE "market_mandi_order" DROP COLUMN "veg_name";--> statement-breakpoint
ALTER TABLE "market_mandi_order" DROP COLUMN "quantity_in_gram";--> statement-breakpoint
ALTER TABLE "market_mandi_order" DROP COLUMN "price_per_kg_in_paise";--> statement-breakpoint
ALTER TABLE "market_mandi_order" DROP COLUMN "total_amount_in_paise";--> statement-breakpoint
ALTER TABLE "market_mandi_order_status_history" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "market_mandi_order_status_history" DROP COLUMN "changed_by_type";--> statement-breakpoint
ALTER TABLE "market_mandi_order_status_history" DROP COLUMN "note";--> statement-breakpoint
ALTER TABLE "market_subcription_charges" DROP COLUMN "transaction_id";--> statement-breakpoint
DROP TYPE "public"."market_mandi_order_status";