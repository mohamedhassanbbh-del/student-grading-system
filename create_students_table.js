const db = require("./lib/db");
db.prepare("CREATE TABLE IF NOT EXISTS students (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, name TEXT, marks INTEGER DEFAULT 0, grade TEXT DEFAULT 'N/A')").run();
console.log("✅ Students table ready");
