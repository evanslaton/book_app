'use strict';

// Application dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');

// Application setup
require('dotenv').config();
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded());
app.use(methodOverride(function (request, response) {
  if (request.body && typeof request.body === 'object' && '_method' in request.body) {
    let method = request.body._method;
    delete request.body._method;
    return method;
  }
}));

// Application middleware
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', showSavedBooks);
app.get('/book-details/:book_id', showBookDetails);
app.get('/new-book-search', bookSearch);
app.post('/search-for-books', queryGoogleAPI);
app.post('/add-book-to-database', addBook);
app.put('/update-book-in-database/:book_id', updateBook);

// Error handling
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

// listening
app.listen(PORT, () => console.log(`Listening on port: ${process.env.PORT}`));

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

// Shows the selected book's details
function showBookDetails(request, response) {
  getBookshelves()
    .then(bookshelves => {
      const SQL = 'SELECT * FROM books WHERE id=$1;';
      const values = [request.params.book_id];
      console.log('Show book detail', bookshelves.rows);
      return client.query(SQL, values)
        .then(result => response.render('pages/books/show', { bookDetails: result.rows[0], shelfList: bookshelves.rows }))
    })
    .catch(handleError);
}

function getBookshelves() {
  const SQL = 'SELECT DISTINCT bookshelf FROM books;';
  return client.query(SQL);
}

// Renders the page where users can search the Google API for books
function bookSearch(request, response) {
  response.render('pages/searches/new');
}

// Sends user's query to Google API for search results
function queryGoogleAPI(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  const searchFor = request.body.search[0];
  const searchBy = request.body.search[1];

  searchBy === 'title' ? url += `+intitle:${searchFor}` : url += `inauthor:${searchFor}`;

  superagent.get(url)
    .then(googleResults => googleResults.body.items.map(book => new Book(book.volumeInfo)))
    .then(bookListOnServer => response.render('pages/searches/search-results', { bookListVarialbeNameOnEJS: bookListOnServer }))
    .catch(error => handleError(error, response));
}

// Book constructor function
function Book(book) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = book.title ? book.title : 'Title not available';
  this.author = book.authors.reduce((accumulator, currentValue) => accumulator + `, ${currentValue}`) || 'Author not available';
  this.isbn = book.industryIdentifiers ? book.industryIdentifiers[0].identifier : 'ISBN not available';
  this.image_url = book.imageLinks ? book.imageLinks.thumbnail : placeholderImage;
  this.description = book.description ? book.description : 'No description';
  this.bookshelf = book.categories ? book.categories[0] : 'Uncategorized';
}

// Destructures, adds a book to the database and then redirects to the details view of the newly added book
function addBook(request, response) {
  console.log(request.body);
  let { title, author, isbn, image_url, description, bookshelf } = request.body;

  const SQL = 'INSERT INTO books (title, author, isbn, image_url, description, bookshelf) VALUES ($1, $2, $3, $4, $5, $6);';
  const values = [title, author, isbn, image_url, description, bookshelf];

  return client.query(SQL, values)
    .then(() => {
      const SQL = 'SELECT id FROM books WHERE isbn=$1;'
      const values = [request.body.isbn];
      return client.query(SQL, values)
        .then(result => {
          response.redirect(`/book-details/${result.rows[0].id}`)
        })
        .catch(error => handleError(error, response));
    })
    .catch(error => handleError(error, response));
}

function updateBook(request, response) {
  console.log(request.body);
  let { title, author, isbn, image_url, description, bookshelf } = request.body;
  const SQL = 'UPDATE books SET title=$1, author=$2, isbn=$3, image_url=$4, description=$5, bookshelf=$6 WHERE id=$7;';
  const values = [title, author, isbn, image_url, description, bookshelf, request.params.book_id];
  client.query(SQL, values)
    .then(response.redirect(`/book-details/${request.params.book_id}`))
    .catch(error => handleError(error, response));
}

// Error handling
const handleError = (error, response) => {
  console.log(error);
  response.render('pages/error');
}

client.on('error', error => console.error(error));

