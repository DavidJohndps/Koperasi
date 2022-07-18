const { model, Schema } = require("mongoose");

const taxSchema = new Schema(
  {
    name: String,
    nptn: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    dueDate: String,
  },
  { timestamps: true }
);

const assetSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    boughtSince: {
      type: String,
      required: true,
    },
    boughtPrice: {
      type: Number,
      required: true,
    },
    depCategory: {
      type: Number,
      required: true,
    },
    depAmount: Number,
    timePeriod: String,
    desc: String,
  },
  { timestamps: true }
);

const companySchema = new Schema(
  {
    name: String,
    npwp: String,
    balance: Number,
    revenue: Number,
    netProfit: Number,
    propertyAsset: [assetSchema],
    tangibleAsset: [assetSchema],
    intangibleAsset: [assetSchema],
    taxReport: [taxSchema],
  },
  { timestamps: true }
);

module.exports = model("CompanyDetail", companySchema);
