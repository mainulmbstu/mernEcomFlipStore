const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId, // or mongoose.ObjectId
      ref: "Category", //collection name in mongoose.model('Category', categorySchema)
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", //collection name in mongoose.model('User', userSchema)
      required: true,
    },

    banners: [
      {
        secure_url: { type: String, required: true },
         public_id: { type: String, required: true },
      },
    ],
    products: [
      {
        secure_url: { type: String},
         public_id: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const PageModel = mongoose.model("Page", pageSchema);

module.exports =  PageModel ;
