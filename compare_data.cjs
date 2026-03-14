const fs = require('fs');
const path = require('path');

// Mock export for node environment
const initialTopics = [];
const babbarTopics = [];

// Helper to read JS files that use ES modules by extracting the array
function extractArray(filePath, arrayName) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const startIdx = content.indexOf(`${arrayName} = [`);
    if (startIdx === -1) return [];
    
    // This is a bit hacky but works for this structure
    // We want to evaluate the array literal. 
    // A safer way is to regex it or strip the export.
    const arrayContent = content.substring(startIdx + arrayName.length + 3);
    // Find the end of the array (last ];)
    // For simplicity, we'll assume the file ends with it or use eval (carefully)
    // Actually, let's just use a more robust regex-based extraction if possible,
    // or just use node's ability to read ESM if we setup a temporary environment.
}

// Since I can't easily eval ESM files with complex characters, 
// I'll use a script that I run via node -e or similar, 
// but even better: I'll write a specialized parser.

// Actually, I can just read the files as strings and extract the ID/Title etc.
function getExistingIds(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const matches = content.matchAll(/"id":\s*(\d+|"g-\d+"|"(?:babbar-|)[^"]+")/g);
    const ids = new Set();
    for (const match of matches) {
        let id = match[1];
        if (id.startsWith('"')) id = id.substring(1, id.length - 1);
        ids.add(String(id));
    }
    return ids;
}

const existingIds = new Set([
    ...getExistingIds('src/data/initialData.js'),
    ...getExistingIds('src/data/babbarData.js')
]);

const parsedQuestions = JSON.parse(fs.readFileSync('/tmp/parsed_questions.json', 'utf-8'));

const existingInList = [];
const newInList = [];

for (const q of parsedQuestions) {
    if (existingIds.has(String(q.id))) {
        existingInList.push(q);
    } else {
        newInList.push(q);
    }
}

console.log(`Existing: ${existingInList.length}`);
console.log(`New: ${newInList.length}`);

// Generate leet160Data.js
const leet160Content = `export const leet160Topics = [
    {
        "id": "leetcode-top-150-plus",
        "topicName": "LeetCode Hot 150+",
        "questions": ${JSON.stringify(newInList, null, 8)}
    }
];`;

fs.writeFileSync('src/data/leet160Data.js', leet160Content);

// To mark existing ones as solved, we need their topic IDs.
// I'll parse the files more carefully to find topicId for each questionId.
function getQuestionMapping(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Simple parser: find topic start, then find questions within it.
    const topics = [];
    const topicSplit = content.split(/\{\s*"id":\s*"/);
    for (const part of topicSplit.slice(1)) {
        const topicId = part.split('"')[0];
        const questionsPart = part.split('"questions": [')[1];
        if (!questionsPart) continue;
        const qMatches = questionsPart.split(']')[0].matchAll(/"id":\s*(\d+|"[^"]+")/g);
        for (const qMatch of qMatches) {
            let qId = qMatch[1];
            if (qId.startsWith('"')) qId = qId.substring(1, qId.length - 1);
            topics.push({ qId: String(qId), topicId });
        }
    }
    return topics;
}

const mapping = [
    ...getQuestionMapping('src/data/initialData.js'),
    ...getQuestionMapping('src/data/babbarData.js')
];

const updates = [];
for (const q of existingInList) {
    const m = mapping.find(item => item.qId === String(q.id));
    if (m) {
        updates.push({ topicId: m.topicId, questionId: q.id });
    }
}

fs.writeFileSync('/tmp/firestore_updates.json', JSON.stringify(updates, null, 2));
console.log(`Ready to update ${updates.length} existing questions in Firestore.`);
