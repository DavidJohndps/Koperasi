const DataLoader = require("dataloader");
const { groupBy, map } = require("lodash");
const moment = require("moment");
const ExpenseCategory = require("./models/ExpenseCategory");
const Product = require("./models/Product");
const Transaction = require("./models/Transaction");

const User = require("./models/User");

const dataLoaders = {
  //   taskLoader: new DataLoader(async (id) => {
  //     const docs = await Task.find({ projectId: id });
  //     const groupedDocs = groupBy(docs, (doc) => doc.projectId);
  //     return map(id, (projectId) => groupedDocs[projectId]);
  //   }),
  userLoader: new DataLoader(async (ids) => {
    const docs = await User.find({ _id: { $in: ids } });
    const groupedDocs = groupBy(docs, (doc) => doc.id);
    return map(ids, (id) => groupedDocs[id]);
  }),
  productLoader: new DataLoader(async (ids) => {
    const docs = await Product.find({ _id: { $in: ids } });
    const groupedDocs = groupBy(docs, (doc) => doc.id);
    return map(ids, (id) => groupedDocs[id]);
  }),
  expCategoryLoader: new DataLoader(async (ids) => {
    const docs = await ExpenseCategory.find({ _id: { $in: ids } });
    const groupedDocs = groupBy(docs, (doc) => doc.id);
    return map(ids, (id) => groupedDocs[id]);
  }),
  // assetLoader: new DataLoader(async (ids) => {
  //   const docs = await Asset.find({ _id: { $in: ids } });
  //   const groupedDocs = groupBy(docs, (doc) => doc.id)
  //   return map(ids, (id) => groupedDocs[id])
  // }),
  transactionLoader: new DataLoader(async ([startDate]) => {
    const endDate = moment(startDate).add({ month: 1 }).set({ date: 0 });
    let docs = await Transaction.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate.toDate(),
            $lte: endDate.toDate(),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          total: { $sum: "$total" },
        },
      },
    ]);
    docs = docs.map((doc) => {
      doc._id = startDate.format("YYYY-MM-DD");
      doc.startDate = doc._id
      return doc;
    });
    const groupedDocs = groupBy(docs, (doc) => {
      if (moment(doc._id).isSameOrBefore(endDate, "D")) return startDate;
    });
    return map([startDate], (date) => groupedDocs[date]);
  }),
};

module.exports = dataLoaders;
