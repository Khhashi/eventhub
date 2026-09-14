import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"

process.env.JWT_SECRET = "test-secret"

let mongoServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()

  await mongoose.connect(uri)
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongoServer.stop()
})