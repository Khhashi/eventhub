import express from "express"
import jwt from "jsonwebtoken"
import { OAuth2Client } from "google-auth-library"
import User from "../models/User.js"
import Event from "../models/Event.js"
import { protect } from "../middleware/authMiddleware.js"
import {
  registerUser,
  loginUser,
} from "../controllers/authController.js"

const router = express.Router()

const CLIENT_URL =
  process.env.CLIENT_URL || "http://localhost:5173"

const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  "http://localhost:3000/api/auth/google/callback"

const isPlaceholderGoogleValue = (value) =>
  typeof value !== "string" ||
  value.trim() === "" ||
  value.includes("your-google")

const requireGoogleConfig = () => {
  if (
    isPlaceholderGoogleValue(process.env.GOOGLE_CLIENT_ID) ||
    isPlaceholderGoogleValue(process.env.GOOGLE_CLIENT_SECRET)
  ) {
    throw new Error(
      "Google-innlogging er ikke konfigurert. Legg inn gyldig Google-konfigurasjon i server/.env."
    )
  }
}

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
)

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  })
}


router.post("/register", registerUser)
router.post("/login", loginUser)

router.post("/logout", (req, res) => {
  res.clearCookie("eventflow_token", { httpOnly: true, sameSite: "lax" })
  res.status(204).end()
})

router.get("/me", protect, (req, res) => {
  res.json(req.user)
})

router.get("/profile", protect, async (req, res) => {
  try {
    const createdEvents = await Event.find({
      createdBy: req.user._id,
    })

    const registeredEvents = await Event.find({
      attendees: req.user._id,
    })

    const profile = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      picture: req.user.picture,
      user: req.user,
      createdEvents,
      registeredEvents,
    }

    res.json(profile)
  } catch {
    res.status(500).json({ message: "En feil oppstod på serveren." })
  }
})

router.get("/google", (req, res) => {
  try {
    requireGoogleConfig()

    const url = client.generateAuthUrl({
      access_type: "offline",
      scope: ["profile", "email"],
      redirect_uri: GOOGLE_REDIRECT_URI,
    })

    return res.redirect(url)
  } catch (error) {
    console.error("Google OAuth config error:", error.message)
    return res.status(500).json({
      message:
        "Google-innlogging er ikke konfigurert. Legg inn gyldig Google-konfigurasjon i server/.env.",
    })
  }
})

router.get("/google/callback", async (req, res) => {
  try {
    requireGoogleConfig()

    const { code } = req.query

    if (!code) {
      return res.redirect(`${CLIENT_URL}/login`)
    }

    const { tokens } = await client.getToken({
      code,
      redirect_uri: GOOGLE_REDIRECT_URI,
    })

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    const { sub, email, name, picture } = payload

    let user = await User.findOne({ googleId: sub })

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId: sub,
        role: "organizer",
        picture,
      })
    }

    const token = generateToken(user._id)

    res.cookie("eventflow_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    })

    return res.redirect(`${CLIENT_URL}/events`)
  } catch (err) {
    console.error("Google auth error:", err)
    return res.redirect(`${CLIENT_URL}/login`)
  }
})

export default router