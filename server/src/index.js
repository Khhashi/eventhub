import http from "http"
import mongoose from "mongoose"
import app from "./app.js"
import { initSocket } from "./socket.js"

const PORT = process.env.PORT || 3000

const server = http.createServer(app)
initSocket(server)

if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB connected")
      server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`)
      })
    })
    .catch((err) => {
      console.error("MongoDB error:", err)
    })
}

export default server