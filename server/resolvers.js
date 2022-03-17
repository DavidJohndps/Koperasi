const { ApolloError, UserInputError } = require("apollo-server-core");
const { GraphQLScalarType, Kind, formatError } = require("graphql");
const { GraphQLUpload } = require("graphql-upload");
const { sign } = require("jsonwebtoken");
const Crypto = require("crypto-js");
const { flatten, split, isEmpty, isArray } = require("lodash");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const User = require("./models/User");
const Product = require("./models/Product");
const Transaction = require("./models/Transaction");
const Activity = require("./models/Activity");

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
        : `Deleted ${beforeDetails.name} (${modelName})`
    }`;
    let desc = `${
      !isEmpty(beforeDetails) && !isEmpty(afterDetails)
        ? `Before: ${Object.keys(beforeDetails).map((key) => {
            return `"${key}": ${JSON.stringify(beforeDetails[key])}`;
          })} | After: ${Object.keys(afterDetails).map((key) => {
            return `"${key}": ${JSON.stringify(afterDetails[key])}`;
          })}`
        : isEmpty(beforeDetails) && !isEmpty(afterDetails)
        ? `Before: null | After: ${Object.keys(afterDetails).map((key) => {
            if (isArray(afterDetails[key])) {
              return `"${key}": ${JSON.stringify(afterDetails[key])}`;
            } else return `"${key}": ${JSON.stringify(afterDetails[key])}`
          })}`
        : `Before: ${Object.keys(afterDetails).map((key) => {
            return `"${key}": ${JSON.stringify(afterDetails[key])}`;
          })} | After: null`
    }`;
    const result = await Activity.create([{ name, desc, verBy: userId }], {
      session: session,
    });
    return result;
  } catch (err) {
    console.log(err);
  }
};

const resolvers = {
  Upload: GraphQLUpload,

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
    Users: async (parent, params, { req }) => {
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const docs = await User.find();

        return {
          ok: true,
          doc: docs,
        };
      } catch (err) {
        console.log(err);
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
      } catch (err) {
        console.log(err);
      }
    },
    Transactions: async (parent, { isRecent, sort }, { req }) => {
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const d = new Date();
        const day = d.getUTCDate(),
          month = d.getUTCMonth(),
          year = d.getUTCFullYear();

        const isoDate = new Date(year, month, day);

        const result =
          isRecent && sort
            ? await Transaction.where("createdAt")
                .gte(isoDate)
                .sort({ createdAt: sort })
            : sort
            ? await Transaction.find().sort({ createdAt: sort })
            : await Transaction.find();

        return {
          ok: true,
          transaction: result,
        };
      } catch (err) {
        console.log(err);
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

        const isoDate = new Date(year, month, day);
        const doc =
          isRecent && sort
            ? await Activity.where("createdAt")
                .gte(isoDate)
                .sort({ createdAt: sort })
            : sort
            ? await Activity.find().sort({ createdAt: sort })
            : await Activity.find();

        return {
          ok: true,
          activity: doc,
        };
      } catch (err) {
        console.log(err);
      }
    },
  },
  Mutation: {
    async test(parent, { input }, { req, db }) {
      const session = await db.startSession();
      session.startTransaction();
      try {
        const { product, qty } = input;
        const [doc] = await Transaction.create([{ ...input }], {
          session: session,
        });
        product.forEach(async (id, index) => {
          await Product.findOneAndUpdate(
            { id: id },
            { $inc: { stock: -qty[index] } },
            { new: true, session }
          );
        });
        activityResult = await createActivity(null, doc, req.userId, session);
        await session.commitTransaction();
        console.log("Transaction completed");
        await session.endSession();
        return {
          ok: true,
          transaction: null,
        };
      } catch (err) {
        console.log(`all changes were rolled back, ${err}`);
        session.abortTransaction();
      }
    },
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
      } catch (err) {
        console.log(err);
      }
    },
    async createUser(parent, { input }, { req }) {
      try {
        // if (!req.userId)
        //   throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");
        const { username, email, password, position } = input;

        const doc = await User.create({
          username: username,
          email: email,
          password: Crypto.AES.encrypt(password, SECRET_KEY).toString(),
          position: position,
        });

        return {
          ok: true,
          user: [doc],
        };
      } catch (err) {
        console.log(err);
      }
    },
    async updateUser(parent, { input }, { req }) {
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const { id, ...inputted } = input;
        const doc = await User.findById(id);

        Object.keys(inputted).map((key) => {
          doc[key] = inputted[key];
        });

        const result = await doc.save();

        return {
          ok: true,
          doc: [result],
        };
      } catch (err) {
        console.log(err);
      }
    },
    async createProduct(parent, { input }, { req }) {
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const { id, ...productInput } = input;

        // const doc = await Product.create({ ...productInput });
        const doc = new Product({ ...productInput });
        await createActivity(null, doc, req.userId);
        const result = await doc.save();

        return {
          ok: true,
          product: [result],
        };
      } catch (err) {
        console.log(err);
      }
    },
    async updateProduct(parent, { input }, { req }) {
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const { id, ...productInput } = input;

        const doc = await Product.findById(id);

        const before = JSON.parse(JSON.stringify(doc));

        Object.keys(productInput).map((key) => {
          doc[key] = productInput[key];
        });

        await createActivity(before, doc, req.userId);

        const result = await doc.save();

        return {
          ok: true,
          product: [result],
        };
      } catch (err) {
        console.log(err);
      }
    },
    async deleteProduct(parent, { id }, { req }) {
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const result = await Product.findByIdAndDelete(id);

        const before = JSON.parse(JSON.stringify(result));

        await createActivity(before, null, req.userId);

        return {
          ok: true,
          product: [result],
        };
      } catch (err) {
        console.log(err);
      }
    },
    async createTransaction(parent, { input }, { req }) {
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const { product, qty } = input;
        const doc = new Transaction({ ...input });
        product.forEach(async (productId, idx) => {
          const product = await Product.findById(productId);
          product.stock -= qty[idx];
          await product.save();
        });

        await createActivity(null, doc, req.userId);

        const result = await doc.save();

        return {
          ok: true,
          transaction: [result],
        };
      } catch (err) {
        console.log(err);
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
