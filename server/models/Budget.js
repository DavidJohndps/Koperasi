const { model, Schema } = require("mongoose");

const expenseSchema = new Schema(
  {
    user: {
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

module.exports = model("Budgets", expenseSchema);
