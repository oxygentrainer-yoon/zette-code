const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');

const app = express();
const PORT = process.env.APP_PORT || process.env.FILTER_PORT || 4000;
const GATEWAY_WS_URL = process.env.GATEWAY_WS_URL || 'http://127.0.0.1:3000';

const pool = new Pool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'tabacomyu_filter',
    user: process.env.DB_USER || 'filter_user',
    password: process.env.DB_PASSWORD || 'filter_pass',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

app.use(express.json());

app.post('/filter', async (req, res) => {
    const originalMessage = String(req.body.message || '').trim();
    const lowerMessage = originalMessage.toLowerCase();

    try {
        const result = await pool.query(
            `SELECT word FROM blocked_words WHERE enabled = true`
        );

        const blockedWords = result.rows.map(row => row.word.toLowerCase());

        const matchedWord = blockedWords.find(word =>
            lowerMessage.includes(word)
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

// quote-schedulerから名言を受け取りgateway-wsへ転送するエンドポイント
app.post('/internal/quote', async (req, res) => {
    const { text, source } = req.body;

    if (!text || !source) {
        return res.status(400).json({ error: 'text and source are required' });
    }

    console.log(`[internal/quote] 受信: "${text}" / ${source}`);

    try {
        await axios.post(`${GATEWAY_WS_URL}/internal/quote`, { text, source });
        console.log(`[internal/quote] gateway-wsへ転送OK`);
        return res.json({ status: 'ok' });
    } catch (err) {
        console.error(`[internal/quote] gateway-ws転送失敗: ${err.message}`);
        return res.status(500).json({ error: 'gateway_error' });
    }
});
