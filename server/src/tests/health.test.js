import { describe, it, expect } from "vitest"
import request from "supertest"
import express from "express"
import errorHandler from "../middleware/errorHandler.js"

describe("Error handler", () => {
  it("returns custom status and message", async () => {
    const app = express()

    app.get("/error", (req, res, next) => {
      const err = new Error("Custom error")
      err.status = 418
      next(err)
    })

    app.use(errorHandler)

    const res = await request(app).get("/error")

    expect(res.status).toBe(418)
    expect(res.body.message).toBe("Custom error")
  })

  it("returns 500 and default message", async () => {
    const app = express()

    app.get("/error", (req, res, next) => {
      next(new Error())
    })

    app.use(errorHandler)

    const res = await request(app).get("/error")

    expect(res.status).toBe(500)
    expect(res.body.message).toBe("En intern serverfeil oppstod.")
  })
})