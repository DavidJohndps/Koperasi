const {model, Schema} = require('mongoose')

const productSchema = new Schema({
    name: String,
    desc: String,
    stock: Number,
    basePrice: Number,
    profit: Number
},{timestamps: true})

module.exports = model('Products', productSchema)