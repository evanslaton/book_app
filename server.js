'use strict';

// Application dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');

// Application setup
require('dotenv').config();
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
const app = express();
const PORT = process.env.PORT || 3000;

// Application middleware
app.use(express.static('./public'));
app.use(express.urlencoded({extended: true}));

// Set view engine for server-side templating
app.set('view engine', 'ejs');

app.get('/', showSavedBooks);
app.get('/book-details/:book_id', showBookDetails);
// app.get('/', bookSearch);

app.post('/search-for-books', queryGoogleAPI);

// Error handling
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

// listening
app.listen(PORT, () => console.log(`Listening on port: ${process.env.PORT}`));

// Renders the page where users can search the Google API for books
// function bookSearch(request, response) {
//   response.render('pages/index');
// }

// Retrieves saved books from the database
function showSavedBooks(request, response) {
  const SQL = `SELECT * FROM books`;

  return client.query(SQL)
    .then(savedBooksFromDatabase => {
      response.render('pages/index', {
        savedBooksFromDatabase: savedBooksFromDatabase.rows,
        numberOfBooksSaved: savedBooksFromDatabase.rowCount
      })
    })
    .catch(handleError);
}

function showBookDetails(request, response) {
  const SQL = 'SELECT * FROM books WHERE id=$1;';
  const values = [request.params.book_id];
  console.log('Show book detail', request.params);

  return client.query(SQL, values)
    .then(result => response.render('pages/books/show', {bookDetails: result.rows[0]}))
    .catch(handleError);
}


// Sends user's query to Google API for search results
function queryGoogleAPI(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  const searchFor = request.body.search[0];
  const searchBy = request.body.search[1];

  searchBy === 'title' ? url += `+intitle:${searchFor}` : url += `inauthor:${searchFor}`;

  superagent.get(url)
    .then(googleResults => googleResults.body.items.map(book => new Book(book.volumeInfo)))
    .then(bookListOnServer => response.render('pages/searches/new', {bookListVarialbeNameOnEJS: bookListOnServer}))
    .catch(error => handleError(error, response));
}

function Book(book) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = book.title ? book.title : 'Title not available';
  this.author = book.authors.reduce((accumulator, currentValue) => accumulator + `, ${currentValue}`) || 'Author not available';
  this.isbn = book.industryIdentifiers ? book.industryIdentifiers[0].type : 'ISBN not available';
  this.image_url = book.imageLinks ? book.imageLinks.thumbnail : placeholderImage;
  this.description = book.description ? book.description : 'No description';
  this.bookshelf = book.categories ? book.categories[0] : 'Uncategorized';
}

// Error handling
const handleError = (error, response) => {
  console.log(error);
  response.render('pages/error');
}

client.on('error', error => console.error(error));

