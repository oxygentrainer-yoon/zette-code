'use strict';

const axios            = require('axios');
const { fetchRandomQuote } = require('./quoteLoader');

const GATEWAY_URL  = process.env.GATEWAY_URL  || 'http://localhost:3001';
const INTERVAL_MS  = parseInt(process.env.INTERVAL_MS  || '30000', 10); // 30秒
const ENDPOINT     = `${GATEWAY_URL}/internal/quote`;

/**
 * gateway-wsに名言を送信する
 * @param {{ text: string, author: string }} quote
 */
async function postQuote(quote) {
  try {
    await axios.post(ENDPOINT, {
      text:   quote.text,
      source: quote.author,
    });
    console.log(`[quote-scheduler] 送信OK — "${quote.text}" / ${quote.author}`);

  } catch (err) {
    // gateway-wsが未起動でも落ちないようにエラーを握りつぶす
    console.error(`[quote-scheduler] 送信失敗: ${err.message}`);
  }
}

/**
 * スケジューラ起動
 */
function startScheduler() {
  console.log(`[quote-scheduler] 起動 (送信間隔: ${INTERVAL_MS / 1000}秒)`);
  console.log(`[quote-scheduler] 送信先: ${ENDPOINT}`);

  // 起動直後に1回送信
  (async () => {
    const quote = fetchRandomQuote();
    if (quote) await postQuote(quote);
  })();

  // 以降はインターバルで繰り返し
  setInterval(async () => {
    const quote = fetchRandomQuote();
    if (!quote) return;
    await postQuote(quote);
  }, INTERVAL_MS);
}

startScheduler();