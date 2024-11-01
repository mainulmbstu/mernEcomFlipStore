const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        type: Object // or mongoose.ObjectId
        // ref: "Product",
      },
    ],
    total:Number,
    payment: {
    payment_id:{type:String},
    payment_method:{type:Object},
    trxn_id:{type:String},
    status:{type:Boolean, default:false}
    },

    user: {
      type: mongoose.Schema.Types.ObjectId, // or mongoose.ObjectId
      ref: "User", //collection name in mongoose.model('Category', categorySchema)
    },
    status: {
      type: String,
      default: "Not Process",
      enum: ["Not Process", "Processing", "shipped", "delivered", "cancelled"],
    },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model("Order", orderSchema);

module.exports = OrderModel ;
