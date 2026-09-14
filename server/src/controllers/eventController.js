import Event from "../models/Event.js"
import { getIO } from "../socket.js"

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("createdBy", "name picture email")
      .populate("attendees", "name picture email")
      .sort({ date: 1 })

    res.status(200).json(events)
  } catch {
    res.status(500).json({
      message: "Kunne ikke hente arrangementer",
    })
  }
}

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("createdBy", "name picture email")
      .populate("attendees", "name picture email")

    if (!event) {
      return res.status(404).json({
        message: "Arrangement ikke funnet",
      })
    }

    res.status(200).json(event)
  } catch {
    res.status(500).json({
      message: "Serverfeil ved henting",
    })
  }
}

export const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, category } = req.body

    if (!title || !description || !date || !location || !category) {
      return res.status(400).json({
        message: "Alle felt må fylles ut",
      })
    }

    const existing = await Event.findOne({ title })
    if (existing) {
      return res.status(400).json({
        message: "Det finnes allerede et arrangement med denne tittelen.",
      })
    }

    const event = await Event.create({
      title,
      description,
      date,
      location,
      category,
      createdBy: req.user._id,
      attendees: [],
    })

    const populated = await event.populate(
      "createdBy",
      "name picture email"
    )

    const io = getIO()
    if (io) io.emit("eventCreated", populated)

    res.status(201).json(populated)
  } catch {
    res.status(500).json({
      message: "Kunne ikke opprette arrangement",
    })
  }
}

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)

    if (!event) {
      return res.status(404).json({
        message: "Arrangement ikke funnet",
      })
    }

    if (
      event.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Ingen tilgang",
      })
    }

    const editableFields = [
      "title",
      "description",
      "date",
      "location",
      "category",
    ]

    for (const field of editableFields) {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field]
      }
    }

    await event.save()

    const populated = await event.populate(
      "createdBy",
      "name picture email"
    )

    const io = getIO()
    if (io) io.emit("eventUpdated", populated)

    res.status(200).json(populated)
  } catch {
    res.status(500).json({
      message: "Kunne ikke oppdatere",
    })
  }
}

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)

    if (!event) {
      return res.status(404).json({
        message: "Arrangement ikke funnet",
      })
    }

    if (
      event.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Ingen tilgang",
      })
    }

    await event.deleteOne()

    const io = getIO()
    if (io) io.emit("eventDeleted", req.params.id)

    res.status(200).json({
      message: "Arrangement slettet",
    })
  } catch {
    res.status(500).json({
      message: "Kunne ikke slette",
    })
  }
}


export const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)

    if (!event) {
      return res.status(404).json({
        message: "Arrangement ikke funnet",
      })
    }

    const alreadyRegistered = event.attendees.some(
      (id) => id.toString() === req.user._id.toString()
    )

    if (alreadyRegistered) {
      return res.status(400).json({
        message: "Du er allerede registrert.",
      })
    }

    event.attendees.push(req.user._id)
    await event.save()

    const populated = await Event.findById(event._id)
      .populate("createdBy", "name picture email")
      .populate("attendees", "name picture email")

    const io = getIO()
    if (io) io.emit("eventRegistrationUpdated", populated)

    res.status(200).json(populated)
  } catch {
    res.status(500).json({
      message: "Kunne ikke registrere",
    })
  }
}

export const unregisterFromEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)

    if (!event) {
      return res.status(404).json({
        message: "Arrangement ikke funnet",
      })
    }

    event.attendees = event.attendees.filter(
      (id) => id.toString() !== req.user._id.toString()
    )

    await event.save()

    const populated = await Event.findById(event._id)
      .populate("createdBy", "name picture email")
      .populate("attendees", "name picture email")

    const io = getIO()
    if (io) io.emit("eventRegistrationUpdated", populated)

    res.status(200).json(populated)
  } catch {
    res.status(500).json({
      message: "Kunne ikke avregistrere",
    })
  }
}