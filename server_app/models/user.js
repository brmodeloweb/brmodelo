const mongoose = require("mongoose")

let schema = mongoose.Schema({
  login: { type: String },
  name: { type: String },
  password: { type: String }
})

module.exports = mongoose.model("User", schema)
