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
    console.log("🚀 Starting database seeding...")

    const hashPin = (pin: string) => bcrypt.hashSync(pin, 12)
    const hashedPin = hashPin("1234")

    try {
        // 1. Verify DB Connection
        await testDBConnection()
        console.log("📡 Connected to database successfully.")

        // 2. Perform Seeding inside a Single Transaction for Atomicity
        await db.transaction(async (tx) => {
            // 2.1. Clean existing records in reverse dependency order
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

            // 2.2. Insert Super Admin & Operator
            console.log("👤 Seeding Admins...")
            const [superAdminRecord] = await tx
                .insert(admin)
                .values({
                    id: crypto.randomUUID(),
                    name: "Super Admin",
                    email: "admin@example.com",
                    phone: "+919876543210",
                    pin: hashedPin,
                    role: "super_admin",
                    isActive: true,
                })
                .returning()

            const [operatorRecord] = await tx
                .insert(admin)
                .values({
                    id: crypto.randomUUID(),
                    name: "Operator User",
                    email: "operator@example.com",
                    phone: "+919876543219",
                    pin: hashPin("1111"),
                    role: "operator",
                    isActive: true,
                })
                .returning()

            if (!superAdminRecord || !operatorRecord) {
                throw new Error("Failed to create admins.")
            }
            console.log("✅ Admins seeded.")

            // 2.3. Insert Cities
            console.log("🏙️ Seeding Cities...")
            const [mumbaiCity] = await tx
                .insert(city)
                .values({
                    id: crypto.randomUUID(),
                    name: "Mumbai",
                    state: "Maharashtra",
                    pincode: "400001",
                    cityImage: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f",
                    createdBy: superAdminRecord.id,
                })
                .returning()

            const [delhiCity] = await tx
                .insert(city)
                .values({
                    id: crypto.randomUUID(),
                    name: "Delhi",
                    state: "Delhi",
                    pincode: "110001",
                    cityImage: "https://images.unsplash.com/photo-1587474260584-136574528ed5",
                    createdBy: superAdminRecord.id,
                })
                .returning()

            if (!mumbaiCity || !delhiCity) {
                throw new Error("Failed to create cities.")
            }
            console.log("✅ Cities seeded.")

            // 2.4. Insert Vegetables
            console.log("🥦 Seeding Vegetables...")
            const vegetablesList = [
                {
                    id: crypto.randomUUID(),
                    name: "Tomato",
                    nameInHindi: "टमाटर",
                    vegPrimaryImage: "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
                    vegImageGallery: [
                        "https://images.unsplash.com/photo-1595855759920-86582396756a",
                        "https://images.unsplash.com/photo-1592924357228-91a4daadcfea",
                    ],
                    createdBy: superAdminRecord.id,
                },
                {
                    id: crypto.randomUUID(),
                    name: "Potato",
                    nameInHindi: "आलू",
                    vegPrimaryImage: "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
                    vegImageGallery: [
                        "https://images.unsplash.com/photo-1590165482129-1b8b27698780",
                    ],
                    createdBy: superAdminRecord.id,
                },
                {
                    id: crypto.randomUUID(),
                    name: "Onion",
                    nameInHindi: "प्याज़",
                    vegPrimaryImage: "https://images.unsplash.com/photo-1508747703725-719ae25db29f",
                    vegImageGallery: [],
                    createdBy: superAdminRecord.id,
                },
                {
                    id: crypto.randomUUID(),
                    name: "Spinach",
                    nameInHindi: "पालक",
                    vegPrimaryImage: "https://images.unsplash.com/photo-1576045057995-568f588f82fb",
                    vegImageGallery: [],
                    createdBy: superAdminRecord.id,
                },
                {
                    id: crypto.randomUUID(),
                    name: "Carrot",
                    nameInHindi: "गाजर",
                    vegPrimaryImage: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37",
                    vegImageGallery: [],
                    createdBy: superAdminRecord.id,
                },
            ]

            const seededVegetables = []
            for (const item of vegetablesList) {
                const [seededVeg] = await tx.insert(veg).values(item).returning()
                if (seededVeg) seededVegetables.push(seededVeg)
            }
            console.log(`✅ ${seededVegetables.length} Vegetables seeded.`)

            // 2.5. Insert Mandis
            console.log("🏟️ Seeding Mandis...")
            const [vashiMandi] = await tx
                .insert(mandi)
                .values({
                    id: crypto.randomUUID(),
                    name: "Vashi Mandi",
                    cityId: mumbaiCity.id,
                    createdBy: superAdminRecord.id,
                    lat: 19.076,
                    lng: 72.8777,
                    fullAddress: "Sector 19, Vashi, Navi Mumbai, Maharashtra",
                    mandiImage: "https://images.unsplash.com/photo-1542838132-92c53300491e",
                })
                .returning()

            const [azadpurMandi] = await tx
                .insert(mandi)
                .values({
                    id: crypto.randomUUID(),
                    name: "Azadpur Mandi",
                    cityId: delhiCity.id,
                    createdBy: superAdminRecord.id,
                    lat: 28.6139,
                    lng: 77.209,
                    fullAddress: "Azadpur, New Delhi, Delhi",
                    mandiImage: "https://images.unsplash.com/photo-1542838132-92c53300491e",
                })
                .returning()

            if (!vashiMandi || !azadpurMandi) {
                throw new Error("Failed to create mandis.")
            }
            console.log("✅ Mandis seeded.")

            // 2.5b. Insert Mandi ROS Counters
            console.log("🎰 Seeding Mandi ROS Counters...")
            const [vashiCounter] = await tx
                .insert(mandiCounter)
                .values({
                    id: crypto.randomUUID(),
                    mandiId: vashiMandi.id,
                    counterName: "Vashi Gate 1 ROS Counter",
                    counterCode: "CNT-VASHI-01",
                    operatorId: operatorRecord.id,
                    lat: 19.0762,
                    lng: 72.8779,
                    isActive: true,
                })
                .returning()

            const [azadpurCounter] = await tx
                .insert(mandiCounter)
                .values({
                    id: crypto.randomUUID(),
                    mandiId: azadpurMandi.id,
                    counterName: "Azadpur Gate 2 ROS Counter",
                    counterCode: "CNT-AZADPUR-01",
                    operatorId: operatorRecord.id,
                    lat: 28.6139,
                    lng: 77.209,
                    isActive: true,
                })
                .returning()

            if (!vashiCounter || !azadpurCounter) {
                throw new Error("Failed to create mandi counters.")
            }
            console.log("✅ Mandi ROS Counters seeded.")

            // 2.6. Insert Mandi Vendors
            console.log("👨🌾 Seeding Mandi Vendors...")

            const [mandiVendor1] = await tx
                .insert(mandiVendor)
                .values({
                    id: crypto.randomUUID(),
                    fullName: "Ramesh Kumar",
                    primaryPhone: "+919999999901",
                    alternatePhone: "+919999999911",
                    pin: hashedPin,
                    createdBy: superAdminRecord.id,
                    isActive: true,
                    isApproved: true,
                })
                .returning()

            const [mandiVendor2] = await tx
                .insert(mandiVendor)
                .values({
                    id: crypto.randomUUID(),
                    fullName: "Amit Sharma",
                    primaryPhone: "+919999999902",
                    alternatePhone: null,
                    pin: hashedPin,
                    createdBy: superAdminRecord.id,
                    isActive: true,
                    isApproved: true,
                })
                .returning()

            if (!mandiVendor1 || !mandiVendor2) {
                throw new Error("Failed to create mandi vendors.")
            }
            console.log("✅ Mandi Vendors seeded.")

            // 2.7. Insert Mandi Stores (Linking Mandis, Mandi Vendors, and Vegetables)
            console.log("🏪 Seeding Mandi Stores...")
            const [tomatoMandiStore] = await tx
                .insert(mandiStore)
                .values({
                    id: crypto.randomUUID(),
                    mandiId: vashiMandi.id,
                    vendorId: mandiVendor1.id,
                    vegId: seededVegetables[0]!.id, // Tomato
                    lat: 19.0762,
                    lng: 72.8779,
                    fullAddress: "Gala No. 45, Vashi Mandi, Navi Mumbai",
                    storeName: "Ramesh Tomato Wholesale",
                    storeImage: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877",
                    isActive: true,
                    isApproved: true,
                })
                .returning()

            const [potatoMandiStore] = await tx
                .insert(mandiStore)
                .values({
                    id: crypto.randomUUID(),
                    mandiId: azadpurMandi.id,
                    vendorId: mandiVendor2.id,
                    vegId: seededVegetables[1]!.id, // Potato
                    lat: 28.6141,
                    lng: 77.2092,
                    fullAddress: "Shop 102, Azadpur Mandi, Delhi",
                    storeName: "Amit Potato Merchant",
                    storeImage: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877",
                    isActive: true,
                    isApproved: true,
                })
                .returning()

            if (!tomatoMandiStore || !potatoMandiStore) {
                throw new Error("Failed to create mandi stores.")
            }
            console.log("✅ Mandi Stores seeded.")

            // 2.8. Insert Mandi Prices
            console.log("💰 Seeding Mandi Prices...")
            await tx.insert(mandiPrice).values({
                id: crypto.randomUUID(),
                mandiStoreId: tomatoMandiStore.id,
                vegId: seededVegetables[0]!.id, // Tomato
                price: 2500, // 25.00 Rs/kg in paise
            })

            await tx.insert(mandiPrice).values({
                id: crypto.randomUUID(),
                mandiStoreId: potatoMandiStore.id,
                vegId: seededVegetables[1]!.id, // Potato
                price: 1800, // 18.00 Rs/kg in paise
            })
            console.log("✅ Mandi Prices seeded.")

            // 2.9. Insert Mandi KYC Documents
            console.log("📄 Seeding Mandi KYC Documents...")
            await tx.insert(mandiKycDoc).values({
                id: crypto.randomUUID(),
                vendorId: mandiVendor1.id,
                storeId: tomatoMandiStore.id,
                type: "aadhar",
                docId: "9876-5432-1098",
                frontUrl: "https://example.com/kyc/mandi/ramesh-aadhar-front.jpg",
                backUrl: "https://example.com/kyc/mandi/ramesh-aadhar-back.jpg",
                storefrontUrl: "https://example.com/kyc/mandi/ramesh-storefront.jpg",
                signedKycDocUrl: null,
            })

            await tx.insert(mandiKycDoc).values({
                id: crypto.randomUUID(),
                vendorId: mandiVendor1.id,
                storeId: tomatoMandiStore.id,
                type: "pan",
                docId: "ABCDE1234F",
                frontUrl: "https://example.com/kyc/mandi/ramesh-pan-front.jpg",
                backUrl: null,
                storefrontUrl: null,
                signedKycDocUrl: null,
            })

            await tx.insert(mandiKycDoc).values({
                id: crypto.randomUUID(),
                vendorId: mandiVendor2.id,
                storeId: potatoMandiStore.id,
                type: "aadhar",
                docId: "1234-5678-9012",
                frontUrl: "https://example.com/kyc/mandi/amit-aadhar-front.jpg",
                backUrl: "https://example.com/kyc/mandi/amit-aadhar-back.jpg",
                storefrontUrl: "https://example.com/kyc/mandi/amit-storefront.jpg",
                signedKycDocUrl: "https://example.com/kyc/mandi/amit-signed-kyc.pdf",
            })
            console.log("✅ Mandi KYC Documents seeded.")

            // 2.9b. Insert Mandi Store Agreements
            console.log("📝 Seeding Mandi Store Agreements...")
            await tx.insert(mandiStoreAgreement).values({
                id: crypto.randomUUID(),
                vendorId: mandiVendor1.id,
                storeId: tomatoMandiStore.id,
                agreementType: "nda_and_intent",
                title: "NON-DISCLOSURE & PRE-COLLABORATION INTENT AGREEMENT",
                version: "1.0",
                termsSnapshot: "Standard Pre-Collaboration & NDA Terms accepted digitally via OTP.",
                signerName: mandiVendor1.fullName,
                signerPhone: mandiVendor1.primaryPhone,
                verificationMethod: "otp",
                verificationIdentifier: mandiVendor1.primaryPhone,
                signedByAdminId: superAdminRecord.id,
                signedAt: new Date(),
            })

            await tx.insert(mandiStoreAgreement).values({
                id: crypto.randomUUID(),
                vendorId: mandiVendor2.id,
                storeId: potatoMandiStore.id,
                agreementType: "nda_and_intent",
                title: "NON-DISCLOSURE & PRE-COLLABORATION INTENT AGREEMENT",
                version: "1.0",
                termsSnapshot: "Standard Pre-Collaboration & NDA Terms accepted digitally via OTP.",
                signerName: mandiVendor2.fullName,
                signerPhone: mandiVendor2.primaryPhone,
                verificationMethod: "otp",
                verificationIdentifier: mandiVendor2.primaryPhone,
                signedByAdminId: superAdminRecord.id,
                signedAt: new Date(),
            })
            console.log("✅ Mandi Store Agreements seeded.")

            // 2.10. Insert Market Vendors & Wallets
            console.log("🤝 Seeding Market Vendors & Wallets...")
            const marketVendorConfigs = [
                {
                    fullName: "Suresh Patel",
                    primaryPhone: "+918888888801",
                    alternatePhone: "+918800000001",
                    slot: 15,
                },
                {
                    fullName: "Rajesh Verma",
                    primaryPhone: "+918888888802",
                    alternatePhone: null,
                    slot: 4,
                },
                {
                    fullName: "Sharma Vendor",
                    primaryPhone: "+918888888803",
                    alternatePhone: "+918800000003",
                    slot: 22,
                },
                {
                    fullName: "Aarya Vendor",
                    primaryPhone: "+918888888804",
                    alternatePhone: null,
                    slot: 6,
                },
                {
                    fullName: "Bhati Vendor",
                    primaryPhone: "+918888888805",
                    alternatePhone: null,
                    slot: 3,
                },
                {
                    fullName: "Bhawani Vendor",
                    primaryPhone: "+918888888806",
                    alternatePhone: null,
                    slot: 22,
                },
                {
                    fullName: "Sid Vendor",
                    primaryPhone: "+918888888807",
                    alternatePhone: null,
                    slot: 15,
                },
                {
                    fullName: "Rehman Vendor",
                    primaryPhone: "+918888888808",
                    alternatePhone: null,
                    slot: 1,
                },
                {
                    fullName: "Hamza Vendor",
                    primaryPhone: "+918888888809",
                    alternatePhone: null,
                    slot: 22,
                },
                {
                    fullName: "Maanvi Vendor",
                    primaryPhone: "+918888888810",
                    alternatePhone: null,
                    slot: 3,
                },
                {
                    fullName: "Mishra Vendor",
                    primaryPhone: "+918888888812",
                    alternatePhone: null,
                    slot: 4,
                },
                {
                    fullName: "Noor Vendor",
                    primaryPhone: "+918888888813",
                    alternatePhone: null,
                    slot: 15,
                },
            ]

            const seededMarketVendors = []
            for (const cfg of marketVendorConfigs) {
                const [v] = await tx
                    .insert(marketVendor)
                    .values({
                        id: crypto.randomUUID(),
                        fullName: cfg.fullName,
                        primaryPhone: cfg.primaryPhone,
                        alternatePhone: cfg.alternatePhone,
                        pin: hashedPin,
                        createdBy: superAdminRecord.id,
                        isActive: true,
                        isApproved: true,
                    })
                    .returning()

                if (!v) throw new Error(`Failed to create market vendor ${cfg.fullName}`)
                seededMarketVendors.push({ ...v, slot: cfg.slot })

                // Seed wallet & initial top-up transaction
                const initialBalance = 500000 // ₹5,000 in paise
                const [w] = await tx
                    .insert(marketVendorWallet)
                    .values({
                        id: crypto.randomUUID(),
                        vendorId: v.id,
                        balance: initialBalance,
                        currency: "INR",
                        isActive: true,
                    })
                    .returning()

                if (w) {
                    await tx.insert(marketVendorWalletTransaction).values({
                        id: crypto.randomUUID(),
                        walletId: w.id,
                        vendorId: v.id,
                        amount: initialBalance,
                        type: "credit",
                        category: "topup",
                        status: "success",
                        referenceType: "gateway",
                        referenceId: `TOPUP-INIT-${v.id.slice(0, 8)}`,
                        balanceBefore: 0,
                        balanceAfter: initialBalance,
                        description: "Initial wallet top-up",
                    })
                }
            }
            console.log("✅ Market Vendors & Wallets seeded.")

            // 2.11. Insert Market Stores
            console.log("🛒 Seeding Market Stores...")
            const marketStoreConfigs = [
                {
                    storeName: "Suresh Patel Grocery",
                    address: "Shop 12, Main Street, Kurla, Mumbai",
                    mandi: vashiMandi,
                    city: mumbaiCity,
                    lat: 19.082,
                    lng: 72.889,
                    radiusM: 4000,
                },
                {
                    storeName: "Rajesh Supermarket",
                    address: "Shop 4, Market Complex, Connaught Place, New Delhi",
                    mandi: azadpurMandi,
                    city: delhiCity,
                    lat: 28.625,
                    lng: 77.22,
                    radiusM: 5000,
                },
                {
                    storeName: "Sharma Vegetables",
                    address: "Shop 14, Main Road, Vashi, Navi Mumbai",
                    mandi: vashiMandi,
                    city: mumbaiCity,
                    lat: 19.083,
                    lng: 72.89,
                    radiusM: 3000,
                },
                {
                    storeName: "Aarya Vegetables",
                    address: "Shop 15, Sector 17, Vashi, Navi Mumbai",
                    mandi: vashiMandi,
                    city: mumbaiCity,
                    lat: 19.084,
                    lng: 72.891,
                    radiusM: 3000,
                },
                {
                    storeName: "Bhati Vegetables",
                    address: "Gala No 5, Market Yard, Vashi, Navi Mumbai",
                    mandi: vashiMandi,
                    city: mumbaiCity,
                    lat: 19.085,
                    lng: 72.892,
                    radiusM: 3000,
                },
                {
                    storeName: "Bhawani Vegetables",
                    address: "Shop 21, APMC Market, Vashi, Navi Mumbai",
                    mandi: vashiMandi,
                    city: mumbaiCity,
                    lat: 19.086,
                    lng: 72.893,
                    radiusM: 3000,
                },
                {
                    storeName: "Sid Vegetables",
                    address: "Shop 22, APMC Market, Vashi, Navi Mumbai",
                    mandi: vashiMandi,
                    city: mumbaiCity,
                    lat: 19.087,
                    lng: 72.894,
                    radiusM: 3000,
                },
                {
                    storeName: "Rehman Vegetables",
                    address: "Gala No 12, APMC Sector 19, Vashi, Navi Mumbai",
                    mandi: vashiMandi,
                    city: mumbaiCity,
                    lat: 19.088,
                    lng: 72.895,
                    radiusM: 3000,
                },
                {
                    storeName: "Hamza Vegetables",
                    address: "Shop 8, APMC Gate 2, Vashi, Navi Mumbai",
                    mandi: vashiMandi,
                    city: mumbaiCity,
                    lat: 19.089,
                    lng: 72.896,
                    radiusM: 3000,
                },
                {
                    storeName: "Maanvi Vegetables",
                    address: "Shop 9, APMC Gate 2, Vashi, Navi Mumbai",
                    mandi: vashiMandi,
                    city: mumbaiCity,
                    lat: 19.09,
                    lng: 72.897,
                    radiusM: 3000,
                },
                {
                    storeName: "Mishra Vegetables",
                    address: "Shop 10, APMC Gate 2, Vashi, Navi Mumbai",
                    mandi: vashiMandi,
                    city: mumbaiCity,
                    lat: 19.091,
                    lng: 72.898,
                    radiusM: 3000,
                },
                {
                    storeName: "Noor Vegetables",
                    address: "Shop 11, APMC Gate 2, Vashi, Navi Mumbai",
                    mandi: vashiMandi,
                    city: mumbaiCity,
                    lat: 19.092,
                    lng: 72.899,
                    radiusM: 3000,
                },
            ]

            const seededMarketStores = []
            for (let i = 0; i < seededMarketVendors.length; i++) {
                const vendor = seededMarketVendors[i]!
                const cfg = marketStoreConfigs[i]!

                const [s] = await tx
                    .insert(marketStore)
                    .values({
                        id: crypto.randomUUID(),
                        vendorId: vendor.id,
                        mandiId: cfg.mandi.id,
                        lat: cfg.lat,
                        lng: cfg.lng,
                        storeName: cfg.storeName,
                        storeImage: "https://images.unsplash.com/photo-1542838132-92c53300491e",
                        fullAddress: cfg.address,
                        radiusM: cfg.radiusM,
                        slot: vendor.slot,
                        isActive: true,
                        isApproved: true,
                    })
                    .returning()

                if (s) seededMarketStores.push(s)
            }
            console.log("✅ Market Stores seeded.")

            // 2.11b. Insert Market Vendor Carts
            console.log("🛒 Seeding Market Vendor Carts...")
            if (seededMarketStores[0] && tomatoMandiStore && potatoMandiStore) {
                await tx.insert(marketVendorCart).values([
                    {
                        id: crypto.randomUUID(),
                        marketStoreId: seededMarketStores[0].id,
                        mandiStoreId: tomatoMandiStore.id,
                        vegId: seededVegetables[0]!.id,
                        quantityInGram: 100000, // 100kg
                    },
                    {
                        id: crypto.randomUUID(),
                        marketStoreId: seededMarketStores[0].id,
                        mandiStoreId: potatoMandiStore.id,
                        vegId: seededVegetables[1]!.id,
                        quantityInGram: 50000, // 50kg
                    },
                ])
            }
            console.log("✅ Market Vendor Carts seeded.")

            // 2.12. Insert Market KYC Documents
            console.log("📄 Seeding Market KYC Documents...")
            if (seededMarketVendors[0] && seededMarketStores[0]) {
                await tx.insert(marketKycDoc).values({
                    id: crypto.randomUUID(),
                    vendorId: seededMarketVendors[0].id,
                    storeId: seededMarketStores[0].id,
                    type: "aadhar",
                    docId: "5678-1234-9012",
                    frontUrl: "https://example.com/kyc/market/suresh-aadhar-front.jpg",
                    backUrl: "https://example.com/kyc/market/suresh-aadhar-back.jpg",
                    storefrontUrl: "https://example.com/kyc/market/suresh-storefront.jpg",
                    signedKycDocUrl: "https://example.com/kyc/market/suresh-signed-kyc.pdf",
                })

                await tx.insert(marketKycDoc).values({
                    id: crypto.randomUUID(),
                    vendorId: seededMarketVendors[0].id,
                    storeId: seededMarketStores[0].id,
                    type: "pan",
                    docId: "FGHIJ5678K",
                    frontUrl: "https://example.com/kyc/market/suresh-pan-front.jpg",
                    backUrl: null,
                    storefrontUrl: null,
                    signedKycDocUrl: null,
                })
            }

            if (seededMarketVendors[1] && seededMarketStores[1]) {
                await tx.insert(marketKycDoc).values({
                    id: crypto.randomUUID(),
                    vendorId: seededMarketVendors[1].id,
                    storeId: seededMarketStores[1].id,
                    type: "aadhar",
                    docId: "3456-7890-1234",
                    frontUrl: "https://example.com/kyc/market/rajesh-aadhar-front.jpg",
                    backUrl: "https://example.com/kyc/market/rajesh-aadhar-back.jpg",
                    storefrontUrl: "https://example.com/kyc/market/rajesh-storefront.jpg",
                    signedKycDocUrl: null,
                })
            }
            console.log("✅ Market KYC Documents seeded.")

            // 2.12b. Insert Market Store Agreements
            console.log("📝 Seeding Market Store Agreements...")
            for (let i = 0; i < seededMarketStores.length; i++) {
                const s = seededMarketStores[i]!
                const v = seededMarketVendors[i]!
                await tx.insert(marketStoreAgreement).values({
                    id: crypto.randomUUID(),
                    vendorId: v.id,
                    storeId: s.id,
                    agreementType: "nda_and_intent",
                    title: "NON-DISCLOSURE & PRE-COLLABORATION INTENT AGREEMENT",
                    version: "1.0",
                    termsSnapshot:
                        "Standard Pre-Collaboration & NDA Terms accepted digitally via OTP.",
                    signerName: v.fullName,
                    signerPhone: v.primaryPhone,
                    verificationMethod: "otp",
                    verificationIdentifier: v.primaryPhone,
                    signedByAdminId: superAdminRecord.id,
                    signedAt: new Date(),
                })
            }
            console.log("✅ Market Store Agreements seeded.")

            // 2.13. Insert Mandi Subscription Charges
            console.log("💳 Seeding Mandi Subscription Charges...")
            const mandiSubDate1 = new Date()
            mandiSubDate1.setDate(mandiSubDate1.getDate() - 30) // 30 days ago

            const mandiSubDate2 = new Date()
            mandiSubDate2.setDate(mandiSubDate2.getDate() - 15) // 15 days ago

            await tx.insert(mandiSubcriptionCharges).values({
                id: crypto.randomUUID(),
                vendorId: mandiVendor1.id,
                amount: 100000, // Rs 1000 in paise
                gatewayOrderId: "TXN-MANDI-SUB-001",
                paymentDate: mandiSubDate1,
                paymentStatus: "captured",
                paymentMethod: "upi",
                paymentCollectedBy: superAdminRecord.id,
            })

            await tx.insert(mandiSubcriptionCharges).values({
                id: crypto.randomUUID(),
                vendorId: mandiVendor2.id,
                amount: 100000, // Rs 1000 in paise
                gatewayOrderId: "TXN-MANDI-SUB-002",
                paymentDate: mandiSubDate2,
                paymentStatus: "captured",
                paymentMethod: "cash",
                paymentCollectedBy: superAdminRecord.id,
            })

            await tx.insert(mandiSubcriptionCharges).values({
                id: crypto.randomUUID(),
                vendorId: mandiVendor1.id,
                amount: 100000, // Rs 1000 in paise — renewal
                gatewayOrderId: null,
                paymentDate: new Date(),
                paymentStatus: "pending",
                paymentMethod: "upi",
                paymentCollectedBy: superAdminRecord.id,
            })
            console.log("✅ Mandi Subscription Charges seeded.")

            // 2.14. Insert Market Subscription Charges
            console.log("💳 Seeding Market Subscription Charges...")
            const marketSubDate1 = new Date()
            marketSubDate1.setDate(marketSubDate1.getDate() - 25) // 25 days ago

            const marketSubDate2 = new Date()
            marketSubDate2.setDate(marketSubDate2.getDate() - 10) // 10 days ago

            if (seededMarketVendors[0]) {
                await tx.insert(marketSubcriptionCharges).values({
                    id: crypto.randomUUID(),
                    vendorId: seededMarketVendors[0].id,
                    amount: 150000, // Rs 1500 in paise
                    gatewayOrderId: "TXN-MARKET-SUB-001",
                    paymentDate: marketSubDate1,
                    paymentStatus: "captured",
                    paymentMethod: "upi",
                    paymentCollectedBy: operatorRecord.id,
                })
            }

            if (seededMarketVendors[1]) {
                await tx.insert(marketSubcriptionCharges).values({
                    id: crypto.randomUUID(),
                    vendorId: seededMarketVendors[1].id,
                    amount: 150000, // Rs 1500 in paise
                    gatewayOrderId: "TXN-MARKET-SUB-002",
                    paymentDate: marketSubDate2,
                    paymentStatus: "captured",
                    paymentMethod: "cash",
                    paymentCollectedBy: operatorRecord.id,
                })
            }

            if (seededMarketVendors[2]) {
                await tx.insert(marketSubcriptionCharges).values({
                    id: crypto.randomUUID(),
                    vendorId: seededMarketVendors[2].id,
                    amount: 150000, // Rs 1500 in paise
                    gatewayOrderId: null,
                    paymentDate: new Date(),
                    paymentStatus: "pending",
                    paymentMethod: "upi",
                    paymentCollectedBy: operatorRecord.id,
                })
            }

            if (seededMarketVendors[4]) {
                await tx.insert(marketSubcriptionCharges).values({
                    id: crypto.randomUUID(),
                    vendorId: seededMarketVendors[4].id,
                    amount: 150000, // Rs 1500 in paise
                    gatewayOrderId: "TXN-MARKET-SUB-004",
                    paymentDate: marketSubDate1,
                    paymentStatus: "failed",
                    paymentMethod: "net_banking",
                    paymentCollectedBy: operatorRecord.id,
                })
            }
            console.log("✅ Market Subscription Charges seeded.")

            // 2.15. Insert Market Mandi Orders (Associated with Dispatch Slots)
            console.log("📦 Seeding Market Mandi Orders...")
            const today = new Date()
            const makeDate = (hour: number, minute: number) => {
                const d = new Date(today)
                d.setHours(hour, minute, 0, 0)
                return d
            }

            const ordersToSeed = seededMarketStores.map((store, index) => {
                const hour = 4 + (index % 5)
                const minute = (index * 5) % 60
                const statusOptions: Array<
                    | "pending"
                    | "confirmed"
                    | "out_for_delivery"
                    | "delivered"
                    | "cancelled"
                    | "rejected"
                > = ["confirmed", "cancelled", "out_for_delivery", "delivered", "pending"]
                return {
                    orderCode: `ORD-${40260 + index}`,
                    marketStoreId: store.id,
                    marketStoreName: store.storeName,
                    quantityInGram: 60000 + index * 10000,
                    status: statusOptions[index % statusOptions.length]!,
                    createdAt: makeDate(hour, minute),
                }
            })

            let seededOrdersCount = 0
            let seededHistoryCount = 0
            let seededPaymentsCount = 0

            for (const o of ordersToSeed) {
                const pricePerKg = 2400
                const totalAmount = (o.quantityInGram / 1000) * pricePerKg

                let headerStatus:
                    | "pending"
                    | "confirmed"
                    | "partially_fulfilled"
                    | "fulfilled"
                    | "cancelled"
                    | "refunded" = "confirmed"
                let itemStatus:
                    | "pending"
                    | "accepted"
                    | "preparing"
                    | "out_for_delivery"
                    | "delivered"
                    | "rejected"
                    | "cancelled" = "accepted"

                if (o.status === "out_for_delivery") {
                    headerStatus = "confirmed"
                    itemStatus = "out_for_delivery"
                } else if (o.status === "delivered") {
                    headerStatus = "fulfilled"
                    itemStatus = "delivered"
                } else if (o.status === "cancelled" || o.status === "rejected") {
                    headerStatus = "cancelled"
                    itemStatus = "cancelled"
                } else if (o.status === "pending") {
                    headerStatus = "pending"
                    itemStatus = "pending"
                }

                // 1. Header Order
                const [insertedOrder] = await tx
                    .insert(marketMandiOrder)
                    .values({
                        id: crypto.randomUUID(),
                        marketStoreId: o.marketStoreId,
                        orderCode: o.orderCode,
                        marketStoreName: o.marketStoreName!,
                        idempotencyKey: `IDEM-${o.orderCode}`,
                        status: headerStatus,
                        fulfillmentType: "delivery",
                        mandiCounterId: vashiCounter.id,
                        pickupCode: `PKP-${o.orderCode.slice(-4)}`,
                        subtotal: totalAmount,
                        totalAmount: totalAmount,
                        placedAt: o.createdAt,
                        confirmedAt: o.createdAt,
                        createdAt: o.createdAt,
                    })
                    .returning()

                if (!insertedOrder) {
                    throw new Error("Failed to insert order during seeding")
                }

                // 2. Order Line Item (Direct relationship to Mandi Store)
                const [insertedItem] = await tx
                    .insert(marketMandiOrderItem)
                    .values({
                        id: crypto.randomUUID(),
                        orderId: insertedOrder.id,
                        mandiStoreId: tomatoMandiStore.id,
                        vegId: seededVegetables[0]!.id, // Tomato
                        vegNameSnapshot: "Tomato",
                        mandiStoreNameSnapshot: tomatoMandiStore.storeName!,
                        quantityInGram: o.quantityInGram,
                        pricePerKg,
                        totalAmount,
                        status: itemStatus,
                        createdAt: o.createdAt,
                    })
                    .returning()

                seededOrdersCount++

                // 3. Status History
                await tx.insert(marketMandiOrderStatusHistory).values({
                    id: crypto.randomUUID(),
                    orderId: insertedOrder.id,
                    orderItemId: insertedItem?.id,
                    toStatus: headerStatus,
                    triggeredBy: "system",
                    reason: "Initial seed status",
                    createdAt: o.createdAt,
                })
                seededHistoryCount++

                // 4. Payment record
                // 4. Payment record
                const isPaid = headerStatus !== "cancelled"
                const [insertedPayment] = await tx
                    .insert(marketMandiPayment)
                    .values({
                        id: crypto.randomUUID(),
                        orderId: insertedOrder.id,
                        idempotencyKey: `SEED-${o.orderCode}`,
                        provider: "razorpay" as const,
                        method: "upi" as const,
                        amount: totalAmount,
                        status: isPaid ? ("captured" as const) : ("failed" as const),
                        gatewayPaymentId: `TXN${o.orderCode.replace("ORD-", "")}`,
                        paidAt: isPaid ? o.createdAt : null,
                        createdAt: o.createdAt,
                    })
                    .returning()

                if (insertedPayment) {
                    await tx.insert(marketMandiPaymentSplit).values({
                        id: crypto.randomUUID(),
                        paymentId: insertedPayment.id,
                        splitType: "vendor_payout",
                        vendorId: mandiVendor1.id, // Vendor receiving payout
                        amount: totalAmount - 500, // taking 500 paise as fee
                    })

                    await tx.insert(marketMandiPaymentStatusHistory).values({
                        id: crypto.randomUUID(),
                        paymentId: insertedPayment.id,
                        toStatus: insertedPayment.status,
                        triggeredBy: "system",
                        createdAt: o.createdAt,
                    })

                    await tx.insert(marketMandiPaymentWebhookEvent).values({
                        id: crypto.randomUUID(),
                        provider: "razorpay",
                        eventId: `EVT-${o.orderCode}`,
                        eventType: isPaid ? "payment.captured" : "payment.failed",
                        paymentId: insertedPayment.id,
                        rawPayload: { status: insertedPayment.status },
                        receivedAt: o.createdAt,
                    })
                }
                seededPaymentsCount++
            }

            console.log(
                `✅ ${seededOrdersCount} Orders, ${seededHistoryCount} History records, and ${seededPaymentsCount} Payments seeded.`,
            )
        })

        console.log("\n📊 Seeding Summary:")
        console.table([
            { Entity: "Admins", Count: 2 },
            { Entity: "Cities", Count: 2 },
            { Entity: "Vegetables", Count: 5 },
            { Entity: "Mandis", Count: 2 },
            { Entity: "Mandi ROS Counters", Count: 2 },
            { Entity: "Mandi Vendors", Count: 2 },
            { Entity: "Mandi Stores", Count: 2 },
            { Entity: "Mandi Prices", Count: 2 },
            { Entity: "Mandi KYC Docs", Count: 3 },
            { Entity: "Market Vendors & Wallets", Count: 12 },
            { Entity: "Market Stores", Count: 12 },
            { Entity: "Market Vendor Carts", Count: 2 },
            { Entity: "Market KYC Docs", Count: 3 },
            { Entity: "Mandi Store Agreements", Count: 2 },
            { Entity: "Market Store Agreements", Count: 12 },
            { Entity: "Mandi Subscription Charges", Count: 3 },
            { Entity: "Market Subscription Charges", Count: 4 },
            { Entity: "Market Mandi Orders", Count: 12 },
            { Entity: "Market Mandi Payment Splits", Count: 12 },
            { Entity: "Market Mandi Status History", Count: 12 },
            { Entity: "Market Mandi Webhook Events", Count: 12 },
        ])

        console.log("\n🎉 Database seeding completed successfully!")
    } catch (error) {
        console.error("❌ Error seeding database:", error)
        process.exit(1)
    }
}

main().then(() => process.exit(0))
