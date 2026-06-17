const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = 4000;
const pool = new Pool({
    host: '127.0.0.1',
    port: 5432,
    database: 'tabacomyu_filter',
    user: 'filter_user',
    password: 'filter_pass'
});


app.use(express.json());

app.post('/filter', async (req, res) => {
    const originalMessage = String(req.body.message || '');
    const lowerMessage = originalMessage.toLowerCase();

    try {
        const result = await pool.query(
            `
            SELECT word
            FROM blocked_words
            WHERE enabled = true
            `
        );

        const blockedWords = result.rows.map(row => row.word);

        const matchedWord = blockedWords.find(word =>
            lowerMessage.includes(word.toLowerCase())
        );

        if (matchedWord) {
            return res.json({
                allowed: false,
                reason: 'blocked_word',
                matchedWord,
                message: ''
            });
        }

        return res.json({
            allowed: true,
            reason: null,
            matchedWord: null,
            message: originalMessage
        });

    } catch (error) {
        console.error('Database error:', error);

        return res.status(500).json({
            allowed: false,
            reason: 'database_error'
        });
    }
});

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'filter-service'
    });
});

app.listen(PORT, () => {
    console.log(`filter-service started on port ${PORT}`);
});