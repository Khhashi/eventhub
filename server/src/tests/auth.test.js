import request from "supertest"
import app from "../app.js"
import User from "../models/User.js"
import { connectTestDB, disconnectTestDB } from "./setupTestDB.js"

describe("Auth", () => {
  it("registers user", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      })

    expect(res.status).toBe(201)
    expect(res.body.token).toBeDefined()
  })

  it("does not allow registration to assign an elevated role", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        name: "Untrusted User",
        email: "untrusted@example.com",
        password: "password123",
        role: "admin",
      })

    expect(res.status).toBe(201)
    expect(res.body.role).toBe("user")

    const user = await User.findOne({ email: "untrusted@example.com" })
    expect(user.role).toBe("user")
  })

  it("fails login with wrong credentials", async () => {
    await User.create({
      name: "Test User",
      email: "wrong@example.com",
      password: "password123",
    })

    const res = await request(app)
      .post("/auth/login")
      .send({
        email: "wrong@example.com",
        password: "wrongpass",
      })

    expect(res.status).toBe(401)
  })
})