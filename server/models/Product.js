const { model, Schema } = require("mongoose");

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    desc: String,
    stock: {
      type: Number,
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
    },
    profit: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("Products", productSchema);
