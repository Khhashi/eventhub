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
    const res = await request(app).get("/profile")
    expect(res.status).toBe(401)
  })

  it("returns profile with valid token", async () => {
    const res = await request(app)
      .get("/profile")
      .set("Authorization", `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.email).toBe("profile@test.com")
  })
})