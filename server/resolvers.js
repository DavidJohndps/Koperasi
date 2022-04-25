const { ApolloError, UserInputError } = require("apollo-server-core");
const { GraphQLScalarType, Kind, formatError } = require("graphql");
const { GraphQLUpload } = require("graphql-upload");
const { sign } = require("jsonwebtoken");
const Crypto = require("crypto-js");
const { flatten, isEmpty, round } = require("lodash");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const User = require("./models/User");
const Product = require("./models/Product");
const Transaction = require("./models/Transaction");
const Activity = require("./models/Activity");
const CompanyDetail = require("./models/CompanyDetail");

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
        : `Deleted ${beforeDetails.name} ${modelName ? modelName : Unknown}`
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
    // let desc = `${
    //   !isEmpty(beforeDetails) && !isEmpty(afterDetails)
    //     ? `Changes: ${beforeDetailsEntries.filter(([key, values]) => {
    //         if (beforeDetails[key] != afterDetails[key])
    //           return `"${key}: ${values} to ${afterDetails[key]}"`;
    //       })}`
    //     : isEmpty(beforeDetails) && !isEmpty(afterDetails)
    //     ? `Added: ${afterDetailsEntries.filter(([key, values]) => {
    //         if (isArray(values)) {
    //           return `"${key}": ${JSON.stringify(values)}`;
    //         } else return `"${key}": ${JSON.stringify(values)}`;
    //       })}`
    //     : `Deleted: ${afterDetailsEntries.filter(([key, values]) => {
    //         return `"${key}": ${JSON.stringify(values)}`;
    //       })}`
    // }`;
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

  ASSETCODE: {
    Tabungan: "12",
    Giro: "13",
    Deposito: "14",
    SetaraKasLainnya: "19",
    Piutang: "21",
    PiutangAffiliasi: "22",
    PiutangLain: "29",
    SahamTetap: "31",
    Saham: "32",
    ObligasiPerusahaan: "33",
    ObligasiPemerintah: "34",
    SuratUtangLain: "35",
    Reksadana: "36",
    Kontrak: "37",
    ModalLain: "38",
    Investasi: "39",
    Sepeda: "41",
    SepedaMotor: "42",
    Mobil: "43",
    AlatTransportasiLain: "49",
    LogamMulia: "51",
    BatuMulia: "52",
    BarangSeniAtauAntik: "53",
    KapalPesiarPesawatHelikopter: "54",
    PeraltanElektronikDanFurnitur: "55",
    HartaBergerakLainnya: "59",
    TanahatauBangunanTempatTinggal: "61",
    TanahatauBangunanUsaha: "62",
    TanahUntukLahanUsaha: "63",
    HartaTidakBergerakLainnya: "69",
  },

  // CompanyDetail: {
  //   asset: async ({ asset }, arg, { assetLoader }) => {
  //     const result = await assetLoader.loadMany(asset);
  //     return flatten(result);
  //   },
  // },

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
      } catch (err) {
        console.log(err);
      }
    },
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
      } catch (err) {
        console.log(err);
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
      } catch (err) {
        console.log(err);
      }
    },
    async createUser(parent, { input }, { req }) {
      try {
        // if (!req.userId)
        //   throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");
        let { password } = input;
        password = Crypto.AES.encrypt(password, SECRET_KEY).toString();

        const doc = await User.create({ ...input, password });

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
    async createProduct(parent, { input }, { req, db }) {
      const session = await db.startSession();
      session.startTransaction();
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const { companyDetailId, id, ...productInput } = input;

        const { basePrice, qty } = productInput;

        // const doc = await Product.create({ ...productInput });
        const doc = await Product.create([{ ...productInput }], {
          session: session,
        });
        await CompanyDetail.findByIdAndUpdate(
          { id: companyDetailId },
          {
            $inc: {
              balance: -round(basePrice * parseFloat(qty), 2),
            },
          },
          { session: session }
        );
        await createActivity(null, doc, req.userId, session);

        await session.commitTransaction();
        await session.endSession();

        return {
          ok: true,
          product: [result],
        };
      } catch (err) {
        console.log(`all changes were rolled back, ${err}`);
        session.abortTransaction();
      }
    },
    async updateProduct(parent, { input }, { req, db }) {
      const session = await db.startSession();
      session.startTransaction();
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const { companyDetailId, id, ...productInput } = input;

        const { basePrice, qty } = productInput;

        const doc = await Product.findById(id).session(session);

        const before = JSON.parse(JSON.stringify(doc));

        Object.keys(productInput).map((key) => {
          doc[key] = productInput[key];
        });

        await createActivity(before, doc, req.userId, session);
        await CompanyDetail.findByIdAndUpdate(
          { id: companyDetailId },
          {
            $inc: {
              balance: -round(basePrice * parseFloat(qty), 2),
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
    async createTransaction(parent, { input }, { req, db }) {
      const session = await db.startSession();
      session.startTransaction();
      try {
        const { companyDetailId, ...transactionInput } = input;
        const { product, qty, basePrice, profit, total } = transactionInput;
        const doc = await Transaction.create([{ ...input }], {
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
          companyDetailId,
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
          transaction: doc,
        };
      } catch (err) {
        console.log(`all changes were rolled back, ${err}`);
        session.abortTransaction();
      }
    },
    async createAsset(parent, { input }, { req }) {
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        // const doc = await Asset.create({ ...input });

        const [doc] = await CompanyDetail.find();

        const before = JSON.parse(JSON.stringify(doc));

        doc.asset.push({ ...input });

        console.log(doc.asset);

        // const result = await doc.save();

        // const after = JSON.parse(JSON.stringify(result));

        // await createActivity(before, after, req.userId);

        // return {
        //   ok: true,
        //   asset: result.asset,
        // };
      } catch (err) {
        console.log(err);
      }
    },
    async updateAsset(parent, { input }, { req }) {
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const { id, ...assetInput } = input;
        const [companyDetail] = await CompanyDetail.find();
        const doc = companyDetail.asset.id(id);

        const before = JSON.parse(JSON.stringify(companyDetail));

        Object.keys(assetInput).map((key) => {
          doc[key] = assetInput[key];
        });

        const result = await companyDetail.save();
        const after = JSON.parse(JSON.stringify(result));
        await createActivity(before, after, req.userId);

        console.log(result.asset.id(id));

        return {
          ok: true,
          asset: result.asset.id(id),
        };
      } catch (err) {
        console.log(err);
      }
    },
    async deleteAsset(parent, { id }, { req }) {
      try {
        if (!req.userId)
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");

        const doc = await Asset.findByIdAndDelete(id);

        const before = JSON.parse(JSON.stringify(doc));

        await createActivity(before, null, req.userId);

        return {
          ok: true,
          asset: [doc],
        };
      } catch (err) {
        console.log(err);
      }
    },
    async updateCompanyDetail(parent, { input }, { req, db }) {
      try {
        if (!req.userId) {
          session.abortTransaction();
          throw new ApolloError("Not-Authorized", "UNAUTHENTICATED");
        }

        const { id, ...detail } = input;

        if (!id) {
          const doc = await CompanyDetail.create({ ...detail });

          const after = JSON.parse(JSON.stringify(doc));
          await createActivity(null, after, req.userId);
          console.log("Company Detail Updated");

          return {
            ok: true,
            companyDetail: doc,
          };
        }
        const doc = await CompanyDetail.findById(id);
        const before = JSON.parse(JSON.stringify(doc));
        Object.keys(detail).map((key) => {
          if (key == "balance") doc[key] += parseFloat(detail[key]);
          doc[key] = detail[key];
        });

        const result = await doc.save();
        const after = JSON.parse(JSON.stringify(result));
        await createActivity(before, after, req.userId);

        return {
          ok: true,
          companyDetail: result,
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
