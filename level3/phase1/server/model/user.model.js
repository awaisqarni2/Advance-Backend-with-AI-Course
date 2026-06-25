import mongoose from "mongoose";

const userSchema = await mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
