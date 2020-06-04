const mongoose = require('mongoose');
const JobSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  image: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  company: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  remote: {
    type: String,
    required: true,
  },
  userInfo: {
    companyName: {
      type: String,
      require: true,
    },
    companySize: {
      type: String,
      require: true,
    },
    phone: {
      type: String,
      require: true,
    },
    name: {
      type: String,
      require: true,
    },
  },
  employmentType: {
    type: String,
    require: true,
  },
  contract: {
    type: Array,
    require: true,
  },
  salary: {
    minimum: {
      type: Number,
      require: true,
    },
    maximum: {
      type: Number,
      require: true,
    },
    currency: {
      type: String,
      require: true,
    },
    paymentCircle: {
      type: String,
      require: true,
    },
  },
  description: {
    type: String,
    require: true,
  },

  requirement: {
    type: String,
    require: true,
  },

  preference: {
    type: String,
    require: true,
  },
  stack: {
    type: Array,
    require: true,
  },
  applicant: {
    type: Array,
    require: true,
  }
});
module.exports = job = mongoose.model('job', JobSchema);
