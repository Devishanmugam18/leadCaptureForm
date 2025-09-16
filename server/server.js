// const express = require("express");
// const bodyParser = require("body-parser");
// const sqlite3 = require("sqlite3").verbose();

// const app = express();
// const PORT = 5000;

// // Middleware
// // app.use(bodyParser.urlencoded({ extended: true }));

// // SQLite DB
// const db = new sqlite3.Database("./leads.db", (err) => {
//   if (err) console.error("DB connection error:", err.message);
//   else console.log("Connected to SQLite database");
// });

// // Create table if not exists
// db.run(`
//   CREATE TABLE IF NOT EXISTS leads (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     name TEXT NOT NULL,
//     email TEXT NOT NULL,
//     company TEXT,
//     phone TEXT,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//   )
// `);

// // Serve the form
// // app.get("/", (req, res) => {
// //   res.sendFile(__dirname + "/index.html");
// // });

// // Handle form submission
// app.post("/submit", (req, res) => {
//   const { name, email, company, phone } = req.body;

//   // Basic validation
//   if (!name || !email) {
//     return res.status(400).send("Name and Email are required.");
//   }
//   const emailRegex = /\S+@\S+\.\S+/;
//   if (!emailRegex.test(email)) {
//     return res.status(400).send("Invalid email format.");
//   }

//   // Insert into DB
//   const sql =
//     "INSERT INTO leads (name, email, company, phone) VALUES (?, ?, ?, ?)";
//   db.run(sql, [name, email, company, phone], function (err) {
//     if (err) {
//       console.error(err.message);
//       return res.status(500).send("Database error.");
//     }
//     res.send("Lead captured successfully!");
//   });
// });

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
const path = require("path");
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const DB_FILE = path.join(__dirname, "leads.db");

// SQLite DB
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
    process.exit(1);
  }
  console.log("Connected to SQLite database:", DB_FILE);

  // Create table if not exists
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT,
      phone TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.run(createTableSql, (err) => {
    if (err) console.error("Table creation error:", err.message);
    else console.log("leads table is ready");
  });
});

app.get("/", (req, res) => res.send("Backend server is up"));

app.get("/leads", (req, res) => {
  db.all("SELECT * FROM leads ORDER BY created_at DESC", [], (err, rows) => {
    if (err) {
      console.error("SELECT error:", err.message);
      return res.status(500).json({ error: "Failed to fetch leads" });
    }
    res.json(rows);
  });
});

// Handle form submission
app.post("/submit", (req, res) => {
  const { name, email, company, phone } = req.body || {};
  console.log("POST /submit body:", req.body);

  // Basic validation
  if (!name || !email)
    return res.status(400).send("Name and Email are required.");
  const emailRe = /\S+@\S+\.\S+/;
  if (!emailRe.test(email))
    return res.status(400).send("Invalid email format.");
  if (phone && !/^\d{10}$/.test(phone))
    return res.status(400).send("Phone must be 10 digits.");

  //Insert into DB
  const sql =
    "INSERT INTO leads (name, email, company, phone) VALUES (?, ?, ?, ?)";
  db.run(sql, [name, email, company || null, phone || null], function (err) {
    if (err) {
      console.error("INSERT error:", err.message);
      return res.status(500).send("Database error.");
    }
    console.log("Inserted lead id:", this.lastID);
    res.status(200).send("Lead saved successfully!");
  });
});

// --- Graceful shutdown so DB closes properly ---
process.on("SIGINT", () => {
  console.log("Shutting down server...");
  db.close(() => {
    console.log("Database closed");
    process.exit(0);
  });
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
