const {model, Schema} = require('mongoose')

const userSchema = new Schema({
    email: String,
    password: String,
    username: String,
    position: String,
    npwp: String,
    address: String,
},{timestamps: true})

module.exports = model('Users', userSchema)