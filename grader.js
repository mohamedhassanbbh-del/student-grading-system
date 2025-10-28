function gradeFromMarks(m) {
  const marks = Number(m);
  if (marks === 100) return "O+";
  if (marks >= 95 && marks <= 99) return "O";
  if (marks >= 90 && marks <= 94) return "O-";
  if (marks >= 80 && marks <= 89) return "A+";
  if (marks >= 75 && marks <= 79) return "A";
  if (marks >= 70 && marks <= 74) return "A-";
  if (marks >= 60 && marks <= 69) return "B+";
  if (marks >= 50 && marks <= 59) return "B";
  if (marks >= 45 && marks <= 49) return "B-";
  if (marks >= 40 && marks <= 44) return "C+";
  if (marks >= 35 && marks <= 39) return "C";
  return "F";
}
module.exports = { gradeFromMarks };
