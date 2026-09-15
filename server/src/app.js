import express from "express"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

import authRoutes from "./routes/authRoutes.js"
import eventRoutes from "./routes/eventRoutes.js"

dotenv.config()

const app = express()

app.use(express.json())

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        process.env.CLIENT_URL || "http://localhost:5173",
        "http://localhost:5173",
        "http://localhost:5174",
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

if (process.env.NODE_ENV === "test") {
  app.use("/auth", authRoutes)
  app.use("/events", eventRoutes)
  app.use("/", authRoutes)
} else {
  app.use("/api/auth", authRoutes)
  app.use("/api/events", eventRoutes)
}

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

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || "En intern serverfeil oppstod.",
  })
})

export default app