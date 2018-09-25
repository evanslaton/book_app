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

app.post('/search-for-books', queryGoogleAPI);

// Error handling
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

// listening
app.listen(PORT, () => console.log(`Listening on port: ${process.env.PORT}`));

// Renders the page where users can search the Google API for books
function bookSearch(request, response) {
  response.render('pages/index');
}

// Sends user's query to Google API for search results
function queryGoogleAPI(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  const searchFor = request.body.search[0];
  const searchBy = request.body.search[1];

  console.log(searchFor, searchBy);

  searchBy === 'title' ? url += `+intitle:${searchFor}` : url += `inauthor:${searchFor}`;

  superagent.get(url)
    .then(googleResults => googleResults.body.items.map(book => new Book(book.volumeInfo)));
    
}

