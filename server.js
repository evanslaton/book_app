'use strict';

// Application dependencies
const express = require('express');
const superagent = require('superagent');

// Application setup
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

// Application middleware
app.use(express.static('./public'));
app.use(express.urlencoded({extended: true}));

// Set view engine for server-side templating
app.set('view engine', 'ejs');

app.get('/', bookSearch);

// Error handling
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

// listening
app.listen(PORT, () => console.log(`Listening on port: ${process.env.PORT}`));

// Renders the page where users can search the Google API for books
function bookSearch(request, response) {
  response.render('pages/index');
}

