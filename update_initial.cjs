const fs = require('fs');

const updates = JSON.parse(fs.readFileSync('/tmp/firestore_updates.json', 'utf-8'));
const solvedIds = new Set(updates.map(u => String(u.questionId)));

let content = fs.readFileSync('src/data/initialData.js', 'utf-8');

// Use a regex to find question objects and update solved: false to solved: true if ID matches
// This is safer than simple string replace
// Example: { "id": 2, ..., "solved": false, ... }
const questionRegex = /\{[^{}]*?"id":\s*(\d+)[^{}]*?"solved":\s*false[^{}]*?\}/gs;

content = content.replace(questionRegex, (match, id) => {
    if (solvedIds.has(String(id))) {
        console.log(`Updating question ${id} to solved: true`);
        return match.replace(/"solved":\s*false/, '"solved": true');
    }
    return match;
});

fs.writeFileSync('src/data/initialData.js', content);
console.log('Update complete for initialData.js');
