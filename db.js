const Database = require("better-sqlite3");
const fs = require("fs");

if (!fs.existsSync("./db")) fs.mkdirSync("./db");
const db = new Database("./db/app.sqlite");

// init tables
db.prepare(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  password_hash TEXT,
  role TEXT,
  created_at TEXT
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  name TEXT,
  marks INTEGER,
  grade TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id)
)`).run();

module.exports = db;
