import { Router } from "express"
import { upload, uploadMedia } from "./media.controller"
import { expressIsAdmin } from "../../middlewares"

const mediaRouter = Router()

// Route for single file upload - protected by expressIsAdmin middleware
mediaRouter.post("/upload", expressIsAdmin, upload.single("file"), uploadMedia)

export default mediaRouter
