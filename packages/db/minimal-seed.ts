/**
 * Minimal Seed — 1 entry per table (or the minimum needed to satisfy FK constraints).
 * Run: pnpm seed:minimal
 */
import { db, testDBConnection } from "./src/db"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import {
    admin,
    city,
    veg,
    mandi,
    mandiCounter,
    mandiVendor,
    mandiStore,
    mandiPrice,
    marketVendor,
    marketVendorWallet,
    marketVendorWalletTransaction,
    marketStore,
    marketMandiOrder,
    marketMandiOrderItem,
    marketMandiPayment,
    marketMandiOrderStatusHistory,
    mandiKycDoc,
    marketKycDoc,
    mandiSubcriptionCharges,
    marketSubcriptionCharges,
    marketVendorCart,
    marketMandiPaymentSplit,
    marketMandiPaymentStatusHistory,
    marketMandiPaymentWebhookEvent,
    marketStoreAgreement,
    mandiStoreAgreement,
} from "./src/index"

async function main() {
    console.log("🚀 Starting MINIMAL database seeding...")

    const hashedPin = bcrypt.hashSync("1234", 12)

    try {
        await testDBConnection()
        console.log("📡 Connected to database successfully.")

        await db.transaction(async (tx) => {
            // ── Clean ────────────────────────────────────────────────────────────
            console.log("🧹 Cleaning old database records...")
            await tx.delete(marketVendorWalletTransaction)
            await tx.delete(marketVendorWallet)
            await tx.delete(marketVendorCart)
            await tx.delete(marketMandiPaymentWebhookEvent)
            await tx.delete(marketMandiPaymentSplit)
            await tx.delete(marketMandiPaymentStatusHistory)
            await tx.delete(marketMandiPayment)
            await tx.delete(marketMandiOrderStatusHistory)
            await tx.delete(marketMandiOrderItem)
            await tx.delete(marketMandiOrder)
            await tx.delete(mandiPrice)
            await tx.delete(marketKycDoc)
            await tx.delete(mandiKycDoc)
            await tx.delete(marketStoreAgreement)
            await tx.delete(mandiStoreAgreement)
            await tx.delete(marketSubcriptionCharges)
            await tx.delete(mandiSubcriptionCharges)
            await tx.delete(marketStore)
            await tx.delete(marketVendor)
            await tx.delete(mandiStore)
            await tx.delete(mandiVendor)
            await tx.delete(mandiCounter)
            await tx.delete(mandi)
            await tx.delete(veg)
            await tx.delete(city)
            await tx.delete(admin)
            console.log("✨ Database cleaned.")

            // ── 1. Admin ─────────────────────────────────────────────────────────
            console.log("👤 Seeding Admin...")
            const [adminRecord] = await tx
                .insert(admin)
                .values({
                    id: crypto.randomUUID(),
                    name: "Admin",
                    email: "admin@example.com",
                    phone: "+919876543210",
                    pin: hashedPin,
                    role: "super_admin",
                    isActive: true,
                })
                .returning()
            if (!adminRecord) throw new Error("Failed to create admin")
            console.log("✅ Admin seeded.")

            // ── 2. City ──────────────────────────────────────────────────────────
            console.log("🏙️ Seeding City...")
            const [cityRecord] = await tx
                .insert(city)
                .values({
                    id: crypto.randomUUID(),
                    name: "Mumbai",
                    state: "Maharashtra",
                    pincode: "400001",
                    cityImage: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f",
                    createdBy: adminRecord.id,
                })
                .returning()
            if (!cityRecord) throw new Error("Failed to create city")
            console.log("✅ City seeded.")

            // ── 3. Vegetable ─────────────────────────────────────────────────────
            console.log("🥦 Seeding Vegetable...")
            const [vegRecord] = await tx
                .insert(veg)
                .values({
                    id: crypto.randomUUID(),
                    name: "Tomato",
                    nameInHindi: "टमाटर",
                    vegPrimaryImage: "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
                    vegImageGallery: [],
                    createdBy: adminRecord.id,
                })
                .returning()
            if (!vegRecord) throw new Error("Failed to create veg")
            console.log("✅ Vegetable seeded.")

            // ── 4. Mandi ─────────────────────────────────────────────────────────
            console.log("🏟️ Seeding Mandi...")
            const [mandiRecord] = await tx
                .insert(mandi)
                .values({
                    id: crypto.randomUUID(),
                    name: "Vashi Mandi",
                    cityId: cityRecord.id,
                    createdBy: adminRecord.id,
                    lat: 19.076,
                    lng: 72.8777,
                    fullAddress: "Sector 19, Vashi, Navi Mumbai, Maharashtra",
                    mandiImage: "https://images.unsplash.com/photo-1542838132-92c53300491e",
                })
                .returning()
            if (!mandiRecord) throw new Error("Failed to create mandi")
            console.log("✅ Mandi seeded.")

            // ── 5. Mandi Counter ─────────────────────────────────────────────────
            console.log("🎰 Seeding Mandi Counter...")
            const [counterRecord] = await tx
                .insert(mandiCounter)
                .values({
                    id: crypto.randomUUID(),
                    mandiId: mandiRecord.id,
                    counterName: "Gate 1 Counter",
                    counterCode: "CNT-01",
                    operatorId: adminRecord.id,
                    lat: 19.0762,
                    lng: 72.8779,
                    isActive: true,
                })
                .returning()
            if (!counterRecord) throw new Error("Failed to create counter")
            console.log("✅ Mandi Counter seeded.")

            // ── 6. Mandi Vendor ──────────────────────────────────────────────────
            console.log("👨🌾 Seeding Mandi Vendor...")
            const [mVendor] = await tx
                .insert(mandiVendor)
                .values({
                    id: crypto.randomUUID(),
                    fullName: "Ramesh Kumar",
                    primaryPhone: "+919999999901",
                    alternatePhone: null,
                    pin: hashedPin,
                    createdBy: adminRecord.id,
                    isActive: true,
                    isApproved: true,
                })
                .returning()
            if (!mVendor) throw new Error("Failed to create mandi vendor")
            console.log("✅ Mandi Vendor seeded.")

            // ── 7. Mandi Store ───────────────────────────────────────────────────
            console.log("🏪 Seeding Mandi Store...")
            const [mStore] = await tx
                .insert(mandiStore)
                .values({
                    id: crypto.randomUUID(),
                    mandiId: mandiRecord.id,
                    vendorId: mVendor.id,
                    vegId: vegRecord.id,
                    lat: 19.0762,
                    lng: 72.8779,
                    fullAddress: "Gala No. 45, Vashi Mandi",
                    storeName: "Ramesh Tomato Wholesale",
                    storeImage: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877",
                    isActive: true,
                    isApproved: true,
                })
                .returning()
            if (!mStore) throw new Error("Failed to create mandi store")
            console.log("✅ Mandi Store seeded.")

            // ── 8. Mandi Price ───────────────────────────────────────────────────
            console.log("💰 Seeding Mandi Price...")
            await tx.insert(mandiPrice).values({
                id: crypto.randomUUID(),
                mandiStoreId: mStore.id,
                vegId: vegRecord.id,
                price: 2500,
            })
            console.log("✅ Mandi Price seeded.")

            // ── 9. Mandi KYC Doc ─────────────────────────────────────────────────
            console.log("📄 Seeding Mandi KYC Doc...")
            await tx.insert(mandiKycDoc).values({
                id: crypto.randomUUID(),
                vendorId: mVendor.id,
                storeId: mStore.id,
                type: "aadhar",
                docId: "9876-5432-1098",
                frontUrl: "https://example.com/kyc/mandi/aadhar-front.jpg",
                backUrl: "https://example.com/kyc/mandi/aadhar-back.jpg",
                storefrontUrl: "https://example.com/kyc/mandi/storefront.jpg",
                signedKycDocUrl: null,
            })
            console.log("✅ Mandi KYC Doc seeded.")

            // ── 10. Mandi Store Agreement ────────────────────────────────────────
            console.log("📝 Seeding Mandi Store Agreement...")
            await tx.insert(mandiStoreAgreement).values({
                id: crypto.randomUUID(),
                vendorId: mVendor.id,
                storeId: mStore.id,
                agreementType: "nda_and_intent",
                title: "NON-DISCLOSURE & PRE-COLLABORATION INTENT AGREEMENT",
                version: "1.0",
                termsSnapshot: "Standard Pre-Collaboration & NDA Terms accepted digitally via OTP.",
                signerName: mVendor.fullName,
                signerPhone: mVendor.primaryPhone,
                verificationMethod: "otp",
                verificationIdentifier: mVendor.primaryPhone,
                signedByAdminId: adminRecord.id,
                signedAt: new Date(),
            })
            console.log("✅ Mandi Store Agreement seeded.")

            // ── 11. Mandi Subscription Charge ────────────────────────────────────
            console.log("💳 Seeding Mandi Subscription Charge...")
            await tx.insert(mandiSubcriptionCharges).values({
                id: crypto.randomUUID(),
                vendorId: mVendor.id,
                amount: 100000,
                gatewayOrderId: "TXN-MANDI-SUB-001",
                paymentDate: new Date(),
                paymentStatus: "captured",
                paymentMethod: "upi",
                paymentCollectedBy: adminRecord.id,
            })
            console.log("✅ Mandi Subscription Charge seeded.")

            // ── 12. Market Vendor + Wallet ───────────────────────────────────────
            console.log("🤝 Seeding Market Vendor & Wallet...")
            const [mkVendor] = await tx
                .insert(marketVendor)
                .values({
                    id: crypto.randomUUID(),
                    fullName: "Suresh Patel",
                    primaryPhone: "+918888888801",
                    alternatePhone: null,
                    pin: hashedPin,
                    createdBy: adminRecord.id,
                    isActive: true,
                    isApproved: true,
                })
                .returning()
            if (!mkVendor) throw new Error("Failed to create market vendor")

            const initialBalance = 500000
            const [wallet] = await tx
                .insert(marketVendorWallet)
                .values({
                    id: crypto.randomUUID(),
                    vendorId: mkVendor.id,
                    balance: initialBalance,
                    currency: "INR",
                    isActive: true,
                })
                .returning()

            if (wallet) {
                await tx.insert(marketVendorWalletTransaction).values({
                    id: crypto.randomUUID(),
                    walletId: wallet.id,
                    vendorId: mkVendor.id,
                    amount: initialBalance,
                    type: "credit",
                    category: "topup",
                    status: "success",
                    referenceType: "gateway",
                    referenceId: `TOPUP-INIT-${mkVendor.id.slice(0, 8)}`,
                    balanceBefore: 0,
                    balanceAfter: initialBalance,
                    description: "Initial wallet top-up",
                })
            }
            console.log("✅ Market Vendor & Wallet seeded.")

            // ── 13. Market Store ─────────────────────────────────────────────────
            console.log("🛒 Seeding Market Store...")
            const [mkStore] = await tx
                .insert(marketStore)
                .values({
                    id: crypto.randomUUID(),
                    vendorId: mkVendor.id,
                    mandiId: mandiRecord.id,
                    lat: 19.082,
                    lng: 72.889,
                    storeName: "Suresh Patel Grocery",
                    storeImage: "https://images.unsplash.com/photo-1542838132-92c53300491e",
                    fullAddress: "Shop 12, Main Street, Kurla, Mumbai",
                    radiusM: 4000,
                    slot: 1,
                    isActive: true,
                    isApproved: true,
                })
                .returning()
            if (!mkStore) throw new Error("Failed to create market store")
            console.log("✅ Market Store seeded.")

            // ── 14. Market Vendor Cart ───────────────────────────────────────────
            console.log("🛒 Seeding Market Vendor Cart...")
            await tx.insert(marketVendorCart).values({
                id: crypto.randomUUID(),
                marketStoreId: mkStore.id,
                mandiStoreId: mStore.id,
                vegId: vegRecord.id,
                quantityInGram: 100000,
            })
            console.log("✅ Market Vendor Cart seeded.")

            // ── 15. Market KYC Doc ───────────────────────────────────────────────
            console.log("📄 Seeding Market KYC Doc...")
            await tx.insert(marketKycDoc).values({
                id: crypto.randomUUID(),
                vendorId: mkVendor.id,
                storeId: mkStore.id,
                type: "aadhar",
                docId: "5678-1234-9012",
                frontUrl: "https://example.com/kyc/market/aadhar-front.jpg",
                backUrl: "https://example.com/kyc/market/aadhar-back.jpg",
                storefrontUrl: "https://example.com/kyc/market/storefront.jpg",
                signedKycDocUrl: null,
            })
            console.log("✅ Market KYC Doc seeded.")

            // ── 16. Market Store Agreement ───────────────────────────────────────
            console.log("📝 Seeding Market Store Agreement...")
            await tx.insert(marketStoreAgreement).values({
                id: crypto.randomUUID(),
                vendorId: mkVendor.id,
                storeId: mkStore.id,
                agreementType: "nda_and_intent",
                title: "NON-DISCLOSURE & PRE-COLLABORATION INTENT AGREEMENT",
                version: "1.0",
                termsSnapshot: "Standard Pre-Collaboration & NDA Terms accepted digitally via OTP.",
                signerName: mkVendor.fullName,
                signerPhone: mkVendor.primaryPhone,
                verificationMethod: "otp",
                verificationIdentifier: mkVendor.primaryPhone,
                signedByAdminId: adminRecord.id,
                signedAt: new Date(),
            })
            console.log("✅ Market Store Agreement seeded.")

            // ── 17. Market Subscription Charge ───────────────────────────────────
            console.log("💳 Seeding Market Subscription Charge...")
            await tx.insert(marketSubcriptionCharges).values({
                id: crypto.randomUUID(),
                vendorId: mkVendor.id,
                amount: 150000,
                gatewayOrderId: "TXN-MARKET-SUB-001",
                paymentDate: new Date(),
                paymentStatus: "captured",
                paymentMethod: "upi",
                paymentCollectedBy: adminRecord.id,
            })
            console.log("✅ Market Subscription Charge seeded.")

            // ── 18. Market Mandi Order (1 order → 1 item → 1 payment → 1 history → 1 split → 1 webhook) ──
            console.log("📦 Seeding Market Mandi Order...")
            const now = new Date()
            const totalAmount = 144000 // 60kg × ₹24/kg in paise

            const [order] = await tx
                .insert(marketMandiOrder)
                .values({
                    id: crypto.randomUUID(),
                    marketStoreId: mkStore.id,
                    orderCode: "ORD-00001",
                    marketStoreName: mkStore.storeName!,
                    idempotencyKey: "IDEM-ORD-00001",
                    status: "confirmed",
                    fulfillmentType: "delivery",
                    mandiCounterId: counterRecord.id,
                    pickupCode: "PKP-0001",
                    subtotal: totalAmount,
                    totalAmount: totalAmount,
                    placedAt: now,
                    confirmedAt: now,
                    createdAt: now,
                })
                .returning()
            if (!order) throw new Error("Failed to create order")

            const [orderItem] = await tx
                .insert(marketMandiOrderItem)
                .values({
                    id: crypto.randomUUID(),
                    orderId: order.id,
                    mandiStoreId: mStore.id,
                    vegId: vegRecord.id,
                    vegNameSnapshot: "Tomato",
                    mandiStoreNameSnapshot: mStore.storeName!,
                    quantityInGram: 60000,
                    pricePerKg: 2400,
                    totalAmount: totalAmount,
                    status: "accepted",
                    createdAt: now,
                })
                .returning()

            await tx.insert(marketMandiOrderStatusHistory).values({
                id: crypto.randomUUID(),
                orderId: order.id,
                orderItemId: orderItem?.id,
                toStatus: "confirmed",
                triggeredBy: "system",
                reason: "Initial seed",
                createdAt: now,
            })

            const [payment] = await tx
                .insert(marketMandiPayment)
                .values({
                    id: crypto.randomUUID(),
                    orderId: order.id,
                    idempotencyKey: "SEED-ORD-00001",
                    provider: "razorpay" as const,
                    method: "upi" as const,
                    amount: totalAmount,
                    status: "captured" as const,
                    gatewayPaymentId: "TXN00001",
                    paidAt: now,
                    createdAt: now,
                })
                .returning()

            if (payment) {
                await tx.insert(marketMandiPaymentSplit).values({
                    id: crypto.randomUUID(),
                    paymentId: payment.id,
                    splitType: "vendor_payout",
                    vendorId: mVendor.id,
                    amount: totalAmount - 500,
                })

                await tx.insert(marketMandiPaymentStatusHistory).values({
                    id: crypto.randomUUID(),
                    paymentId: payment.id,
                    toStatus: payment.status,
                    triggeredBy: "system",
                    createdAt: now,
                })

                await tx.insert(marketMandiPaymentWebhookEvent).values({
                    id: crypto.randomUUID(),
                    provider: "razorpay",
                    eventId: "EVT-ORD-00001",
                    eventType: "payment.captured",
                    paymentId: payment.id,
                    rawPayload: { status: "captured" },
                    receivedAt: now,
                })
            }
            console.log("✅ Market Mandi Order seeded.")
        })

        console.log("\n📊 Minimal Seeding Summary:")
        console.table([
            { Entity: "Admin", Count: 1 },
            { Entity: "City", Count: 1 },
            { Entity: "Vegetable", Count: 1 },
            { Entity: "Mandi", Count: 1 },
            { Entity: "Mandi Counter", Count: 1 },
            { Entity: "Mandi Vendor", Count: 1 },
            { Entity: "Mandi Store", Count: 1 },
            { Entity: "Mandi Price", Count: 1 },
            { Entity: "Mandi KYC Doc", Count: 1 },
            { Entity: "Mandi Store Agreement", Count: 1 },
            { Entity: "Mandi Subscription Charge", Count: 1 },
            { Entity: "Market Vendor + Wallet + Txn", Count: 1 },
            { Entity: "Market Store", Count: 1 },
            { Entity: "Market Vendor Cart", Count: 1 },
            { Entity: "Market KYC Doc", Count: 1 },
            { Entity: "Market Store Agreement", Count: 1 },
            { Entity: "Market Subscription Charge", Count: 1 },
            { Entity: "Market Mandi Order", Count: 1 },
            { Entity: "Order Item", Count: 1 },
            { Entity: "Order Status History", Count: 1 },
            { Entity: "Payment", Count: 1 },
            { Entity: "Payment Split", Count: 1 },
            { Entity: "Payment Status History", Count: 1 },
            { Entity: "Payment Webhook Event", Count: 1 },
        ])

        console.log("\n🎉 Minimal database seeding completed!")
    } catch (error) {
        console.error("❌ Error seeding database:", error)
        process.exit(1)
    }
}

main().then(() => process.exit(0))
