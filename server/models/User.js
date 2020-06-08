const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  googleID: {
    type: String,
    default: null,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  avatar: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = User = mongoose.model('user', userSchema);
