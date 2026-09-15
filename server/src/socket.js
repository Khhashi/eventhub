import { Server } from "socket.io"
import jwt from "jsonwebtoken"
import User from "./models/User.js"

let io = null

export function initSocket(server) {
  if (process.env.NODE_ENV === "test") return

  io = new Server(server, {
    cors: {
      origin: [
        process.env.CLIENT_URL || "http://localhost:5173",
        "http://localhost:5173",
        "http://localhost:5174",
      ],
      credentials: true,
    },
  })

  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie || ""
      const cookieToken = cookieHeader
        .split(";")
        .map((cookie) => cookie.trim().split("="))
        .find(([key]) => key === "eventflow_token")?.[1]
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1] ||
        cookieToken

      if (!token) return next(new Error("Du må logge inn først."))

      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      const user = await User.findById(decoded.id)
      if (!user) return next(new Error("Unauthorized"))

      socket.user = user
      next()
    } catch {
      next(new Error("Innloggingen kunne ikke bekreftes."))
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