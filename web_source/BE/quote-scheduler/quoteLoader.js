'use strict';

const db = require('./db');

/**
 * DBからランダムに名言を1件取得する
 * @returns {{ id: number, text: string, author: string } | null}
 */
function fetchRandomQuote() {
  const quote = db
    .prepare('SELECT id, text, author FROM quotes ORDER BY RANDOM() LIMIT 1')
    .get();

  if (!quote) {
    console.warn('[quoteLoader] DBに名言が登録されていません');
    return null;
  }

  return quote;
}

/**
 * 名言を1件登録する（seed.jsから呼び出し）
 * @param {string} text
 * @param {string} author
 */
function insertQuote(text, author = '不明') {
  db.prepare('INSERT INTO quotes (text, author) VALUES (?, ?)').run(text, author);
}

/**
 * 全件取得（確認用）
 * @returns {Array}
 */
function findAll() {
  return db.prepare('SELECT * FROM quotes ORDER BY id').all();
}

module.exports = { fetchRandomQuote, insertQuote, findAll };