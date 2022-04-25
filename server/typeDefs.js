const { gql } = require("apollo-server-express");

const typeDefs = gql`
  scalar Date
  scalar Upload

  enum ASSETCODE{
    Tabungan
    Giro
    Deposito
    SetaraKasLainnya
    Piutang
    PiutangAffiliasi
    PiutangLain
    SahamTetap
    Saham
    ObligasiPerusahaan
    ObligasiPemerintah
    SuratUtangLain
    Reksadana
    Kontrak
    ModalLain
    Investasi
    Sepeda
    SepedaMotor
    Mobil
    AlatTransportasiLain
    LogamMulia
    BatuMulia
    BarangSeniAtauAntik
    KapalPesiarPesawatHelikopter
    PeraltanElektronikDanFurnitur
    HartaBergerakLainnya
    TanahatauBangunanTempatTinggal
    TanahatauBangunanUsaha
    TanahUntukLahanUsaha
    HartaTidakBergerakLainnya
  }
  
  enum RELATIONSHIP {
    Husband
    Wife
    Child
    Grandson
    Parent
    FatherInLaw
    MotherInLaw
  }

  enum POSITION {
    ADMIN
    Staff
    Member
  }

  enum SORTING {
    asc
    desc
    ascending
    descending
  }

  type Asset {
    id: ID!
    assetCode: ASSETCODE
    name: String
    boughtSince: String!
    boughtPrice: Float!
    desc: String
  }

  type familyMember {
    nik:String!
    name: String!
    relationship: RELATIONSHIP
    profession: String!
  }

  type CompanyDetail {
    id: ID
    name: String
    npwp: String
    balance: Float
    revenue: Float
    netProfit:Float
    asset: [Asset!]
    familyMembers: familyMember
  }

  type User {
    id: ID
    username: String!
    npwp: String!
    email: String
    position: POSITION!
    address: String!
    accessToken: String
    createdAt: String
    updatedAt: String
  }

  type Product {
    id: ID!
    name: String
    desc: String
    basePrice: Float!
    profit: Int!
    stock: Int!
    createdAt: Date
    updatedAt: Date
  }

  type Transaction {
    id: ID!
    product: [Product!]!
    basePrice: [Float!]!
    profit: [Int!]!
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

  type AssetResponse {
    ok: Boolean
    asset: Asset
  }

  type CompanyDetailResponse {
    ok: Boolean
    companyDetail: CompanyDetail
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
    CompanyDetails: CompanyDetailResponse
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
    npwp: String
    email: String!
    password: String!
    username: String
    position: POSITION
    address: String
  }

  input assetInput {
    id: ID
    name: String
    assetCode: ASSETCODE!
    boughtSince: Date
    boughtPrice: Float!
    desc: String
  }

  input companyDetailInput {
    id: ID
    name: String!
    npwp: String!
    balance: Float
    revenue: Float
    netProfit: Float
  }

  input productInput {
    id: ID
    name: String
    desc: String
    basePrice: Float!
    profit: Int!
    stock: Int!
  }

  input transactionInput {
    companyDetailId: ID!
    product: [ID!]!
    basePrice: [Float!]!
    profit: [Int!]!
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
    deleteProduct(id: String!): ProductResponse
    createTransaction(input: transactionInput): TransactionResponse
    createAsset(input: assetInput): AssetResponse
    updateAsset(input: assetInput): AssetResponse
    deleteAsset(id: String!): AssetResponse
    updateCompanyDetail(input: companyDetailInput): CompanyDetailResponse
  }
`;
module.exports = typeDefs;
