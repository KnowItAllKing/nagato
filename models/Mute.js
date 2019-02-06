const mongoose = require('mongoose');
const Mute = mongoose.Schema({
  guild: String,
  staff: String,
  reason: String,
  duration: Number,
  complete: Boolean,
  user: String,
  case: Number
}, {
  strict: true
});
module.exports = mongoose.model('Mute', Mute);