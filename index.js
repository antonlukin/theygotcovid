const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const Telegraf = require('telegraf');
const trailing = require('express-trailing-slash');
const i18n = require('i18n');

const app = express();


/**
 * Require env config
 */
require('dotenv').config()


/**
 * Load units data
 */
let data = require('./data.json');

/**
 * Set request parser
 */
app.use(bodyParser.json())


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
 * Set locals static version
 */
app.locals.version = require('./package.json').version;


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
  res.render('index', {
    items: data
  });
});


/**
 * Handle cured page
 */
app.get('/:language(en|ru)/recovered/', function (req, res, next) {
  let items = [];

  data.forEach(function (item) {
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

  data.forEach(function (item) {
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
  res.render('suggest');
});


/**
 * Handle form posting
 */
app.post('/send/', function (req, res, next) {
  const bot = new Telegraf(process.env.TOKEN);

  if (!req.xhr || Object.keys(req.body).length < 3) {
    res.json({ success: false });
  }

  let message = [];

  // Add values to message
  message.push(`<b>Name:</b> ${req.body.name}`);
  message.push(`<b>Bio:</b> ${req.body.bio}`);
  message.push(`<b>Link:</b> ${req.body.link}`);

  // Send data to Telegram
  bot.telegram.sendMessage(process.env.GROUP, message.join('\n'), {
    parse_mode: 'HTML'
  });

  // Return message to client
  res.json({ success: true });
});


/**
 * Error handler
 */
app.use(function (req, res, next) {
  res.status(404).render('error', {
    language: app.locals.language
  });
});

/**
 * Let's roll
 */
app.listen(process.env.PORT || 3000);