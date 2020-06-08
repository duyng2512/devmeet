const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const methodOveride = require('method-override');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const passportSetup = require('../config/passport-setup');
const cookieSession = require('cookie-session');
const passport = require('passport');
const keys = require('../config/keys');

const app = express();

app.use(cors());

const connectDB = require('../config/db');

/** Connect to MongoDB */
connectDB();

/** Cookie Session */
app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000, // One day in milliseconds
    keys: [keys.session.cookieKey],
  })
);

app.use(passport.initialize());
app.use(passport.session());

/** Init Middleware */
app.use(express.json({ extended: false }));
app.use(bodyParser.json());
app.use(methodOveride('_method'));

/** Testing Page */
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.get('/test', function (req, res) {
  res.render('index.html');
});
app.get('/test/google', function (req, res) {
  res.render('index_google.html');
});
app.get('/test/error', function (req, res) {
  res.render('err.html');
});

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
  console.log('Starting front end build...');
  app.use(compression());
  app.use(morgan('common'));
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on PORT : ${PORT}`));
