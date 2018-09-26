DROP TABLE books;

CREATE TABLE IF NOT EXISTS books (
id SERIAL PRIMARY KEY,
author VARCHAR(255),
title VARCHAR(255),
isbn VARCHAR(13),
image_url TEXT,
description TEXT,
bookshelf VARCHAR(255)
);

INSERT INTO books (author, title, isbn, image_url, description, bookshelf)
VALUES ('evan', 'book', 1234567891011, 'https://i.imgur.com/J5LVHEL.jpg', 'description', 'fantasy');

INSERT INTO books (author, title, isbn, image_url, description, bookshelf)
VALUES ('dave', 'book2', 1234567891012, 'https://i.imgur.com/J5LVHEL.jpg', 'description', 'fiction');