const { gql } = require("apollo-server-express");

const typeDefs = gql`
  scalar Date
  scalar Upload

  enum SORTING {
    asc
    desc
    ascending
    descending
  }

  type User {
    id: ID
    username: String
    email: String
    position: String
    accessToken: String
    createdAt: String
    updatedAt: String
  }

  type Product {
    id: ID!
    name: String
    desc: String
    price: Float!
    stock: Int!
    createdAt: Date
    updatedAt: Date
  }

  type Transaction {
    id: ID!
    product: [Product!]!
    price: [Float!]!
    qty: [Int!]!
    total: Float!
    verBy: User!
    createdAt: Date!
  }

  type Activity {
    id: ID!
    name: String!
    desc: String!
    verBy: User!
    createdAt: Date!
  }

  type UserResponse {
    ok: Boolean
    user: [User]
  }

  type ProductResponse {
    ok: Boolean
    product: [Product]
  }

  type TransactionResponse {
    ok: Boolean
    transaction: [Transaction]
  }

  type ActivityResponse {
    ok: Boolean
    activity: [Activity]
  }

  type FileResponse {
    ok: Boolean
    file: Upload
  }

  type Query {
    Users: UserResponse
    Products(input: String, stock: Int, sort: SORTING): ProductResponse
    Transactions(isRecent: Boolean, sort: SORTING): TransactionResponse
    Activities(isRecent: Boolean, sort: SORTING): ActivityResponse
  }

  input userLogin {
    email: String!
    password: String!
  }

  input userInput {
    email: String!
    password: String!
    username: String
    position: String
  }

  input productInput {
    id: ID
    name: String
    desc: String
    price: Float!
    stock: Int!
  }

  input transactionInput {
    product: [ID!]!
    price: [Float!]!
    qty: [Int!]!
    total: Float!
    verBy: ID!
  }

  type Mutation {
    test(input: transactionInput): TransactionResponse
    singleUpload(input: Upload): FileResponse
    login(input: userLogin): UserResponse
    createUser(input: userInput): UserResponse
    updateUser(input: userInput): UserResponse
    createProduct(input: productInput): ProductResponse
    updateProduct(input: productInput): ProductResponse
    deleteProduct(id: ID!): ProductResponse
    createTransaction(input: transactionInput): TransactionResponse
  }
`;
module.exports = typeDefs;
