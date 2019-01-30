const mongoose = require('mongoose');
const Case = mongoose.Schema({
  guild: String,
  staff: String,
  reason: String,
  user: String,
  case: Number,
  message: String,
  channel: String,
  locked: Boolean

}, {
  strict: true
});
module.exports = mongoose.model('Case', Case);