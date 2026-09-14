import jwt from "jsonwebtoken"
import User from "../models/User.js"

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined")
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  })
}

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Fyll ut alle feltene." })
    }

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(400).json({ message: "Det finnes allerede en bruker med denne e-postadressen." })
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "user",
    })

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      picture: user.picture,
      token: generateToken(user._id),
    })
  } catch (error) {
    res.status(500).json({ message: "En feil oppstod på serveren." })
  }
}

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: "E-post og passord er påkrevd.",
      })
    }

    const user = await User.findOne({ email })

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: "E-post eller passord er feil.",
      })
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      picture: user.picture,
      token: generateToken(user._id),
    })
  } catch (error) {
    res.status(500).json({ message: "En feil oppstod på serveren." })
  }
}