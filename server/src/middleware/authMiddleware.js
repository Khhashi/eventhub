import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const cookies = Object.fromEntries(
      (req.headers.cookie || "")
        .split(";")
        .filter(Boolean)
        .map((cookie) => {
          const [key, ...value] = cookie.trim().split("=")
          return [key, decodeURIComponent(value.join("="))]
        })
    )

    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : cookies.eventflow_token

    if (!token) {
      return res.status(401).json({ message: "Du må logge inn først." })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id).lean()

    if (!user) {
      return res.status(401).json({ message: "Du har ikke tilgang." })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ message: "Innloggingen er utløpt. Logg inn på nytt." })
  }
}

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Du har ikke tilgang til denne handlingen." })
    }
    next()
  }
}