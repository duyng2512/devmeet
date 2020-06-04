const mongoose = require('mongoose');
const codeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  code: [
    {
      content: {
        type: String,
      },
      description: {
        type: String,
      },
      language: {
        type: Array,
      },
    },
  ],
});

module.exports = Code = mongoose.model('code', codeSchema);
