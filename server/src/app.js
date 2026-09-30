import express from "express"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

import authRoutes from "./routes/authRoutes.js"
import eventRoutes from "./routes/eventRoutes.js"
import errorHandler from "./middleware/errorHandler.js"

dotenv.config()

const app = express()

app.use(express.json({ limit: "4mb" }))

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        process.env.CLIENT_URL || "http://localhost:5173",
        "http://localhost:5173",
        "http://localhost:5174",
        "https://eventmeeting-f3eu.onrender.com",
      ]

      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(new Error("Opprinnelsen er ikke tillatt."))
    },
    credentials: true,
  })
)

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
)

app.use("/api/auth", authRoutes)
app.use("/api/events", eventRoutes)

app.use("/api", (req, res) => {
  res.status(404).json({ message: "Fant ikke ressursen." })
})

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(
  express.static(path.join(__dirname, "../../client/dist"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith("index.html")) {
        res.setHeader("Cache-Control", "no-store")
      } else {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable")
      }
    },
  })
)

app.get(/.*/, (req, res) => {
  res.setHeader("Cache-Control", "no-store")
  res.sendFile(path.join(__dirname, "../../client/dist/index.html"))
})

app.use(errorHandler)

export default app