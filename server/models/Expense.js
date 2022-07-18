const { model, Schema, models } = require("mongoose");

const expenseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    expCategory: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    verBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("Expenses", expenseSchema);
