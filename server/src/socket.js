import { Server } from "socket.io"
import jwt from "jsonwebtoken"
import User from "./models/User.js"

let io = null

export function initSocket(server) {
  if (process.env.NODE_ENV === "test") return

  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  })

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1]

      if (!token) return next(new Error("Unauthorized"))

      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      const user = await User.findById(decoded.id)
      if (!user) return next(new Error("Unauthorized"))

      socket.user = user
      next()
    } catch {
      next(new Error("Unauthorized"))
    }
  })

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.user.email)

    socket.join("global")

    socket.on("join_event", (eventId) => {
      socket.join(`event:${eventId}`)
    })

    socket.on("leave_event", (eventId) => {
      socket.leave(`event:${eventId}`)
    })

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.user.email)
    })
  })
}

export function getIO() {
  return io
}