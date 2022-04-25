const {model, Schema} = require('mongoose')

const activitySchema = new Schema({
    name: String,
    desc: String,
    verBy: String,
},{timestamps: true})

module.exports = model('Activities', activitySchema)