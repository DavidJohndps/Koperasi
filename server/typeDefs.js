const { gql } = require("apollo-server-express");

const typeDefs = gql`
  scalar Date
  scalar Upload

  # enum ASSETCODE{
  #   Tabungan
  #   Giro
  #   Deposito
  #   SetaraKasLainnya
  #   Piutang
  #   PiutangAffiliasi
  #   PiutangLain
  #   SahamTetap
  #   Saham
  #   ObligasiPerusahaan
  #   ObligasiPemerintah
  #   SuratUtangLain
  #   Reksadana
  #   Kontrak
  #   ModalLain
  #   Investasi
  #   Sepeda
  #   SepedaMotor
  #   Mobil
  #   AlatTransportasiLain
  #   LogamMulia
  #   BatuMulia
  #   BarangSeniAtauAntik
  #   KapalPesiarPesawatHelikopter
  #   PeraltanElektronikDanFurnitur
  #   HartaBergerakLainnya
  #   TanahatauBangunanTempatTinggal
  #   TanahatauBangunanUsaha
  #   TanahUntukLahanUsaha
  #   HartaTidakBergerakLainnya
  # }

  enum PROPERTYASSET{
    Permanen
    TidakPermanen
  }

  enum TANGIBLEASSET{
    Kelompok1
    Kelompok2
    Kelompok3
    Kelompok4
  }

  enum INTANGIBLEASSET{
    Kelompok1
    Kelompok2
    Kelompok3
    Kelompok4
  }
  
  # enum RELATIONSHIP {
  #   Husband
  #   Wife
  #   Child
  #   Grandson
  #   Parent
  #   FatherInLaw
  #   MotherInLaw
  # }

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

  type Budget {
    id: ID!
    user: User!
    amount: Float!
    verBy: User!
  }

  type ExpenseCategory {
    id: ID!
    name: String
  }

  type Expense {
    id: ID
    name: String
    expCategory: ExpenseCategory
    amount: Float!
    verBy: User!
    createdAt: Date
  }

  type TaxReport{
    id: ID!
    name: String!
    nptn: String!
    amount: Float!
    isPaid: Boolean!
    dueDate: String
    createdAt: String
  }

  type PropertyAsset {
    id: ID!
    name: String!
    boughtSince: String!
    boughtPrice: Float!
    depCategory: PROPERTYASSET!
    depAmount: Float!
    timePeriod: String!
    desc: String
  }

  type TangibleAsset {
    id: ID!
    name: String!
    boughtSince: String!
    boughtPrice: Float!
    depCategory: TANGIBLEASSET!
    depAmount: Float!
    timePeriod: String
    desc: String
  }

  type IntangibleAsset {
    id: ID!
    name: String!
    boughtSince: String!
    boughtPrice: Float!
    depCategory: INTANGIBLEASSET!
    depAmount: Float!
    timePeriod: String!
    desc: String
  }

  # type familyMember {
  #   nik:String!
  #   name: String!
  #   relationship: RELATIONSHIP
  #   profession: String!
  # }

  type CompanyDetail {
    id: ID
    name: String
    npwp: String
    balance: Float
    revenue: Float
    netProfit:Float
    propertyAsset: [PropertyAsset!]
    tangibleAsset: [TangibleAsset!]
    intangibleAsset: [IntangibleAsset!]
    taxReport: [TaxReport!]
    # familyMembers: familyMember
  }

  type User {
    id: ID
    username: String!
    npwp: String!
    email: String
    position: POSITION!
    address: String!
    phoneNumber: String
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

  type MonthlyIncome {
    startDate: String!
    total: Float!
  }

  type Error {
    message: String
  }

  type BudgetResponse {
    ok: Boolean
    budget: [Budget]
    error: Error
  }

  type ExpenseCategoryResponse {
    ok: Boolean
    expCategory: [ExpenseCategory]
    error: Error
  }

  type ExpenseResponse {
    ok: Boolean
    expense: [Expense]
    error: Error
  }

  type TaxReportResponse {
    ok: Boolean
    taxReport: [TaxReport]
    error: Error
  }

  type PropertyAssetResponse {
    ok: Boolean
    propertyAsset: PropertyAsset
    error: Error
  }

  type TangibleAssetResponse {
    ok: Boolean
    tangibleAsset: TangibleAsset
    error: Error
  }

  type IntangibleAssetResponse {
    ok: Boolean
    intangibleAsset: IntangibleAsset
    error: Error
  }

  type CompanyDetailResponse {
    ok: Boolean
    companyDetail: CompanyDetail
    error: Error
  }

  type UserResponse {
    ok: Boolean
    user: [User]
    error: Error
  }

  type ProductResponse {
    ok: Boolean
    product: [Product]
    error: Error
  }

  type TransactionResponse {
    ok: Boolean
    transaction: [Transaction]
    error: Error
  }

  type ActivityResponse {
    ok: Boolean
    activity: [Activity]
    error: Error
  }

  type MonthlyIncomeResponse {
    ok: Boolean
    monthlyIncome: [MonthlyIncome]
    error: Error
  }

  type FileResponse {
    ok: Boolean
    file: Upload
  }

  type Query {
    Users: UserResponse
    Budgets: BudgetResponse
    Expenses: ExpenseResponse
    ExpenseCategories: ExpenseCategoryResponse
    CompanyDetails: CompanyDetailResponse
    Products(input: String, stock: Int, sort: SORTING): ProductResponse
    Activities(isRecent: Boolean, sort: SORTING): ActivityResponse
    Transactions(isRecent: Boolean, sort: SORTING): TransactionResponse
    MonthlyIncomes(startDate: String!):MonthlyIncomeResponse
  }

  input userLogin {
    email: String!
    password: String!
  }

  input userInput {
    id: ID
    npwp: String
    email: String!
    password: String!
    username: String
    position: POSITION
    phoneNumber: String
    address: String
  }

  input budgetInput {
    id: ID
    companyDetailId: ID!
    user: ID!
    amount: Float!
    verBy: ID!
  }

  input expCategoryInput {
    id: ID
    name: String!
  }

  input expenseInput {
    id: ID
    companyDetailId: ID!
    name: String
    expCategory: ID!
    amount: Float!
    verBy: ID!
  }

  input tax {
    id: ID
    name: String!
    nptn: String!
    amount: Float!
    isPaid: Boolean
    dueDate: String
  }

  input taxReportInput {
    companyDetailId: ID!
    report: [tax!]!
  }

  input propertyAssetInput {
    companyDetailId: ID!
    id: ID
    name: String
    boughtSince: Date
    boughtPrice: Float!
    depCategory: PROPERTYASSET!
    depAmount: Float!
    timePeriod: String!
    desc: String
  }

  input tangibleAssetInput {
    companyDetailId: ID!
    id: ID
    name: String
    boughtSince: Date
    boughtPrice: Float!
    depCategory: TANGIBLEASSET!
    depAmount: Float!
    timePeriod: String!
    desc: String
  }

  input intangibleAssetInput {
    companyDetailId: ID!
    id: ID
    name: String
    boughtSince: Date
    boughtPrice: Float!
    depCategory: INTANGIBLEASSET!
    depAmount: Float!
    timePeriod: String!
    desc: String
  }

  input companyDetailInput {
    id: ID
    name: String!
    npwp: String!
  }

  input productInput {
    companyDetailId: ID!
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
    deleteProduct(id: String!, companyDetailId: ID!): ProductResponse
    createTransaction(input: transactionInput): TransactionResponse
    createExpenseCategory(input: expCategoryInput): ExpenseCategoryResponse
    updateExpenseCategory(input: expCategoryInput): ExpenseCategoryResponse
    deleteExpenseCategory(id: String!): ExpenseCategoryResponse
    createBudget(input: budgetInput): BudgetResponse
    updateBudget(input: budgetInput): BudgetResponse
    createExpense(input: expenseInput): ExpenseResponse
    updateExpense(input: expenseInput): ExpenseResponse
    createPropertyAsset(input: propertyAssetInput): PropertyAssetResponse
    updatePropertyAsset(input: propertyAssetInput): PropertyAssetResponse
    deletePropertyAsset(id: String!, companyDetailId: ID!): PropertyAssetResponse
    createIntangibleAsset(input: intangibleAssetInput): IntangibleAssetResponse
    updateIntangibleAsset(input: intangibleAssetInput): IntangibleAssetResponse
    deleteIntangibleAsset(id: String!, companyDetailId: ID!): IntangibleAssetResponse
    createTangibleAsset(input: tangibleAssetInput): TangibleAssetResponse
    updateTangibleAsset(input: tangibleAssetInput): TangibleAssetResponse
    deleteTangibleAsset(id: String!, companyDetailId: ID!): TangibleAssetResponse
    updateTaxReport(input: taxReportInput): TaxReportResponse
    updateCompanyDetail(input: companyDetailInput): CompanyDetailResponse
  }
`;
module.exports = typeDefs;
