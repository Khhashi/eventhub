import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"

process.env.JWT_SECRET = "test-secret"

let mongoServer

export async function connectTestDB() {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  await mongoose.connect(uri)
}

export async function disconnectTestDB() {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongoServer.stop()
}