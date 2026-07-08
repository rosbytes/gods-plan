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
                    id: "v1v1v1v1-1111-1111-1111-111111111111",
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
                    id: "v2v2v2v2-2222-2222-2222-222222222222",
                    name: "Potato",
                    nameInHindi: "आलू",
                    vegPrimaryImage: "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
                    vegImageGallery: [
                        "https://images.unsplash.com/photo-1590165482129-1b8b27698780",
                    ],
                    createdBy: superAdminRecord.id,
                },
                {
                    id: "v3v3v3v3-3333-3333-3333-333333333333",
                    name: "Onion",
                    nameInHindi: "प्याज़",
                    vegPrimaryImage: "https://images.unsplash.com/photo-1508747703725-719ae25db29f",
                    vegImageGallery: [],
                    createdBy: superAdminRecord.id,
                },
                {
                    id: "v4v4v4v4-4444-4444-4444-444444444444",
                    name: "Spinach",
                    nameInHindi: "पालक",
                    vegPrimaryImage: "https://images.unsplash.com/photo-1576045057995-568f588f82fb",
                    vegImageGallery: [],
                    createdBy: superAdminRecord.id,
                },
                {
                    id: "v5v5v5v5-5555-5555-5555-555555555555",
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
                    id: "m1m1m1m1-1111-1111-1111-111111111111",
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
                    id: "m2m2m2m2-2222-2222-2222-222222222222",
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
                    id: "mv11mv11-1111-1111-1111-111111111111",
                    mandiId: vashiMandi.id,
                    fullName: "Ramesh Kumar",
                    primaryPhone: "+919999999901",
                    alternatePhone: "+919999999911",
                    pin: hashedPin,
                    lat: 19.0761,
                    lng: 72.8778,
                    createdBy: superAdminRecord.id,
                })
                .returning()

            const [mandiVendor2] = await tx
                .insert(mandiVendor)
                .values({
                    id: "mv22mv22-2222-2222-2222-222222222222",
                    mandiId: azadpurMandi.id,
                    fullName: "Amit Sharma",
                    primaryPhone: "+919999999902",
                    alternatePhone: null,
                    pin: hashedPin,
                    lat: 28.614,
                    lng: 77.2091,
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
                    id: "ms11ms11-1111-1111-1111-111111111111",
                    mandiId: vashiMandi.id,
                    mandiVendorId: mandiVendor1.id,
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
                    id: "ms22ms22-2222-2222-2222-222222222222",
                    mandiId: azadpurMandi.id,
                    mandiVendorId: mandiVendor2.id,
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
                id: "mp11mp11-1111-1111-1111-111111111111",
                mandiStoreId: tomatoMandiStore.id,
                vegId: seededVegetables[0]!.id, // Tomato
                price: 2500, // 25.00 Rs/kg in paise
            })

            await tx.insert(mandiPrice).values({
                id: "mp22mp22-2222-2222-2222-222222222222",
                mandiStoreId: potatoMandiStore.id,
                vegId: seededVegetables[1]!.id, // Potato
                price: 1800, // 18.00 Rs/kg in paise
            })
            console.log("✅ Mandi Prices seeded.")

            // 2.9. Insert Market Vendors
            console.log("🤝 Seeding Market Vendors...")
            const [marketVendor1] = await tx
                .insert(marketVendor)
                .values({
                    id: "mkv1mkv1-1111-1111-1111-111111111111",
                    fullName: "Suresh Patel",
                    primaryPhone: "+918888888801",
                    alternatePhone: "+918888888811",
                    pin: hashedPin,
                    batch: 1,
                    createdBy: superAdminRecord.id,
                })
                .returning()

            const [marketVendor2] = await tx
                .insert(marketVendor)
                .values({
                    id: "mkv2mkv2-2222-2222-2222-222222222222",
                    fullName: "Rajesh Verma",
                    primaryPhone: "+918888888802",
                    alternatePhone: null,
                    pin: hashedPin,
                    batch: 1,
                    createdBy: superAdminRecord.id,
                })
                .returning()

            if (!marketVendor1 || !marketVendor2) {
                throw new Error("Failed to create market vendors.")
            }
            console.log("✅ Market Vendors seeded.")

            // 2.10. Insert Market Stores
            console.log("🛒 Seeding Market Stores...")
            await tx.insert(marketStore).values({
                id: "mks1mks1-1111-1111-1111-111111111111",
                marketVendorId: marketVendor1.id,
                cityId: mumbaiCity.id,
                lat: 19.082,
                lng: 72.889,
                storeName: "Suresh Patel Grocery",
                storeImage: "https://images.unsplash.com/photo-1542838132-92c53300491e",
                fullAddress: "Shop 12, Main Street, Kurla, Mumbai",
                radiusM: 4000,
            })

            await tx.insert(marketStore).values({
                id: "mks2mks2-2222-2222-2222-222222222222",
                marketVendorId: marketVendor2.id,
                cityId: delhiCity.id,
                lat: 28.625,
                lng: 77.22,
                storeName: "Rajesh Supermarket",
                storeImage: "https://images.unsplash.com/photo-1542838132-92c53300491e",
                fullAddress: "Shop 4, Market Complex, Connaught Place, New Delhi",
                radiusM: 5000,
            })
            console.log("✅ Market Stores seeded.")
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
            { Entity: "Market Vendors", Count: 2 },
            { Entity: "Market Stores", Count: 2 },
        ])

        console.log("🎉 Database seeding completed successfully!")
        process.exit(0)
    } catch (error) {
        console.error("❌ Database seeding failed:", error)
        process.exit(1)
    }
}

main()
