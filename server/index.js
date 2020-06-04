const express = require('express');
const methodOveride = require('method-override');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());

const connectDB = require('../config/db');

/** Connect to MongoDB */
connectDB();

/** Init Middleware */
app.use(express.json({ extended: false }));
app.use(bodyParser.json());
app.use(methodOveride('_method'));
app.set('view engine', 'ejs');

/** Define Route */
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/code', require('./routes/api/code'));
app.use('/api/image', require('./routes/api/image'));
app.use('/api/job', require('./routes/api/job'));
app.use('/api/pdf', require('./routes/api/pdf'));

/** Serve static assets in production */
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on PORT : ${PORT}`));
