const fs = require('fs');

const updates = JSON.parse(fs.readFileSync('/tmp/firestore_updates.json', 'utf-8'));
const solvedIds = new Set(updates.map(u => String(u.questionId)));

let content = fs.readFileSync('src/data/babbarData.js', 'utf-8');

// Babbar data uses "id": "g-1" etc.
const questionRegex = /\{[^{}]*?"id":\s*"([^"]+)"[^{}]*?"solved":\s*false[^{}]*?\}/gs;

content = content.replace(questionRegex, (match, id) => {
    if (solvedIds.has(id)) {
        console.log(`Updating Babbar question ${id} to solved: true`);
        return match.replace(/"solved":\s*false/, '"solved": true');
    }
    return match;
});

fs.writeFileSync('src/data/babbarData.js', content);
console.log('Update complete for babbarData.js');
