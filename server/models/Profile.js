const mongoose = require('mongoose');
const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  company: {
    type: String,
  },
  website: {
    type: String,
  },
  location: {
    type: String,
  },
  status: {
    type: String,
    require: true,
  },
  skill: {
    type: [String],
    require: true,
  },
  bio: {
    type: String,
  },
  githubUsername: {
    type: String,
  },
  experience: [
    {
      title: {
        type: String,
        require: true,
      },
      company: {
        type: String,
        require: true,
      },
      from: {
        type: Date,
        require: true,
      },
      to: {
        type: Date,
        require: true,
      },
      description: {
        type: String,
      },
      current: {
        type: Boolean,
      },
    },
  ],
  education: [
    {
      school: {
        type: String,
        require: true,
      },
      from: {
        type: Date,
        require: true,
      },
      to: {
        type: Date,
        require: true,
      },
      degree: {
        type: String,
        require: true,
      },
      current: {
        type: Boolean,
        default: false,
      },
      gpa: {
        type: Number,
        require: true,
      },
    },
  ],
  connect: {
    facebook: {
      type: String,
    },
    twitter: {
      type: String,
    },
    github: {
      type: String,
    },
    linkedin: {
      type: String,
    },
  },
});

module.exports = profile = mongoose.model('profile', profileSchema);
