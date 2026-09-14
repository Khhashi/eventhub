import request from "supertest"
import jwt from "jsonwebtoken"
import app from "../app.js"
import User from "../models/User.js"
import Event from "../models/Event.js"
import { connectTestDB, disconnectTestDB } from "./setupTestDB.js"

describe("Events", () => {
  let organizer
  let user
  let admin

  let organizerToken
  let userToken
  let adminToken

  let eventId

  beforeAll(async () => {
    organizer = await User.create({
      name: "Organizer",
      email: "organizer@test.com",
      password: "password123",
      role: "organizer",
    })

    user = await User.create({
      name: "User",
      email: "user@test.com",
      password: "password123",
      role: "user",
    })

    admin = await User.create({
      name: "Admin",
      email: "admin@test.com",
      password: "password123",
      role: "admin",
    })

    organizerToken = jwt.sign({ id: organizer._id }, process.env.JWT_SECRET)
    userToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
    adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET)
  })

  it("returns 401 without token", async () => {
    const res = await request(app).get("/events")
    expect(res.status).toBe(401)
  })

  it("organizer can create event", async () => {
    const res = await request(app)
      .post("/events")
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({
        title: "New Event",
        description: "Test description",
        date: new Date(),
        category: "Tech",
        location: "Oslo",
      })

    expect(res.status).toBe(201)
    expect(res.body.title).toBe("New Event")

    eventId = res.body._id
  })

  it("does not allow protected event fields to be changed", async () => {
    const res = await request(app)
      .put(`/events/${eventId}`)
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({
        title: "Updated Event",
        createdBy: user._id,
        attendees: [user._id],
      })

    expect(res.status).toBe(200)
    expect(res.body.title).toBe("Updated Event")
    expect(res.body.createdBy._id).toBe(organizer._id.toString())
    expect(res.body.attendees).toHaveLength(0)
  })

  it("user cannot create event", async () => {
    const res = await request(app)
      .post("/events")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        title: "Another Event",
        description: "Test description",
        date: new Date(),
        category: "Tech",
        location: "Oslo",
      })

    expect(res.status).toBe(403)
  })

  it("admin can delete event", async () => {
    const res = await request(app)
      .delete(`/events/${eventId}`)
      .set("Authorization", `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
  })

  it("user can register for event", async () => {
    const event = await Event.create({
      title: "Register Event",
      description: "Description",
      date: new Date(),
      category: "Music",
      location: "Bergen",
      createdBy: organizer._id,
    })

    const res = await request(app)
      .post(`/events/${event._id}/register`)
      .set("Authorization", `Bearer ${userToken}`)

    expect(res.status).toBe(200)
    expect(res.body.attendees.length).toBe(1)
  })

  it("user cannot register twice", async () => {
    const event = await Event.create({
      title: "Double Register Event",
      description: "Description",
      date: new Date(),
      category: "Art",
      location: "Trondheim",
      createdBy: organizer._id,
      attendees: [user._id],
    })

    const res = await request(app)
      .post(`/events/${event._id}/register`)
      .set("Authorization", `Bearer ${userToken}`)

    expect(res.status).toBe(400)
  })

  it("returns 404 if event not found when deleting", async () => {
    const fakeId = "507f1f77bcf86cd799439011"

    const res = await request(app)
      .delete(`/events/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`)

    expect(res.status).toBe(404)
  })
})