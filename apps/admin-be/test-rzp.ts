import "dotenv/config"
import Razorpay from "razorpay"

const REGISTRATION_AMOUNT = 5000

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

async function test() {
    try {
        const closeBy = Math.floor(Date.now() / 1000) + 600

        const qr = await razorpay.qrCode.create({
            type: "upi_qr",
            name: `ROS Registration - test1234`,
            usage: "single_use",
            fixed_amount: true,
            payment_amount: REGISTRATION_AMOUNT * 100, // paise
            description: "Store Registration Fee",
            close_by: closeBy,
            notes: {
                storeId: "test-store",
                vendorId: "test-vendor",
            },
        })
        console.log("SUCCESS:", qr.id)
    } catch (err: any) {
        console.error("ERROR:")
        console.error(err)
        console.error(err.response?.data)
    }
}
test()
