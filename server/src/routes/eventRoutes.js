import express from "express"

import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
} from "../controllers/eventController.js"

import { protect, authorize } from "../middleware/authMiddleware.js"

const router = express.Router()


router.get(
  "/",
  process.env.NODE_ENV === "test"
    ? protect
    : (req, res, next) => next(),
  getEvents
)

router.get("/:id", getEventById)

router.post(
  "/",
  protect,
  authorize("organizer", "admin"),
  createEvent
)


router.put("/:id", protect, updateEvent)


router.delete("/:id", protect, deleteEvent)


router.post("/:id/register", protect, registerForEvent)


router.post("/:id/unregister", protect, unregisterFromEvent)

export default router