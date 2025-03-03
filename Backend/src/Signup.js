// backend/server.js

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8081;

// Middleware to parse incoming JSON data
app.use(bodyParser.json());

// Route to handle signup POST request
app.post('/signup', (req, res) => {
  const { email, password, confirmPassword } = req.body;

  // Validate data
  if (!email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  console.log('Received email:', email);
  console.log('Received password:', password);

  // Simulate storing user info in a database (e.g., hashing password)

  // Send response back to frontend
  res.status(200).json({ message: 'Signup successful' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
