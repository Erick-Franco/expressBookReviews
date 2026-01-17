const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = {
  "testuser": { password: "testpass123" }
};

const isValid = (username) => { //returns boolean
  // Verificar si el username existe en el array de usuarios
  return users.hasOwnProperty(username);
}

const authenticatedUser = (username, password) => { //returns boolean
  // Verificar si username y password coinciden con los registros
  const user = users[username];
  if (user && user.password === password) {
    return true;
  }
  return false;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Verificar si se proporcionaron username y password
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Verificar si el usuario existe
  if (!isValid(username)) {
    return res.status(404).json({ message: "User not found" });
  }

  // Autenticar usuario
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Generar JWT token
  const accessToken = jwt.sign({ username: username }, "secret_key", { expiresIn: '1h' });

  // Guardar el token en la sesión
  req.session.token = accessToken;

  return res.status(200).json({ message: "User successfully logged in", token: accessToken });
});

// Add a book review
// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.username;

  // Verificar si se proporcionó la reseña
  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  // Verificar si el libro existe
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Agregar o modificar la reseña del usuario
  books[isbn].reviews[username] = review;

  return res.status(200).json({ 
    message: "Review successfully added/updated",
    reviews: books[isbn].reviews
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  // Verificar si el libro existe
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Verificar si el usuario tiene una reseña para este libro
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found for this user" });
  }

  // Eliminar la reseña del usuario
  delete books[isbn].reviews[username];

  return res.status(200).json({ 
    message: "Review successfully deleted",
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
