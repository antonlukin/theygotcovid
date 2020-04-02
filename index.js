const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const Telegraf = require('telegraf');

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
 * Route pages
 */
app.get('/cured/', function (req, res, next) {
  let items = [];

  data.forEach(function (item) {
    if (item.status === 'cured') {
      items.push(item);
    }
  });

  res.render('cured', {
    items: items
  });
});

app.get('/', function (req, res, next) {
  res.render('index', {
    items: data
  });
});

/**
 * Handle form
 */
app.get('/suggest/', function (req, res, next) {
  res.render('suggest');
});

app.post('/suggest/', function (req, res, next) {
  const bot = new Telegraf(process.env.TOKEN);

  if (req.body.length === 0 || !req.xhr) {
    res.json({success: false});
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
  res.json({success: true});
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