const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser');
const Telegraf = require('telegraf');
const trailing = require('express-trailing-slash');
const i18n = require('i18n');
const csrf = require('csurf');
const slug = require('slug');

const app = express();


/**
 * Require env config
 */
require('dotenv').config()


/**
 * Load units data
 */
let data = require('./config/data.json');


/**
 * Set request parser
 */
app.use(bodyParser.json());
app.use(cookieParser());


/**
 * Remove trailing slash
 */
app.use(trailing());


/**
 * Configure i18n
 */
i18n.configure({
  locales: ['en', 'ru'],
  directory: __dirname + '/locales',
  updateFiles: false
})

app.use(i18n.init);


/**
 * Set views engine
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


/**
 * Set static folder
 */
app.use(express.static(__dirname + '/public', {
  maxAge: '1d'
}));


/**
 * Set locals static variables
 */
app.locals.version = require('./package.json').version;

app.locals.slug = function(title) {
  return slug(title, {lower: true});
}

/**
 * Set cookie based csrf protection
 */
app.use(csrf({
  cookie: {
    key: 'token'
  }
}));


/**
 * Custom CSRF error
 */
app.use(function (err, req, res, next) {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.sendStatus(403);
  }

  next(err);
});


/**
 * Redirect to language url
 */
app.get('/:language(en|ru)?/:path(*)', function (req, res, next) {
  let path = req.params.path || '';

  if (typeof req.params.language === 'undefined') {
    let language = 'en';

    if (req.acceptsLanguages('ru')) {
      language = 'ru';
    }

    return res.redirect(302, `/${language}/${path}`);
  }

  // Set current locale
  i18n.setLocale(req, req.params.language);

  next();
});


/**
 * Handle main page
 */
app.get('/:language(en|ru)/', function (req, res, next) {
  let locale = i18n.getLocale(req);

  data.forEach(function (item) {
    Object.assign(item, item.title[locale]);
  });

  res.render('index', {
    items: data
  });
});


/**
 * Handle cured page
 */
app.get('/:language(en|ru)/recovered/', function (req, res, next) {
  let items = [];

  // Get locale
  let locale = i18n.getLocale(req);

  data.forEach(function (item) {
    Object.assign(item, item.title[locale]);

    if (item.status === 'recovered') {
      items.push(item);
    }
  });

  res.render('recovered', {
    items: items
  });
});


/**
 * Handle dead page
 */
app.get('/:language(en|ru)/dead/', function (req, res, next) {
  let items = [];

  // Get locale
  let locale = i18n.getLocale(req);

  data.forEach(function (item) {
    Object.assign(item, item.title[locale]);

    if (item.status === 'dead') {
      items.push(item);
    }
  });

  res.render('dead', {
    items: items
  });
});


/**
 * Handle suggest page
 */
app.get('/:language(en|ru)/suggest/', function (req, res, next) {
  res.render('suggest', {
    token: req.csrfToken()
  });
});


/**
 * Error handler
 */
app.use(function (req, res, next) {
  res.status(404).render('error');
});

/**
 * Let's roll
 */
app.listen(process.env.PORT || 3000);
