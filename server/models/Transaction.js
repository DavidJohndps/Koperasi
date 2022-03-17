const {model, Schema} = require('mongoose')

const transactionSchema = new Schema({
    product: [String],
    price: [Number],
    qty: [Number],
    total: Number,
    verBy: String
},{timestamps: true})

module.exports = model('Transactions', transactionSchema)