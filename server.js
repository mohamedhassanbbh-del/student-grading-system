const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const path = require("path");
const db = require("./lib/db");

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
  })
);

// --- Helpers ---
function calculateGrade(marks) {
  if (marks >= 90) return "A+";
  if (marks >= 80) return "A";
  if (marks >= 70) return "B";
  if (marks >= 60) return "C";
  if (marks >= 50) return "D";
  return "F";
}

// --- Routes ---
app.get("/", (req, res) => {
  if (req.session.user) return res.redirect(`/dashboard/${req.session.user.role}`);
  res.redirect("/login");
});

app.get("/login", (req, res) => res.render("login", { error: null }));

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE username=?").get(username);
  if (!user) return res.render("login", { error: "Invalid username" });
  if (!bcrypt.compareSync(password, user.password_hash))
    return res.render("login", { error: "Invalid password" });
  req.session.user = { id: user.id, username: user.username, role: user.role };
  res.redirect(`/dashboard/${user.role}`);
});

app.get("/signup", (req, res) => res.render("signup", { error: null }));

app.post("/signup", (req, res) => {
  const { username, email, password, role } = req.body;
  const existing = db.prepare("SELECT * FROM users WHERE username=? OR email=?").get(username, email);
  if (existing) return res.render("signup", { error: "User already exists" });
  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare("INSERT INTO users (username,email,password_hash,role,created_at) VALUES (?,?,?,?,datetime('now'))").run(username, email, hash, role);
  if (role === "student") {
    db.prepare("INSERT INTO students (user_id,name,marks,grade) VALUES (?,?,?,?)").run(info.lastInsertRowid, username, 0, "N/A");
  }
  res.redirect("/login");
});

app.get("/dashboard/admin", (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") return res.redirect("/login");
  res.render("dashboard_admin", { user: req.session.user });
});

// --- Faculty Dashboard: View and grade students ---
app.get("/dashboard/faculty", (req, res) => {
  if (!req.session.user || req.session.user.role !== "faculty") return res.redirect("/login");
  const students = db.prepare("SELECT * FROM students").all();
  res.render("dashboard_faculty", { user: req.session.user, students });
});

// --- Faculty grading submission ---
app.post("/grade", (req, res) => {
  if (!req.session.user || req.session.user.role !== "faculty") return res.redirect("/login");
  const { id, marks } = req.body;
  const grade = calculateGrade(parseInt(marks));
  db.prepare("UPDATE students SET marks=?, grade=? WHERE id=?").run(marks, grade, id);
  res.redirect("/dashboard/faculty");
});

// --- Student Dashboard: view own marks ---
app.get("/dashboard/student", (req, res) => {
  if (!req.session.user || req.session.user.role !== "student") return res.redirect("/login");
  const student = db.prepare("SELECT * FROM students WHERE user_id=?").get(req.session.user.id);
  res.render("dashboard_student", { user: req.session.user, student });
});

app.get("/logout", (req, res) => req.session.destroy(() => res.redirect("/login")));

app.listen(PORT, () => console.log(`? Server running at http://localhost:${PORT}`));
// --- Admin Dashboard: view and manage all users ---
app.get("/dashboard/admin", (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") return res.redirect("/login");
  const users = db.prepare("SELECT id, username, email, role FROM users").all();
  res.render("dashboard_admin", { user: req.session.user, users });
});

// --- Admin delete user ---
app.post("/admin/delete-user", (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") return res.redirect("/login");
  const { user_id } = req.body;
  db.prepare("DELETE FROM users WHERE id = ?").run(user_id);
  db.prepare("DELETE FROM students WHERE user_id = ?").run(user_id); // cleanup if student
  res.redirect("/dashboard/admin");
});

