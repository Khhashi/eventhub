import request from "supertest"
import jwt from "jsonwebtoken"
import app from "../app.js"
import User from "../models/User.js"
import { connectTestDB, disconnectTestDB } from "./setupTestDB.js"

describe("Profile", () => {
  let user
  let token

  beforeAll(async () => {
    user = await User.create({
      name: "Profile User",
      email: "profile@test.com",
      password: "password123",
      role: "user",
    })

    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
  })

  it("returns 401 without token", async () => {
    const res = await request(app).get("/api/auth/profile")
    expect(res.status).toBe(401)
  })

  it("returns profile with valid token", async () => {
    const res = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe("profile@test.com")
    expect(res.body.user).not.toHaveProperty("password")
    expect(res.body).not.toHaveProperty("password")
    expect(res.body).not.toHaveProperty("email")
  })

  it("returns only safe user fields from the current-user endpoint", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      _id: user._id.toString(),
      name: "Profile User",
      email: "profile@test.com",
      role: "user",
    })
    expect(res.body).not.toHaveProperty("password")
    expect(res.body).not.toHaveProperty("googleId")
  })
})