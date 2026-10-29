const fs = require('fs');
let ad = fs.readFileSync('src/components/admin/AdminDashboard.tsx', 'utf8');

const newPlaceholder = `placeholder={\`[
  {
    "id": "acc_01",
    "subject": "accounting",
    "question": "The fundamental accounting equation is expressed as:",
    "questionText": "The fundamental accounting equation is expressed as:",
    "options": [
      "Assets = Capital + Liabilities",
      "Assets = Liabilities - Capital",
      "Capital = Assets + Liabilities",
      "Liabilities = Assets + Capital"
    ],
    "correctAnswer": "Assets = Capital + Liabilities",
    "correctAnswerIndex": 0,
    "explanation": "Assets must always equal total claims against them: owners' equity (capital) plus outside liabilities.",
    "solution": "Assets must always equal total claims against them: owners' equity (capital) plus outside liabilities.",
    "year": "JAMB 2021"
  }
]\`}`;

// Find and replace textarea placeholder
const startIdx = ad.indexOf('placeholder={`');
const endIdx = ad.indexOf('className="w-full font-mono');
if (startIdx !== -1 && endIdx !== -1) {
  ad = ad.substring(0, startIdx) + newPlaceholder + '\n                ' + ad.substring(endIdx);
  fs.writeFileSync('src/components/admin/AdminDashboard.tsx', ad, 'utf8');
  console.log('Successfully updated AdminDashboard.tsx placeholder');
} else {
  console.log('Could not find placeholder bounds');
}
