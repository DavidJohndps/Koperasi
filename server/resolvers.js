const { ApolloError } = require("apollo-server-core");
const { GraphQLScalarType, Kind } = require("graphql");
const { GraphQLUpload } = require("graphql-upload");
const { sign } = require("jsonwebtoken");
const Crypto = require("crypto-js");
const { flatten, isEmpty, round } = require("lodash");
const moment = require("moment");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const User = require("./models/User");
const Product = require("./models/Product");
const Transaction = require("./models/Transaction");
const Activity = require("./models/Activity");
const CompanyDetail = require("./models/CompanyDetail");
const Expense = require("./models/Expense");
const ExpenseCategory = require("./models/ExpenseCategory");
const Budget = require("./models/Budget");

checkEmail = async (email) => {
  try {
    const isTaken = await User.findOne({ email: email });
    if (isTaken !== null) return true;
    return false;
  } catch (err) {
    console.error(err);
  }
};

setExpires = (minute) => {
  return new Date(Date.now() + minute * 60000);
};

reauthenticate = async (requestUserId, email, password) => {
  try {
    const user = await User.find({ email: email });

    const decryptedPassword = Crypto.AES.decrypt(
      user.password,
      SECRET_KEY
    ).toString(Crypto.enc.Utf8);

    if (decryptedPassword !== password || requestUserId !== user.id)
      return false;

    return true;
  } catch (err) {
    console.error(err);
  }
};

createActivity = async (
  beforeChanges,
  afterChanges,
  { userId },
  session = null
) => {
  try {
    const { _doc: before, constuctor: beforeConstructor } = beforeChanges || {};
    const { _doc: after, constructor: afterConstructor } = afterChanges || {};
    const { modelName = null } = beforeConstructor || afterConstructor || {};
    const {
      _id: beforeId = null,
      createdAt: beforeCreated = null,
      updatedAt: beforeUpdated = null,
      __v: beforeVersion = null,
      ...beforeDetails
    } = before || beforeChanges || {};
    const {
      _id: afterId = null,
      createdAt: afterCreated = null,
      updatedAt: afterUpdated = null,
      __v: afterVersion = null,
      ...afterDetails
    } = after || afterChanges || {};
    const name = `${
      !isEmpty(beforeDetails) && !isEmpty(afterDetails)
        ? `Updated ${afterDetails.name} (${modelName})`
        : isEmpty(beforeDetails) && !isEmpty(afterDetails)
        ? `New ${afterDetails.name || "Transaction"} (${
            modelName || "Transactions"
          })`
        : `Deleted ${beforeDetails.name} ${modelName ? modelName : 'Unknown'}`
    }`;

    const changes = (before) => {
      const entries = Object.entries(before);
      const result = entries.filter(
        ([key, values]) => values != afterDetails[key]
      );
      const obj = Object.fromEntries(result);
      return Object.keys(obj).map(
        (key) => `"${key}": "${before[key]} to ${afterDetails[key]}"`
      );
    };

    const desc = `${
      !isEmpty(beforeDetails) && !isEmpty(afterDetails)
        ? `Changes: ${changes(beforeDetails)}`
        : isEmpty(beforeDetails) && !isEmpty(afterDetails)
        ? `Added: ${Object.keys(afterDetails).map(
            (key) => `"${key}": ${JSON.stringify(afterDetails[key])}`
          )}`
        : `Deleted`
    }`;
    const result = await Activity.create([{ name, desc, verBy: userId }], {
      session: session || null,
    });
    return result;
  } catch (err) {
    console.log(err);
  }
};

const resolvers = {
  Upload: GraphQLUpload,

  PROPERTYASSET: {
    Permanen: 0,
    TidakPermanen: 1,
  },

  TANGIBLEASSET: {
    Kelompok1: 0,
    Kelompok2: 1,
    Kelompok3: 2,
    Kelompok4: 3,
  },

  INTANGIBLEASSET: {
    Kelompok1: 0,
    Kelompok2: 1,
    Kelompok3: 2,
    Kelompok4: 3,
  },

  Budget: {
    user: async ({ user }, arg, { userLoader }) => {
      const [result] = await userLoader.load(user);
      return result;
    },
    verBy: async ({ verBy }, arg, { userLoader }) => {
      const [result] = await userLoader.load(verBy);
      return result;
    },
  },

  Expense: {
    expCategory: async ({ expCategory }, arg, { expCategoryLoader }) => {
      const [result] = await expCategoryLoader.load(expCategory);
      return result;
    },
    verBy: async ({ verBy }, arg, { userLoader }) => {
      const [result] = await userLoader.load(verBy);
      return result;
    },
  },

  Transaction: {
    product: async ({ product }, arg, { productLoader }) => {
      const result = await productLoader.loadMany(product);
      return flatten(result);
    },
    verBy: async ({ verBy }, arg, { userLoader }) => {
      const [result] = await userLoader.load(verBy);
      return result;
    },
  },

  Activity: {
    verBy: async ({ verBy }, arg, { userLoader }) => {
      const [result] = await userLoader.load(verBy);
      return result;
    },
  },
  Query: {
    CompanyDetails: async (parent, params, args) => {
      const { req } = args;
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");
        const [doc] = await CompanyDetail.find();

        return {
          ok: true,
          companyDetail: doc,
        };
      } catch ({ message }) {
        return {
          ok: false,
          error: {
            message,
          },
        };
      }
    },
    Users: async (parent, params, { req }) => {
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const docs = await User.find();

        return {
          ok: true,
          user: docs,
        };
      } catch ({ message }) {
        return {
          ok: false,
          error: {
            message,
          },
        };
      }
    },
    ExpenseCategories: async (parent, params, { req }) => {
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const doc = await ExpenseCategory.find();

        return {
          ok: true,
          expCategory: doc,
        };
      } catch ({ message }) {
        return {
          ok: false,
          error: {
            message,
          },
        };
      }
    },
    Budgets: async (parent, params, { req }) => {
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const doc = await Budget.find().sort({ createdAt: "desc" });

        return {
          ok: true,
          budget: doc,
        };
      } catch ({ message }) {
        return {
          ok: false,
          error: {
            message,
          },
        };
      }
    },
    Expenses: async (parent, params, { req }) => {
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const doc = await Expense.find().sort({ createdAt: "desc" });

        return {
          ok: true,
          expense: doc,
        };
      } catch ({ message }) {
        return {
          ok: false,
          error: {
            message,
          },
        };
      }
    },
    Products: async (parent, { input, stock, sort }, { req }) => {
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const result =
          stock && sort
            ? await Product.where("stock").lte(stock).sort({ stock: sort })
            : input
            ? await Product.find({ name: { $regex: input, $options: "i" } })
            : sort
            ? await Product.find().sort({ updatedAt: sort })
            : await Product.find();

        return {
          ok: true,
          product: result,
        };
      } catch ({ message }) {
        return {
          ok: false,
          error: {
            message,
          },
        };
      }
    },
    Transactions: async (parent, { isRecent, sort = "desc" }, { req }) => {
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const d = new Date();
        const day = d.getUTCDate(),
          month = d.getUTCMonth(),
          year = d.getUTCFullYear();

        const date = new Date(year, month, day);

        if (!isRecent)
          return {
            ok: true,
            transaction: await Transaction.find().sort({ createdAt: sort }),
          };

        if (isRecent)
          return {
            ok: true,
            transaction: await Transaction.where("createdAt")
              .gte(date)
              .lte(new Date().setDate(date.getDate() + 1))
              .sort({ createdAt: sort }),
          };
      } catch ({ message }) {
        return {
          ok: false,
          error: {
            message,
          },
        };
      }
    },
    Activities: async (parent, { isRecent, sort }, { req }) => {
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const d = new Date();
        const day = d.getUTCDate(),
          month = d.getUTCMonth(),
          year = d.getUTCFullYear();

        const date = new Date(year, month, day);
        const doc =
          isRecent && sort
            ? await Activity.where("createdAt")
                .gte(date)
                .lte(new Date().setDate(date.getDate() + 1))
                .sort({ createdAt: sort })
            : sort
            ? await Activity.find().sort({ createdAt: sort })
            : await Activity.find();

        return {
          ok: true,
          activity: doc,
        };
      } catch ({ message }) {
        return {
          ok: false,
          error: {
            message,
          },
        };
      }
    },
    MonthlyIncomes: async (
      parent,
      { startDate },
      { req, transactionLoader }
    ) => {
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const ft = moment(startDate).set({
          date: 1,
          h: 0,
          minute: 0,
          s: 0,
          ms: 0,
        });
        const now = moment();
        const timeLapsed = now.diff(ft, "year");
        if (timeLapsed >= 1) ft.add({ year: timeLapsed });
        let result = [];
        for (var i = 0; i <= 11; i++) {
          const som = moment(ft);
          const data = await transactionLoader.load(som);
          data
            ? result.push(data[0])
            : result.push({ startDate: som.format("YYYY-MM-DD"), total: 0 });
          ft.add({ month: 1 });
        }

        return {
          ok: true,
          monthlyIncome: result,
        };
      } catch ({ message }) {
        return {
          ok: false,
          error: {
            message,
          },
        };
      }
    },
  },
  Mutation: {
    async singleUpload(parent, { input }, { req }) {
      try {
        console.log("Single Upload Hit");
        console.log({ input });
      } catch (error) {
        console.log(err);
      }
    },
    async login(parent, { input }, { res }) {
      try {
        const { email, password } = input;
        const user = await User.findOne({ email: email });

        const decryptedPassword = Crypto.AES.decrypt(
          user.password,
          SECRET_KEY
        ).toString(Crypto.enc.Utf8);

        if (password !== decryptedPassword)
          throw new ApolloError("Wrong Password", 403);

        const accessToken = sign(
          { userId: user.id, position: user.position },
          ACCESS_TOKEN_SECRET,
          {
            expiresIn: "2h",
          }
        );

        const refreshToken = sign(
          { userId: user.id, email: user.email },
          REFRESH_TOKEN_SECRET,
          { expiresIn: "7d" }
        );

        res.cookie("accessToken", accessToken, { expires: setExpires(60) });
        res.cookie("refreshToken", refreshToken, {
          expires: setExpires(24 * 60),
        });

        return {
          ok: true,
          user: [Object.assign(user, { accessToken: accessToken })],
        };
      } catch ({ message }) {
        console.log(message);
        return {
          ok: false,
          error: {
            message,
          },
        };
      }
    },
    async createUser(parent, { input }, { req }) {
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        let { password } = input;
        password = Crypto.AES.encrypt(password, SECRET_KEY).toString();

        const doc = await User.create({ ...input, password });

        return {
          ok: true,
          user: [doc],
        };
      } catch ({ message }) {
        return {
          ok: false,
          error: {
            message,
          },
        };
      }
    },
    async updateUser(parent, { input }, { req }) {
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const { id, ...inputted } = input;
        let { password } = inputted;
        const doc = await User.findById(id);

        Object.keys(inputted).map((key) => {
          if (key == "password")
            doc[key] = Crypto.AES.encrypt(password, SECRET_KEY).toString();
          else doc[key] = inputted[key];
        });
        console.log(doc);

        const result = await doc.save();

        return {
          ok: true,
          user: [result],
        };
      } catch ({ message }) {
        return {
          ok: false,
          error: {
            message,
          },
        };
      }
    },
    async createProduct(parent, { input }, { req, db }) {
      const session = await db.startSession();
      session.startTransaction();
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const { companyDetailId, id, ...productInput } = input;

        const { basePrice, stock } = productInput;

        const [doc] = await Product.create([{ ...productInput }], {
          session: session,
        });
        await CompanyDetail.findByIdAndUpdate(
          { _id: companyDetailId },
          {
            $inc: {
              balance: -round(parseFloat(basePrice) * parseFloat(stock), 2),
            },
          },
          { session: session }
        );
        await createActivity(null, doc, req.userId, session);

        await session.commitTransaction();
        await session.endSession();

        return {
          ok: true,
          product: [doc],
        };
      } catch (err) {
        console.log(err.message);
        console.log(`all changes were rolled back, ${err}`);
        session.abortTransaction();
        return {
          ok: false,
          error: {
            message: err.message,
          },
        };
      }
    },
    async updateProduct(parent, { input }, { req, db }) {
      const session = await db.startSession();
      session.startTransaction();
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const { companyDetailId, id, ...productInput } = input;

        const { basePrice, stock } = productInput;

        const doc = await Product.findById(id).session(session);
        const { basePrice: beforePrice, stock: beforeStock } = doc;

        const before = JSON.parse(JSON.stringify(doc));

        let difference =
          parseFloat(stock) * basePrice - parseFloat(beforeStock) * beforePrice;

        console.log(difference);

        Object.keys(productInput).map((key) => {
          doc[key] = productInput[key];
        });

        await createActivity(before, doc, req.userId, session);
        await CompanyDetail.findByIdAndUpdate(
          { _id: companyDetailId },
          {
            $inc: {
              balance: -round(difference, 2),
            },
          }
        );

        const result = await doc.save();

        await session.commitTransaction();
        await session.endSession();

        return {
          ok: true,
          product: [result],
        };
      } catch (err) {
        console.log(`all changes were rolled back, ${err}`);
        session.abortTransaction();
        return {
          ok: false,
          error: {
            message: err.message,
          },
        };
      }
    },
    async deleteProduct(parent, { id, companyDetailId }, { req, db }) {
      const session = await db.startSession();
      session.startTransaction();
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const result = await Product.findByIdAndDelete(id).session(session);
        const { stock, basePrice } = result;

        const before = JSON.parse(JSON.stringify(result));

        await CompanyDetail.findByIdAndUpdate(
          { _id: companyDetailId },
          {
            $inc: {
              balance: round(parseFloat(stock) * basePrice, 2),
            },
          },
          { session: session }
        );

        await createActivity(before, null, req.userId, session);
        await session.commitTransaction();
        await session.endSession();

        console.log("Transaction completed");

        return {
          ok: true,
          product: [result],
        };
      } catch (err) {
        session.abortTransaction();
        console.log(`all changes were rolled back, ${err}`);
        return {
          ok: false,
          error: {
            message: err.message,
          },
        };
      }
    },
    async createTransaction(parent, { input }, { req, db }) {
      const session = await db.startSession();
      session.startTransaction();
      try {
        const { companyDetailId, ...transactionInput } = input;
        const { product, qty, basePrice, profit, total } = transactionInput;
        const [doc] = await Transaction.create([{ ...input }], {
          session: session,
        });
        let productOps = [];
        let netProfit = 0;
        product.forEach((id, index) => {
          productOps.push({
            updateOne: {
              filter: { _id: id },
              update: { $inc: { stock: -qty[index] } },
              upsert: true,
            },
          });
          netProfit += round(
            basePrice[index] *
              (parseFloat(profit[index]) / 100) *
              parseFloat(qty[index]),
            2
          );
        });
        await CompanyDetail.findByIdAndUpdate(
          { _id: companyDetailId },
          {
            $inc: {
              balance: total,
              revenue: total,
              netProfit: netProfit,
            },
          },
          { session: session }
        );

        await Product.bulkWrite(productOps, { session: session });

        await session.commitTransaction();
        await session.endSession();
        console.log("Transaction completed");
        return {
          ok: true,
          transaction: [doc],
        };
      } catch (err) {
        console.log(`all changes were rolled back, ${err}`);
        session.abortTransaction();
        return {
          ok: false,
          error: {
            message: err.message,
          },
        };
      }
    },
    async createBudget(parent, { input }, { req, db }) {
      const session = await db.startSession();
      session.startTransaction();
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const { companyDetailId, id, ...budgetInput } = input;

        const { amount } = budgetInput;

        const [doc] = await Budget.create([{ ...budgetInput }], {
          session: session,
        });
        await CompanyDetail.findByIdAndUpdate(
          { _id: companyDetailId },
          {
            $inc: {
              balance: amount,
            },
          },
          { session: session }
        );
        await createActivity(null, doc, req.userId, session);

        await session.commitTransaction();
        await session.endSession();

        return {
          ok: true,
          budget: [doc],
        };
      } catch (err) {
        console.log(`all changes were rolled back, ${err}`);
        session.abortTransaction();
        return {
          ok: false,
          error: {
            message: err.message,
          },
        };
      }
    },
    async updateBudget(parent, { input }, { req, db }) {
      const session = await db.startSession();
      session.startTransaction();
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const { companyDetailId, id, ...budgetInput } = input;

        const { amount } = budgetInput;

        const doc = await Budget.findById(id).session(session);

        const before = JSON.parse(JSON.stringify(doc));

        let difference = 0;

        Object.keys(budgetInput).map((key) => {
          if (key == "amount") {
            difference +=
              amount > doc[key]
                ? -parseFloat(doc[key] - amount)
                : parseFloat(amount - doc[key]);
            doc[key] = amount;
          }
          doc[key] = budgetInput[key];
        });

        await createActivity(before, doc, req.userId, session);
        await CompanyDetail.findByIdAndUpdate(
          { _id: companyDetailId },
          {
            $inc: {
              balance: difference,
            },
          }
        );

        const result = await doc.save();

        await session.commitTransaction();
        await session.endSession();

        return {
          ok: true,
          budget: [result],
        };
      } catch (err) {
        console.log(`all changes were rolled back, ${err}`);
        session.abortTransaction();
        return {
          ok: false,
          error: {
            message: err.message,
          },
        };
      }
    },
    async createExpense(parent, { input }, { req, db }) {
      const session = await db.startSession();
      session.startTransaction();
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const { companyDetailId, id, ...expInput } = input;

        const { amount } = expInput;

        const [doc] = await Expense.create([{ ...expInput }], {
          session: session,
        });
        await CompanyDetail.findByIdAndUpdate(
          { _id: companyDetailId },
          {
            $inc: {
              balance: -amount,
            },
          },
          { session: session }
        );
        await createActivity(null, doc, req.userId, session);

        await session.commitTransaction();
        await session.endSession();

        return {
          ok: true,
          expense: [doc],
        };
      } catch (err) {
        console.log(`all changes were rolled back, ${err}`);
        session.abortTransaction();
        return {
          ok: false,
          error: {
            message: err.message,
          },
        };
      }
    },
    async updateExpense(parent, { input }, { req, db }) {
      const session = await db.startSession();
      session.startTransaction();
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const { companyDetailId, id, ...expInput } = input;

        const { amount } = expInput;

        const doc = await Expense.findById(id).session(session);

        const before = JSON.parse(JSON.stringify(doc));

        let difference = 0;

        Object.keys(expInput).map((key) => {
          if (key == "amount") {
            difference +=
              amount > doc[key]
                ? parseFloat(doc[key] - amount)
                : -parseFloat(amount - doc[key]);
            doc[key] = expInput[key];
          }
          doc[key] = expInput[key];
        });

        await createActivity(before, doc, req.userId, session);
        await CompanyDetail.findByIdAndUpdate(
          { _id: companyDetailId },
          {
            $inc: {
              balance: difference,
            },
          }
        );

        const result = await doc.save();

        await session.commitTransaction();
        await session.endSession();

        return {
          ok: true,
          expense: [result],
        };
      } catch (err) {
        console.log(`all changes were rolled back, ${err}`);
        session.abortTransaction();
        return {
          ok: false,
          error: {
            message: err.message,
          },
        };
      }
    },
    async createExpenseCategory(parent, { input }, { req }) {
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const { id, ...expCatInput } = input;
        const doc = await ExpenseCategory.create({ ...expCatInput });

        await createActivity(null, doc, req.userId);

        return {
          ok: true,
          expCategory: [doc],
        };
      } catch ({ message }) {
        console.log(message);
        return {
          ok: false,
          error: {
            message,
          },
        };
      }
    },
    async updateExpenseCategory(parent, { input }, { req }) {
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const { id, ...expCatInput } = input;

        const doc = await ExpenseCategory.findById(id);
        const before = JSON.parse(JSON.stringify(doc));
        Object.keys(expCatInput).map((key) => (doc[key] = expCatInput[key]));
        const result = await doc.save();

        await createActivity(before, doc, req.userId);

        return {
          ok: true,
          expCategory: [result],
        };
      } catch ({ message }) {
        console.log(message);
        return {
          ok: false,
          error: {
            message,
          },
        };
      }
    },
    async deleteExpenseCategory(parent, { id }, { req }) {
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const doc = await ExpenseCategory.findByIdAndDelete(id);

        return {
          ok: true,
          expCategory: [doc],
        };
      } catch (err) {
        console.log(err);
      }
    },
    async createPropertyAsset(parent, { input }, { req, db }) {
      const session = await db.startSession();
      session.startTransaction();
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const { companyDetailId, ...assetInput } = input;
        const { boughtPrice } = assetInput;
        const companyDetail = await CompanyDetail.findById(
          companyDetailId
        ).session(session);
        const asset = companyDetail.propertyAsset.create({ ...assetInput });
        const after = JSON.parse(JSON.stringify(asset));

        await CompanyDetail.findByIdAndUpdate(
          { _id: companyDetailId },
          {
            $inc: {
              balance: -boughtPrice,
            },
            $push: {
              tangibleAsset: asset,
            },
          },
          { session: session }
        );

        await createActivity(null, after, req.userId);

        await session.commitTransaction();
        await session.endSession();

        return {
          ok: true,
          propertyAsset: asset,
        };
      } catch (err) {
        session.abortTransaction();
        console.log(`all changes were rolled back, ${err}`);
        return {
          ok: false,
          error: {
            message: err.message,
          },
        };
      }
    },
    async updatePropertyAsset(parent, { input }, { req, db }) {
      const session = await db.startSession();
      session.startTransaction();
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const {
          id,
          companyDetailId,
          boughtPrice: afterUpdate,
          ...assetInput
        } = input;
        const companyDetail = await CompanyDetail.findById(
          companyDetailId
        ).session(session);
        const doc = companyDetail.propertyAsset.id(id);
        const { boughtPrice: beforeUpdate } = doc;
        const difference =
          beforeUpdate >= afterUpdate
            ? beforeUpdate - afterUpdate
            : -(afterUpdate - beforeUpdate);

        const before = JSON.parse(JSON.stringify(doc));

        Object.keys({ ...assetInput, boughtPrice: afterUpdate }).map((key) => {
          if (key == "boughtPrice") doc[key] = afterUpdate;
          doc[key] = assetInput[key];
        });

        await CompanyDetail.findByIdAndUpdate(
          { _id: companyDetailId },
          {
            $inc: {
              balance: difference,
            },
          },
          { session: session }
        );

        const result = await companyDetail.save();
        const updatedDoc = result.propertyAsset.id(id);
        await createActivity(before, updatedDoc, req.userId, session);
        await session.commitTransaction();
        await session.endSession();

        return {
          ok: true,
          propertyAsset: updatedDoc,
        };
      } catch (err) {
        session.abortTransaction();
        console.log(`all changes were rolled back, ${err}`);
        return {
          ok: false,
          error: {
            message: err.message,
          },
        };
      }
    },
    async deletePropertyAsset(parent, { id, companyDetailId }, { req }) {
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const companyDetail = await CompanyDetail.findById(companyDetailId);
        const doc = companyDetail.propertyAsset.id(id);
        await createActivity(doc, null, req.userId);
        await doc.remove();
        await companyDetail.save()

        return {
          ok: true,
          propertyAsset: doc,
        };
      } catch ({ message }) {
        console.log(message);
        return {
          ok: false,
          error: {
            message,
          },
        };
      }
    },
    async createTangibleAsset(parent, { input }, { req, db }) {
      const session = await db.startSession();
      session.startTransaction();
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const { companyDetailId, ...assetInput } = input;
        const { boughtPrice } = assetInput;
        const companyDetail = await CompanyDetail.findById(
          companyDetailId
        ).session(session);
        const asset = companyDetail.tangibleAsset.create({ ...assetInput });

        await CompanyDetail.findByIdAndUpdate(
          { _id: companyDetailId },
          {
            $inc: {
              balance: -boughtPrice,
            },
            $push: {
              tangibleAsset: asset,
            },
          },
          { session: session }
        );

        await createActivity(null, asset, req.userId, session);

        await session.commitTransaction();
        await session.endSession();

        return {
          ok: true,
          tangibleAsset: asset,
        };
      } catch (err) {
        session.abortTransaction();
        console.log(`all changes were rolled back, ${err}`);
        return {
          ok: false,
          error: {
            message: err.message,
          },
        };
      }
      // try {
      //   if (!req.userId)
      //     throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

      //   // const doc = await Asset.create({ ...input });

      //   const { companyDetailId, ...assetInput } = input;
      //   const companyDetail = await CompanyDetail.findById(companyDetailId);
      //   const asset = companyDetail.tangibleAsset.create({ ...assetInput });
      //   companyDetail.tangibleAsset.push(asset);
      //   const result = await companyDetail.save();

      //   await createActivity(null, asset, req.userId);

      //   return {
      //     ok: true,
      //     tangibleAsset: result.tangibleAsset.id(asset.id),
      //   };
      // } catch (err) {
      //   console.log(err);
      // }
    },
    async updateTangibleAsset(parent, { input }, { req, db }) {
      const session = await db.startSession();
      session.startTransaction();
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const {
          id,
          companyDetailId,
          boughtPrice: afterUpdate,
          ...assetInput
        } = input;
        const companyDetail = await CompanyDetail.findById(
          companyDetailId
        ).session(session);
        const doc = companyDetail.tangibleAsset.id(id);
        const { boughtPrice: beforeUpdate } = doc;
        const difference =
          beforeUpdate >= afterUpdate
            ? beforeUpdate - afterUpdate
            : -(afterUpdate - beforeUpdate);

        const before = JSON.parse(JSON.stringify(doc));

        Object.keys({ ...assetInput, boughtPrice: afterUpdate }).map((key) => {
          if (key == "boughtPrice") doc[key] = afterUpdate;
          else doc[key] = assetInput[key];
        });

        await CompanyDetail.findByIdAndUpdate(
          { _id: companyDetailId },
          {
            $inc: {
              balance: difference,
            },
          },
          { session }
        );

        const result = await companyDetail.save();
        const updatedDoc = result.tangibleAsset.id(id);
        await createActivity(before, updatedDoc, req.userId, session);
        await session.commitTransaction();
        await session.endSession();

        return {
          ok: true,
          tangibleAsset: updatedDoc,
        };
      } catch (err) {
        session.abortTransaction();
        console.log(`all changes were rolled back, ${err}`);
        return {
          ok: false,
          error: {
            message: err.message,
          },
        };
      }
    },
    async deleteTangibleAsset(parent, { id, companyDetailId }, { req }) {
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const companyDetail = await CompanyDetail.findById(companyDetailId);
        const doc = companyDetail.tangibleAsset.id(id)
        await createActivity(doc, null, req.userId);

        await doc.remove();
        await companyDetail.save()

        return {
          ok: true,
          tangibleAsset: doc,
        };
      } catch ({ message }) {
        return {
          ok: false,
          error: {
            message,
          },
        };
      }
    },
    async createIntangibleAsset(parent, { input }, { req, db }) {
      const session = await db.startSession();
      session.startTransaction();
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        // const doc = await Asset.create({ ...input });
        const { companyDetailId, boughtPrice, ...assetInput } = input;
        const companyDetail = await CompanyDetail.findById(
          companyDetailId
        ).session(session);
        const asset = companyDetail.intangibleAsset.create({
          ...assetInput,
          boughtPrice,
        });

        await CompanyDetail.findByIdAndUpdate(
          { _id: companyDetailId },
          {
            $inc: {
              balance: -boughtPrice,
            },
            $push: {
              intangibleAsset: asset,
            },
          }
        );
        await createActivity(null, asset, req.userId);
        await session.commitTransaction();
        await session.endSession();

        return {
          ok: true,
          intangibleAsset: result.intangibleAsset.id(asset.id),
        };
      } catch (err) {
        session.abortTransaction();
        console.log(`all changes were rolled back, ${err}`);
        return {
          ok: false,
          error: {
            message: err.message,
          },
        };
      }
    },
    async updateIntangibleAsset(parent, { input }, { req, db }) {
      const session = await db.startSession();
      session.startTransaction();
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const {
          id,
          companyDetailId,
          boughtPrice: afterUpdate,
          ...assetInput
        } = input;
        const companyDetail = await CompanyDetail.findById(
          companyDetailId
        ).session(session);
        const doc = companyDetail.intangibleAsset.id(id);
        const { boughtPrice: beforeUpdate } = doc;
        const difference =
          beforeUpdate >= afterUpdate
            ? beforeUpdate - afterUpdate
            : -(afterUpdate - beforeUpdate);

        const before = JSON.parse(JSON.stringify(doc));

        Object.keys({ ...assetInput, boughtPrice: afterUpdate }).map((key) => {
          if (key == "boughtPrice") doc[key] = afterUpdate;
          doc[key] = assetInput[key];
        });

        await CompanyDetail.findByIdAndUpdate(
          {
            _id: companyDetailId,
          },
          {
            $inc: {
              balance: difference,
            },
          },
          { session }
        );

        const result = await companyDetail.save();
        const updatedDoc = result.intangibleAsset.id(id);

        await createActivity(before, updatedDoc, req.userId, session);
        await session.commitTransaction();
        await session.endSession();

        return {
          ok: true,
          intangibleAsset: updatedDoc,
        };
      } catch (err) {
        session.abortTransaction();
        console.log(`all changes were rolled back, ${err}`);
        return {
          ok: false,
          error: {
            message: err.message,
          },
        };
      }
    },
    async deleteIntangibleAsset(parent, { id, companyDetailId }, { req }) {
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const companyDetail = await CompanyDetail.findById(companyDetailId);
        const doc = companyDetail.intangibleAsset.id(id);
        await createActivity(doc, null, req.userId);

        await doc.remove();
        await companyDetail.save()

        return {
          ok: true,
          intangibleAsset: doc,
        };
      } catch ({ message }) {
        console.log(message);
        return {
          ok: false,
          error: {
            message,
          },
        };
      }
    },
    async updateTaxReport(parent, { input }, { req, db }) {
      const session = await db.startSession();
      session.startTransaction();
      try {
        const { companyDetailId, report } = input;

        const companyDetail = await CompanyDetail.findById(
          companyDetailId
        ).session(session);
        let total = 0;

        for (let { id, amount, ...detail } of report) {
          if (!id) {
            total += amount;
            const taxReport = companyDetail.taxReport.create({
              ...detail,
              amount,
            });
            await companyDetail.taxReport.push(taxReport);
            await createActivity(null, taxReport, req.userId, session);
          } else {
            const doc = companyDetail.taxReport.id(id);
            const { amount: beforeAmount } = doc;
            let difference =
              beforeAmount >= amount
                ? beforeAmount - amount
                : -(amount - beforeAmount);
            total += difference;
            const before = JSON.parse(JSON.stringify(doc));
            // edit tax report
            Object.keys({ ...detail, amount }).map((key) => {
              if (key == "amount") doc[key] = amount;
              else doc[key] = detail[key];
            });
            await createActivity(before, doc, req.userId, session);
          }
        }

        const result = await companyDetail.save();
        await CompanyDetail.findByIdAndUpdate(
          { _id: companyDetailId },
          {
            $inc: {
              balance: -total,
            },
          },
          { session: session }
        );
        await session.commitTransaction();
        await session.endSession();

        return {
          ok: true,
          tax: result.taxReport,
        };
      } catch (err) {
        session.abortTransaction();
        console.log(`All changes were rolled back, ${err}`);
        return {
          ok: false,
          error: {
            message: err.message,
          },
        };
      }
    },
    async updateCompanyDetail(parent, { input }, { req }) {
      try {
        if (!req.userId) {
          session.abortTransaction();
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");
        }

        const { id, ...detail } = input;

        if (!id) {
          console.log(detail);
          const doc = await CompanyDetail.create({ ...detail });
          s;

          await createActivity(null, doc, req.userId);
          console.log("Company Detail Updated");

          return {
            ok: true,
            companyDetail: doc,
          };
        }
        const doc = await CompanyDetail.findById(id);
        const before = JSON.parse(JSON.stringify(doc));
        Object.keys(detail).map((key) => {
          doc[key] = detail[key];
        });

        const result = await doc.save();
        await createActivity(before, result, req.userId);

        return {
          ok: true,
          companyDetail: result,
        };
      } catch ({ message }) {
        console.log(message);
        return {
          ok: false,
          error: {
            message,
          },
        };
      }
    },
  },
  Date: new GraphQLScalarType({
    name: "Date",
    description: "Custom Date Scalar",
    serialize(value) {
      return value.getTime(); // Convert outgoing Date to integer for JSON
    },
    parseValue(value) {
      return new Date(value); // Convert incoming integer to Date
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(parseInt(ast.value, 10)); // Convert hard-coded AST string to integer and then to Date
      }
      return null; // Invalid hard-coded value (not an integer)
    },
  }),
};

module.exports = resolvers;
