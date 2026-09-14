import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "organizer", "admin"],
      default: "user",
    },
    googleId: {
      type: String,
    },
    picture: {
      type: String, 
    },
  },
  { timestamps: true }
)

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false
  return await bcrypt.compare(enteredPassword, this.password)
}

export default mongoose.model("User", userSchema)