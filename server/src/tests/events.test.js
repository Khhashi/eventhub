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

  it("lists events without login", async () => {
    const res = await request(app).get("/api/events")
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it("organizer can create event", async () => {
    const res = await request(app)
      .post("/api/events")
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
    expect(res.body.createdBy).not.toHaveProperty("email")

    eventId = res.body._id
  })

  it("public event responses omit organizer and attendee emails", async () => {
    const event = await Event.create({
      title: "Private Contact Event",
      description: "Description",
      date: new Date(),
      category: "Tech",
      location: "Oslo",
      createdBy: organizer._id,
      attendees: [user._id],
    })

    const [listResponse, detailResponse] = await Promise.all([
      request(app).get("/api/events"),
      request(app).get(`/api/events/${event._id}`),
    ])

    const listedEvent = listResponse.body.find((item) => item._id === event._id.toString())

    expect(listResponse.status).toBe(200)
    expect(listedEvent.createdBy).not.toHaveProperty("email")
    expect(listedEvent.attendees[0]).not.toHaveProperty("email")

    expect(detailResponse.status).toBe(200)
    expect(detailResponse.body.createdBy).not.toHaveProperty("email")
    expect(detailResponse.body.attendees[0]).not.toHaveProperty("email")
  })

  it("does not allow protected event fields to be changed", async () => {
    const res = await request(app)
      .put(`/api/events/${eventId}`)
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({
        title: "Updated Event",
        createdBy: user._id,
        attendees: [user._id],
      })

    expect(res.status).toBe(200)
    expect(res.body.title).toBe("Updated Event")
    expect(res.body.createdBy._id).toBe(organizer._id.toString())
    expect(res.body.createdBy).not.toHaveProperty("email")
    expect(res.body.attendees).toHaveLength(0)
  })

  it("user cannot create event", async () => {
    const res = await request(app)
      .post("/api/events")
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
      .delete(`/api/events/${eventId}`)
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
      .post(`/api/events/${event._id}/register`)
      .set("Authorization", `Bearer ${userToken}`)

    expect(res.status).toBe(200)
    expect(res.body.attendees.length).toBe(1)
    expect(res.body.createdBy).not.toHaveProperty("email")
    expect(res.body.attendees[0]).not.toHaveProperty("email")
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
      .post(`/api/events/${event._id}/register`)
      .set("Authorization", `Bearer ${userToken}`)

    expect(res.status).toBe(400)
  })

  it("returns 404 if event not found when deleting", async () => {
    const fakeId = "507f1f77bcf86cd799439011"

    const res = await request(app)
      .delete(`/api/events/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`)

    expect(res.status).toBe(404)
  })
})