import { db, testConnection } from "./src/db"
import bcrypt from "bcryptjs"
import {
    admin,
    city,
    veg,
    mandi,
    mandiVendor,
    mandiStore,
    mandiPrice,
    marketVendor,
    marketStore,
    marketMandiOrder,
    marketMandiOrderPayment,
    marketMandiOrderStatusHistory,
} from "./src/index"

async function main() {
    console.log("🚀 Starting database seeding...")

    const hashPin = (pin: string) => bcrypt.hashSync(pin, 12)
    const hashedPin = hashPin("1234")

    try {
        // 1. Verify DB Connection
        await testConnection()
        console.log("📡 Connected to database successfully.")

        // 2. Perform Seeding inside a Single Transaction for Atomicity
        await db.transaction(async (tx) => {
            // 2.1. Clean existing records in reverse dependency order
            console.log("🧹 Cleaning old database records...")
            await tx.delete(marketMandiOrderPayment)
            await tx.delete(marketMandiOrderStatusHistory)
            await tx.delete(marketMandiOrder)
            await tx.delete(mandiPrice)
            await tx.delete(marketStore)
            await tx.delete(marketVendor)
            await tx.delete(mandiStore)
            await tx.delete(mandiVendor)
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
                    id: "f3b3b4f6-8c43-4c91-9e2c-29b1f7ebf74c",
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
                    id: "a1a1a1a1-1111-1111-1111-111111111111",
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
                    id: "c1c1c1c1-1111-1111-1111-111111111111",
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
                    id: "c2c2c2c2-2222-2222-2222-222222222222",
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
                    id: "11111111-1111-1111-1111-111111111111",
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
                    id: "22222222-2222-2222-2222-222222222222",
                    name: "Potato",
                    nameInHindi: "आलू",
                    vegPrimaryImage: "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
                    vegImageGallery: [
                        "https://images.unsplash.com/photo-1590165482129-1b8b27698780",
                    ],
                    createdBy: superAdminRecord.id,
                },
                {
                    id: "33333333-3333-3333-3333-333333333333",
                    name: "Onion",
                    nameInHindi: "प्याज़",
                    vegPrimaryImage: "https://images.unsplash.com/photo-1508747703725-719ae25db29f",
                    vegImageGallery: [],
                    createdBy: superAdminRecord.id,
                },
                {
                    id: "44444444-4444-4444-4444-444444444444",
                    name: "Spinach",
                    nameInHindi: "पालक",
                    vegPrimaryImage: "https://images.unsplash.com/photo-1576045057995-568f588f82fb",
                    vegImageGallery: [],
                    createdBy: superAdminRecord.id,
                },
                {
                    id: "55555555-5555-5555-5555-555555555555",
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
                    id: "d1d1d1d1-1111-1111-1111-111111111111",
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
                    id: "d2d2d2d2-2222-2222-2222-222222222222",
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

            // 2.6. Insert Mandi Vendors
            console.log("👨‍🌾 Seeding Mandi Vendors...")

            const [mandiVendor1] = await tx
                .insert(mandiVendor)
                .values({
                    id: "de11de11-1111-1111-1111-111111111111",
                    fullName: "Ramesh Kumar",
                    primaryPhone: "+919999999901",
                    alternatePhone: "+919999999911",
                    pin: hashedPin,
                    createdBy: superAdminRecord.id,
                })
                .returning()

            const [mandiVendor2] = await tx
                .insert(mandiVendor)
                .values({
                    id: "de22de22-2222-2222-2222-222222222222",
                    fullName: "Amit Sharma",
                    primaryPhone: "+919999999902",
                    alternatePhone: null,
                    pin: hashedPin,
                    createdBy: superAdminRecord.id,
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
                    id: "da11da11-1111-1111-1111-111111111111",
                    mandiId: vashiMandi.id,
                    vendorId: mandiVendor1.id,
                    vegId: seededVegetables[0]!.id, // Tomato
                    lat: 19.0762,
                    lng: 72.8779,
                    fullAddress: "Gala No. 45, Vashi Mandi, Navi Mumbai",
                    storeName: "Ramesh Tomato Wholesale",
                    storeImage: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877",
                })
                .returning()

            const [potatoMandiStore] = await tx
                .insert(mandiStore)
                .values({
                    id: "da22da22-2222-2222-2222-222222222222",
                    mandiId: azadpurMandi.id,
                    vendorId: mandiVendor2.id,
                    vegId: seededVegetables[1]!.id, // Potato
                    lat: 28.6141,
                    lng: 77.2092,
                    fullAddress: "Shop 102, Azadpur Mandi, Delhi",
                    storeName: "Amit Potato Merchant",
                    storeImage: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877",
                })
                .returning()

            if (!tomatoMandiStore || !potatoMandiStore) {
                throw new Error("Failed to create mandi stores.")
            }
            console.log("✅ Mandi Stores seeded.")

            // 2.8. Insert Mandi Prices
            console.log("💰 Seeding Mandi Prices...")
            await tx.insert(mandiPrice).values({
                id: "df11df11-1111-1111-1111-111111111111",
                mandiStoreId: tomatoMandiStore.id,
                vegId: seededVegetables[0]!.id, // Tomato
                price: 2500, // 25.00 Rs/kg in paise
            })

            await tx.insert(mandiPrice).values({
                id: "df22df22-2222-2222-2222-222222222222",
                mandiStoreId: potatoMandiStore.id,
                vegId: seededVegetables[1]!.id, // Potato
                price: 1800, // 18.00 Rs/kg in paise
            })
            console.log("✅ Mandi Prices seeded.")

            // 2.9. Insert Market Vendors
            console.log("🤝 Seeding Market Vendors...")
            const marketVendorsList = [
                {
                    id: "cde1cde1-1111-1111-1111-111111111111",
                    fullName: "Suresh Patel",
                    primaryPhone: "+918888888801",
                    pin: hashedPin,
                    slot: 1,
                    createdBy: superAdminRecord.id,
                },
                {
                    id: "cde2cde2-2222-2222-2222-222222222222",
                    fullName: "Rajesh Verma",
                    primaryPhone: "+918888888802",
                    pin: hashedPin,
                    slot: 2,
                    createdBy: superAdminRecord.id,
                },
                {
                    id: "cde3cde3-3333-3333-3333-333333333333",
                    fullName: "Sharma Vendor",
                    primaryPhone: "+918888888803",
                    pin: hashedPin,
                    slot: 1,
                    createdBy: superAdminRecord.id,
                },
                {
                    id: "cde4cde4-4444-4444-4444-444433333333",
                    fullName: "Aarya Vendor",
                    primaryPhone: "+918888888804",
                    pin: hashedPin,
                    slot: 2,
                    createdBy: superAdminRecord.id,
                },
                {
                    id: "cde5cde5-5555-5555-5555-555533333333",
                    fullName: "Bhati Vendor",
                    primaryPhone: "+918888888805",
                    pin: hashedPin,
                    slot: 3,
                    createdBy: superAdminRecord.id,
                },
                {
                    id: "cde6cde6-6666-6666-6666-666633333333",
                    fullName: "Bhawani Vendor",
                    primaryPhone: "+918888888806",
                    pin: hashedPin,
                    slot: 4,
                    createdBy: superAdminRecord.id,
                },
                {
                    id: "cde7cde7-7777-7777-7777-777733333333",
                    fullName: "Sid Vendor",
                    primaryPhone: "+918888888807",
                    pin: hashedPin,
                    slot: 5,
                    createdBy: superAdminRecord.id,
                },
                {
                    id: "cde8cde8-8888-8888-8888-888833333333",
                    fullName: "Rehman Vendor",
                    primaryPhone: "+918888888808",
                    pin: hashedPin,
                    slot: 1,
                    createdBy: superAdminRecord.id,
                },
                {
                    id: "cde9cde9-9999-9999-9999-999933333333",
                    fullName: "Hamza Vendor",
                    primaryPhone: "+918888888809",
                    pin: hashedPin,
                    slot: 2,
                    createdBy: superAdminRecord.id,
                },
                {
                    id: "cdea1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                    fullName: "Maanvi Vendor",
                    primaryPhone: "+918888888810",
                    pin: hashedPin,
                    slot: 3,
                    createdBy: superAdminRecord.id,
                },
                {
                    id: "cdeb1111-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                    fullName: "Mishra Vendor",
                    primaryPhone: "+918888888812",
                    pin: hashedPin,
                    slot: 4,
                    createdBy: superAdminRecord.id,
                },
                {
                    id: "cdec1111-cccc-cccc-cccc-cccccccccccc",
                    fullName: "Noor Vendor",
                    primaryPhone: "+918888888813",
                    pin: hashedPin,
                    slot: 5,
                    createdBy: superAdminRecord.id,
                },
            ]

            for (const v of marketVendorsList) {
                await tx.insert(marketVendor).values(v)
            }
            console.log("✅ Market Vendors seeded.")

            // 2.10. Insert Market Stores
            console.log("🛒 Seeding Market Stores...")
            const marketStoresList = [
                {
                    id: "cab1cab1-1111-1111-1111-111111111111",
                    vendorId: "cde1cde1-1111-1111-1111-111111111111",
                    mandiId: vashiMandi.id,
                    cityId: mumbaiCity.id,
                    lat: 19.082,
                    lng: 72.889,
                    storeName: "Suresh Patel Grocery",
                    storeImage: "https://images.unsplash.com/photo-1542838132-92c53300491e",
                    fullAddress: "Shop 12, Main Street, Kurla, Mumbai",
                    radiusM: 4000,
                },
                {
                    id: "cab2cab2-2222-2222-2222-222222222222",
                    vendorId: "cde2cde2-2222-2222-2222-222222222222",
                    mandiId: azadpurMandi.id,
                    cityId: delhiCity.id,
                    lat: 28.625,
                    lng: 77.22,
                    storeName: "Rajesh Supermarket",
                    storeImage: "https://images.unsplash.com/photo-1542838132-92c53300491e",
                    fullAddress: "Shop 4, Market Complex, Connaught Place, New Delhi",
                    radiusM: 5000,
                },
                {
                    id: "cab3cab3-3333-3333-3333-333333333333",
                    vendorId: "cde3cde3-3333-3333-3333-333333333333",
                    mandiId: vashiMandi.id,
                    cityId: mumbaiCity.id,
                    lat: 19.083,
                    lng: 72.89,
                    storeName: "Sharma Vegetables",
                    storeImage: "https://images.unsplash.com/photo-1542838132-92c53300491e",
                    fullAddress: "Shop 14, Main Road, Vashi, Navi Mumbai",
                    radiusM: 3000,
                },
                {
                    id: "cab4cab4-4444-4444-4444-444433333333",
                    vendorId: "cde4cde4-4444-4444-4444-444433333333",
                    mandiId: vashiMandi.id,
                    cityId: mumbaiCity.id,
                    lat: 19.084,
                    lng: 72.891,
                    storeName: "Aarya Vegetables",
                    storeImage: "https://images.unsplash.com/photo-1542838132-92c53300491e",
                    fullAddress: "Shop 15, Sector 17, Vashi, Navi Mumbai",
                    radiusM: 3000,
                },
                {
                    id: "cab5cab5-5555-5555-5555-555533333333",
                    vendorId: "cde5cde5-5555-5555-5555-555533333333",
                    mandiId: vashiMandi.id,
                    cityId: mumbaiCity.id,
                    lat: 19.085,
                    lng: 72.892,
                    storeName: "Bhati Vegetables",
                    storeImage: "https://images.unsplash.com/photo-1542838132-92c53300491e",
                    fullAddress: "Gala No 5, Market Yard, Vashi, Navi Mumbai",
                    radiusM: 3000,
                },
                {
                    id: "cab6cab6-6666-6666-6666-666633333333",
                    vendorId: "cde6cde6-6666-6666-6666-666633333333",
                    mandiId: vashiMandi.id,
                    cityId: mumbaiCity.id,
                    lat: 19.086,
                    lng: 72.893,
                    storeName: "Bhawani Vegetables",
                    storeImage: "https://images.unsplash.com/photo-1542838132-92c53300491e",
                    fullAddress: "Shop 21, APMC Market, Vashi, Navi Mumbai",
                    radiusM: 3000,
                },
                {
                    id: "cab7cab7-7777-7777-7777-777733333333",
                    vendorId: "cde7cde7-7777-7777-7777-777733333333",
                    mandiId: vashiMandi.id,
                    cityId: mumbaiCity.id,
                    lat: 19.087,
                    lng: 72.894,
                    storeName: "Sid Vegetables",
                    storeImage: "https://images.unsplash.com/photo-1542838132-92c53300491e",
                    fullAddress: "Shop 22, APMC Market, Vashi, Navi Mumbai",
                    radiusM: 3000,
                },
                {
                    id: "cab8cab8-8888-8888-8888-888833333333",
                    vendorId: "cde8cde8-8888-8888-8888-888833333333",
                    mandiId: vashiMandi.id,
                    cityId: mumbaiCity.id,
                    lat: 19.088,
                    lng: 72.895,
                    storeName: "Rehman Vegetables",
                    storeImage: "https://images.unsplash.com/photo-1542838132-92c53300491e",
                    fullAddress: "Gala No 12, APMC Sector 19, Vashi, Navi Mumbai",
                    radiusM: 3000,
                },
                {
                    id: "cab9cab9-9999-9999-9999-999933333333",
                    vendorId: "cde9cde9-9999-9999-9999-999933333333",
                    mandiId: vashiMandi.id,
                    cityId: mumbaiCity.id,
                    lat: 19.089,
                    lng: 72.896,
                    storeName: "Hamza Vegetables",
                    storeImage: "https://images.unsplash.com/photo-1542838132-92c53300491e",
                    fullAddress: "Shop 8, APMC Gate 2, Vashi, Navi Mumbai",
                    radiusM: 3000,
                },
                {
                    id: "caba1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                    vendorId: "cdea1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                    mandiId: vashiMandi.id,
                    cityId: mumbaiCity.id,
                    lat: 19.09,
                    lng: 72.897,
                    storeName: "Maanvi Vegetables",
                    storeImage: "https://images.unsplash.com/photo-1542838132-92c53300491e",
                    fullAddress: "Shop 9, APMC Gate 2, Vashi, Navi Mumbai",
                    radiusM: 3000,
                },
                {
                    id: "cabb1111-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                    vendorId: "cdeb1111-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                    mandiId: vashiMandi.id,
                    cityId: mumbaiCity.id,
                    lat: 19.091,
                    lng: 72.898,
                    storeName: "Mishra Vegetables",
                    storeImage: "https://images.unsplash.com/photo-1542838132-92c53300491e",
                    fullAddress: "Shop 10, APMC Gate 2, Vashi, Navi Mumbai",
                    radiusM: 3000,
                },
                {
                    id: "cabc1111-cccc-cccc-cccc-cccccccccccc",
                    vendorId: "cdec1111-cccc-cccc-cccc-cccccccccccc",
                    mandiId: vashiMandi.id,
                    cityId: mumbaiCity.id,
                    lat: 19.092,
                    lng: 72.899,
                    storeName: "Noor Vegetables",
                    storeImage: "https://images.unsplash.com/photo-1542838132-92c53300491e",
                    fullAddress: "Shop 11, APMC Gate 2, Vashi, Navi Mumbai",
                    radiusM: 3000,
                },
            ]

            for (const s of marketStoresList) {
                await tx.insert(marketStore).values(s)
            }
            console.log("✅ Market Stores seeded.")

            // 2.11. Insert Market Mandi Orders (Associated with Dispatch Slots)
            console.log("📦 Seeding Market Mandi Orders...")
            const today = new Date()
            const makeDate = (hour: number, minute: number) => {
                const d = new Date(today)
                d.setHours(hour, minute, 0, 0)
                return d
            }

            const ordersToSeed = [
                // Slot 1: 04:00 AM - 04:12 AM (Suresh Patel, Sharma, Rehman)
                {
                    orderCode: "ORD-40261",
                    marketStoreId: "cab1cab1-1111-1111-1111-111111111111",
                    marketStoreName: "Suresh Patel Grocery",
                    quantityInGram: 100000,
                    status: "confirmed" as const,
                    createdAt: makeDate(4, 0),
                },
                {
                    orderCode: "ORD-40262",
                    marketStoreId: "cab3cab3-3333-3333-3333-333333333333",
                    marketStoreName: "Sharma Vegetables",
                    quantityInGram: 80000,
                    status: "cancelled" as const,
                    createdAt: makeDate(4, 0),
                },
                {
                    orderCode: "ORD-40263",
                    marketStoreId: "cab8cab8-8888-8888-8888-888833333333",
                    marketStoreName: "Rehman Vegetables",
                    quantityInGram: 60000,
                    status: "out_for_delivery" as const,
                    createdAt: makeDate(4, 5),
                },

                // Slot 2: 05:00 AM - 05:20 AM (Rajesh Verma, Aarya, Hamza)
                {
                    orderCode: "ORD-40264",
                    marketStoreId: "cab2cab2-2222-2222-2222-222222222222",
                    marketStoreName: "Rajesh Supermarket",
                    quantityInGram: 120000,
                    status: "out_for_delivery" as const,
                    createdAt: makeDate(5, 0),
                },
                {
                    orderCode: "ORD-40265",
                    marketStoreId: "cab4cab4-4444-4444-4444-444433333333",
                    marketStoreName: "Aarya Vegetables",
                    quantityInGram: 140000,
                    status: "confirmed" as const,
                    createdAt: makeDate(5, 8),
                },
                {
                    orderCode: "ORD-40266",
                    marketStoreId: "cab9cab9-9999-9999-9999-999933333333",
                    marketStoreName: "Hamza Vegetables",
                    quantityInGram: 100000,
                    status: "confirmed" as const,
                    createdAt: makeDate(5, 6),
                },

                // Slot 3: 06:00 AM - 06:30 AM (Bhati, Maanvi)
                {
                    orderCode: "ORD-40267",
                    marketStoreId: "cab5cab5-5555-5555-5555-555533333333",
                    marketStoreName: "Bhati Vegetables",
                    quantityInGram: 80000,
                    status: "confirmed" as const,
                    createdAt: makeDate(6, 4),
                },
                {
                    orderCode: "ORD-40268",
                    marketStoreId: "caba1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                    marketStoreName: "Maanvi Vegetables",
                    quantityInGram: 60000,
                    status: "confirmed" as const,
                    createdAt: makeDate(6, 2),
                },

                // Slot 4: 07:00 AM - 07:15 AM (Bhawani, Mishra)
                {
                    orderCode: "ORD-40269",
                    marketStoreId: "cab6cab6-6666-6666-6666-666633333333",
                    marketStoreName: "Bhawani Vegetables",
                    quantityInGram: 140000,
                    status: "confirmed" as const,
                    createdAt: makeDate(7, 9),
                },
                {
                    orderCode: "ORD-40270",
                    marketStoreId: "cabb1111-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                    marketStoreName: "Mishra Vegetables",
                    quantityInGram: 120000,
                    status: "confirmed" as const,
                    createdAt: makeDate(7, 11),
                },

                // Slot 5: 08:00 AM - 08:45 AM (Sid, Noor)
                {
                    orderCode: "ORD-40271",
                    marketStoreId: "cab7cab7-7777-7777-7777-777733333333",
                    marketStoreName: "Sid Vegetables",
                    quantityInGram: 120000,
                    status: "confirmed" as const,
                    createdAt: makeDate(8, 0),
                },
                {
                    orderCode: "ORD-40272",
                    marketStoreId: "cabc1111-cccc-cccc-cccc-cccccccccccc",
                    marketStoreName: "Noor Vegetables",
                    quantityInGram: 90000,
                    status: "out_for_delivery" as const,
                    createdAt: makeDate(8, 5),
                },
            ]

            let seededOrdersCount = 0
            let seededHistoryCount = 0
            let seededPaymentsCount = 0

            for (const o of ordersToSeed) {
                const pricePerKgInPaise = 2400
                const totalAmountInPaise = (o.quantityInGram / 1000) * pricePerKgInPaise

                const [insertedOrder] = await tx
                    .insert(marketMandiOrder)
                    .values({
                        marketStoreId: o.marketStoreId,
                        mandiStoreId: "da11da11-1111-1111-1111-111111111111", // Ramesh Tomato Wholesale
                        vegId: "11111111-1111-1111-1111-111111111111", // Tomato
                        orderCode: o.orderCode,
                        mandiStoreName: "Ramesh Tomato Wholesale",
                        marketStoreName: o.marketStoreName,
                        vegName: "Tomato",
                        quantityInGram: o.quantityInGram,
                        pricePerKgInPaise,
                        totalAmountInPaise,
                        status: o.status,
                        confirmedAt: o.createdAt,
                        createdAt: o.createdAt,
                    })
                    .returning()

                if (!insertedOrder) {
                    throw new Error("Failed to insert order during seeding")
                }

                seededOrdersCount++

                // Insert Status History
                await tx.insert(marketMandiOrderStatusHistory).values({
                    orderId: insertedOrder.id,
                    status: o.status,
                    changedByType: "system",
                    note: "Initial seed status",
                    createdAt: o.createdAt,
                })
                seededHistoryCount++

                // Insert Payment record
                const isPaid = o.status !== "cancelled"
                await tx.insert(marketMandiOrderPayment).values({
                    orderId: insertedOrder.id,
                    amountInPaise: totalAmountInPaise,
                    paymentStatus: isPaid ? ("success" as const) : ("failed" as const),
                    paymentMethod: "upi" as const,
                    transactionId: `TXN${o.orderCode.replace("ORD-", "")}`,
                    paidAt: isPaid ? o.createdAt : null,
                    createdAt: o.createdAt,
                })
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
            { Entity: "Mandi Vendors", Count: 2 },
            { Entity: "Mandi Stores", Count: 2 },
            { Entity: "Mandi Prices", Count: 2 },
            { Entity: "Market Vendors", Count: 12 },
            { Entity: "Market Stores", Count: 12 },
            { Entity: "Market Mandi Orders", Count: 12 },
            { Entity: "Market Status History", Count: 12 },
            { Entity: "Market Mandi Payments", Count: 12 },
        ])

        console.log("🎉 Database seeding completed successfully!")
        process.exit(0)
    } catch (error) {
        console.error("❌ Database seeding failed:", error)
        process.exit(1)
    }
}

main()
