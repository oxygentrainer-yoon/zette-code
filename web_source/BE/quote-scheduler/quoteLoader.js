'use strict';

const fs   = require('fs');
const path = require('path');

const QUOTES_PATH = path.join(__dirname, 'quotes.json');

// JSONファイルから名言を読み込む
const quotes = JSON.parse(fs.readFileSync(QUOTES_PATH, 'utf-8'));

/**
 * ランダムに名言を1件返す
 * @returns {{ text: string, author: string } | null}
 */
function fetchRandomQuote() {
  if (quotes.length === 0) return null;
  const index = Math.floor(Math.random() * quotes.length);
  return quotes[index];
}

module.exports = { fetchRandomQuote };
