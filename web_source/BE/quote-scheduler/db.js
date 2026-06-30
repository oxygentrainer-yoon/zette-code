'use strict';

const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');

// dataディレクトリがなければ作成
const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'quotes.db');
const db      = new Database(DB_PATH);

// パフォーマンス設定
db.pragma('journal_mode = WAL');

// quotesテーブル定義
db.exec(`
  CREATE TABLE IF NOT EXISTS quotes (
    id         INTEGER  PRIMARY KEY AUTOINCREMENT,
    text       TEXT     NOT NULL,
    author     TEXT     NOT NULL DEFAULT '不明',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;