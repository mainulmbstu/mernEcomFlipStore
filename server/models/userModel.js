const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true },
    storeName: { type: String, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    role: { type: String, default: "user" },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);



module.exports=UserModel