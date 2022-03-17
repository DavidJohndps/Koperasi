const {model, Schema} = require('mongoose')

const userSchema = new Schema({
    email: String,
    username: String,
    position: String,
    password: String
},{timestamps: true})

module.exports = model('Users', userSchema)