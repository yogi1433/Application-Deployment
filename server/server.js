// index.js
require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database");
});

// User registration endpoint
app.post("/api/register", async (req, res) => {
  const { email, password, name, company } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  db.query(
    "INSERT INTO users (email, password, name, company) VALUES (?, ?, ?, ?)",
    [email, hashedPassword, name, company],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.status(201).send("User registered");
    }
  );
});

// User login endpoint
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).send(err);
      if (results.length === 0)
        return res.status(401).send("Invalid email or password");

      const user = results[0];
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword)
        return res.status(401).send("Invalid email or password");

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.json({ token });
    }
  );
});

// User profile endpoint
app.get("/api/profile", authenticateToken, (req, res) => {
  db.query(
    "SELECT email, name, company FROM users WHERE id = ?",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results[0]);
    }
  );
});

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
