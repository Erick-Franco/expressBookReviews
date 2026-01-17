const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Verificar si se proporcionaron username y password
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Verificar si el usuario ya existe
  if (users[username]) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Registrar el nuevo usuario
  users[username] = { password: password };
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    res.send(JSON.stringify(books[isbn], null, 4));
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const booksByAuthor = [];

  // Obtener todas las claves del objeto books
  const bookKeys = Object.keys(books);

  // Iterar a través de las claves y buscar libros del autor
  for (let key of bookKeys) {
    if (books[key].author === author) {
      booksByAuthor.push(books[key]);
    }
  }

  if (booksByAuthor.length > 0) {
    res.send(JSON.stringify(booksByAuthor, null, 4));
  } else {
    res.status(404).json({ message: "No books found for this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const booksByTitle = [];

  // Obtener todas las claves del objeto books
  const bookKeys = Object.keys(books);

  // Iterar a través de las claves y buscar libros con el título
  for (let key of bookKeys) {
    if (books[key].title === title) {
      booksByTitle.push(books[key]);
    }
  }

  if (booksByTitle.length > 0) {
    res.send(JSON.stringify(booksByTitle, null, 4));
  } else {
    res.status(404).json({ message: "No books found with this title" });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    const reviews = books[isbn].reviews;
    res.send(JSON.stringify(reviews, null, 4));
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// ========== TASK 10: Using Promises and Async-Await ==========

// Function to get all books using Promise callbacks
function getAllBooks() {
  return new Promise((resolve, reject) => {
    try {
      resolve(books);
    } catch (error) {
      reject(error);
    }
  });
}

// Function to get book by ISBN using Promise callbacks
function getBookByISBN(isbn) {
  return new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject({ message: "Book not found" });
    }
  });
}

// Function to get books by author using Promise callbacks
function getBooksByAuthor(author) {
  return new Promise((resolve, reject) => {
    const booksByAuthor = [];
    const bookKeys = Object.keys(books);

    for (let key of bookKeys) {
      if (books[key].author === author) {
        booksByAuthor.push(books[key]);
      }
    }

    if (booksByAuthor.length > 0) {
      resolve(booksByAuthor);
    } else {
      reject({ message: "No books found for this author" });
    }
  });
}

// Function to get books by title using Promise callbacks
function getBooksByTitle(title) {
  return new Promise((resolve, reject) => {
    const booksByTitle = [];
    const bookKeys = Object.keys(books);

    for (let key of bookKeys) {
      if (books[key].title === title) {
        booksByTitle.push(books[key]);
      }
    }

    if (booksByTitle.length > 0) {
      resolve(booksByTitle);
    } else {
      reject({ message: "No books found with this title" });
    }
  });
}

// Get all books using Promise callbacks
public_users.get('/async', function (req, res) {
  getAllBooks()
    .then(books => {
      res.send(JSON.stringify(books, null, 4));
    })
    .catch(error => {
      res.status(500).json({ message: error.message || "Error fetching books" });
    });
});

// Get book by ISBN using async-await
public_users.get('/async/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const book = await getBookByISBN(isbn);
    res.send(JSON.stringify(book, null, 4));
  } catch (error) {
    res.status(404).json(error);
  }
});

// Get books by author using async-await
public_users.get('/async/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const booksByAuthor = await getBooksByAuthor(author);
    res.send(JSON.stringify(booksByAuthor, null, 4));
  } catch (error) {
    res.status(404).json(error);
  }
});

// Get books by title using async-await
public_users.get('/async/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const booksByTitle = await getBooksByTitle(title);
    res.send(JSON.stringify(booksByTitle, null, 4));
  } catch (error) {
    res.status(404).json(error);
  }
});

module.exports.general = public_users;
