const DataLoader = require("dataloader");
const { groupBy, map } = require("lodash");
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
    const groupedDocs = groupBy(docs, (doc) => doc.id)
    return map(ids, (id) => groupedDocs[id])
  }),
  productLoader: new DataLoader(async (ids) => {
    const docs = await Product.find({ _id: { $in: ids } });
    const groupedDocs = groupBy(docs, (doc) => doc.id)
    return map(ids, (id) => groupedDocs[id])
  }),
  transactionLoader: new DataLoader(async (ids) => {
    const docs = await Transaction.find({ _id: { $in: ids } });
    const groupedDocs = groupBy(docs, (doc) => doc.id)
    return map(ids, (id) => groupedDocs[id])
  })
};

module.exports = dataLoaders;
