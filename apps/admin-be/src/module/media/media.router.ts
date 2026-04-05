import { Router } from "express"
import { upload, uploadMedia } from "./media.controller"

const mediaRouter = Router()

// Route for single file upload
mediaRouter.post("/upload", upload.single("file"), uploadMedia)

export default mediaRouter
