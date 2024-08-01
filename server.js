const express = require('express');
const bodyParser = require('body-parser');
const { Engine } = require('json-rules-engine');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// Load rules from the JSON file
const rules = JSON.parse(fs.readFileSync('rules.json'));

const engine = new Engine();

rules.forEach(rule => engine.addRule(rule));

app.post('/check-similarity', async (req, res) => {
    const { text1, text2 } = req.body;
    const similarity = calculateSimilarity(text1, text2);

    const facts = { similarity };

    try {
        const events = await engine.run(facts);
        const message = events.length > 0 ? events[0].params.message : 'No specific message';

        res.json({ similarity, message });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

function calculateSimilarity(text1, text2) {
    const lowerText1 = text1.toLowerCase();
    const lowerText2 = text2.toLowerCase();

    const words1 = lowerText1.split(' ');
    const words2 = lowerText2.split(' ');

    const intersection = words1.filter(word => words2.includes(word)).length;
    const union = new Set([...words1, ...words2]).size;

    return (intersection / union) * 100;
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
