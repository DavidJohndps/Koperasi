const { model, Schema } = require("mongoose");

const assetSchema = new Schema(
  {
    name: String,
    assetCode: String,
    boughtSince: String,
    boughtPrice: Number,
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
    asset: [assetSchema],
  },
  { timestamps: true }
);

module.exports = model("CompanyDetail", companySchema);
