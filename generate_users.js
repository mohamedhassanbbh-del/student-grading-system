/*
Run: node scripts/generate_users.js
Generates 1000 users into the SQLite DB, with password "Password123!" for all generated accounts.
This version uses a simple local username/email generator (no faker required).
*/
const bcrypt = require("bcrypt");
const db = require("../lib/db");
const { gradeFromMarks } = require("../lib/grader");

function makeUsername() {
  // random alphanumeric, 6-10 chars
  return "u" + Math.random().toString(36).slice(2, 8) + Math.floor(Math.random()*1000);
}
function makeEmailFromUsername(u) {
  const domains = ["example.com","mail.com","school.edu","student.org"];
  const d = domains[Math.floor(Math.random()*domains.length)];
  return `${u}@${d}`;
}

(async ()=>{
  console.log("Generating users...");
  const insertUser = db.prepare("INSERT INTO users (username,email,password_hash,role,created_at) VALUES (?,?,?,?,datetime('now'))");
  const insertStudent = db.prepare("INSERT INTO students (user_id,name,marks,grade) VALUES (?,?,?,?)");
  for(let i=0;i<1000;i++){
    const username = makeUsername().toLowerCase() + Math.floor(Math.random()*10000);
    const email = makeEmailFromUsername(username).toLowerCase();
    const pw = "Password123!";
    const hash = await bcrypt.hash(pw,10);
    const role = (i % 10 === 0) ? "faculty" : ((i===0)? "admin" : "student");
    try{
      const info = insertUser.run(username,email,hash,role);
      if(role === "student"){
        const marks = Math.floor(Math.random()*101);
        const grade = gradeFromMarks(marks);
        insertStudent.run(info.lastInsertRowid, username, marks, grade);
      }
    } catch(e){
      // ignore duplicates (very unlikely with random suffix)
    }
    if ((i+1) % 100 === 0) console.log(`Created ${i+1} users...`);
  }
  console.log("Done. Default password for generated accounts: Password123!");
  console.log("You can run: node scripts/generate_users.js (again) to try again, or inspect the DB at ./db/app.sqlite");
  process.exit(0);
})();
