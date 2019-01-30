const mongoose = require('mongoose');
const Guild = mongoose.Schema({
  id: String,
  prefix: String,
  log: String
}, {
  strict: true
});
module.exports = mongoose.model('Guild', Guild);