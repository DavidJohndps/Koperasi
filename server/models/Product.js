const {model, Schema} = require('mongoose')

const productSchema = new Schema({
    name: String,
    desc: String,
    stock: Number,
    price: Number
},{timestamps: true})

module.exports = model('Products', productSchema)