import Event from "../models/Event.js"

export async function getProfile(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const organizedEvents = await Event.find({
      organizer: req.user._id
    })

    const registeredEvents = await Event.find({
      attendees: req.user._id
    })

    res.status(200).json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      organizedEvents,
      registeredEvents
    })
  } catch (err) {
    res.status(500).json({ message: "En intern serverfeil oppstod." })
  }
}