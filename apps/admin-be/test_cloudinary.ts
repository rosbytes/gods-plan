import { cloudinary } from "./src/configs"
import fs from "fs"

async function testUpload() {
    try {
        console.log("Reading shubham.jpeg...")
        const buffer = fs.readFileSync("./images/shubham.jpeg")

        console.log("Uploading to Cloudinary...")
        const uploadStream = cloudinary.v2.uploader.upload_stream(
            {
                folder: "ros/test",
                resource_type: "image",
            },
            (error, result) => {
                if (error) {
                    console.error("Upload Error:", error)
                    return
                }
                console.log("Upload Success!")
                console.log("URL:", result?.secure_url)
                process.exit(0)
            },
        )
        uploadStream.end(buffer)
    } catch (err) {
        console.error("Script Error:", err)
    }
}

testUpload()
