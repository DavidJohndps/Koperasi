const { model, Schema } = require("mongoose");

const reportSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    nptn: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    isPaid: Boolean,
    dueDate: String,
  },
  { timestamps: true }
);

const taxSchema = new Schema(
  {
    report: [reportSchema],
  },
  { timestamps: true }
);

module.exports = model("TaxReport", taxSchema);
