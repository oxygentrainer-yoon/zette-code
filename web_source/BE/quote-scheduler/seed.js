'use strict';

const { insertQuote, findAll } = require('./quoteLoader');

// tabacomyuテーマ (煙・タバコ・ひと息) の名言
const QUOTES = [
  { text: '煙草の煙のように、言葉も空気に溶けていく。',           author: '不明' },
  { text: '一服の煙草は、嵐の中の小さな平和だ。',               author: '不明' },
  { text: 'タバコは孤独な人間の友達であり、忙しい人間の敵だ。',   author: 'J.J.コルソ' },
  { text: '煙は消えても、その温もりは残る。',                   author: '不明' },
  { text: '火をつける勇気があれば、煙になる覚悟もある。',         author: '不明' },
  { text: '良い会話は、良い煙草と同じだ。最後の一口が一番旨い。', author: '不明' },
  { text: '人生は短い。だからこそ、一息一息を大切に。',           author: '不明' },
  { text: '煙が上るとき、考えが降りてくる。',                   author: '不明' },
  { text: '灰になるまで燃え続けることが、存在の証明だ。',         author: '不明' },
  { text: '誰かと煙草を吸う時間は、言葉がいらない対話だ。',       author: '不明' },
];

function seed() {
  const existing = findAll();

  if (existing.length > 0) {
    console.log(`[seed] すでに ${existing.length} 件登録済みのためスキップします`);
    process.exit(0);
  }

  console.log('[seed] 名言を登録中...');
  QUOTES.forEach(({ text, author }) => {
    insertQuote(text, author);
    console.log(`  登録: "${text}"`);
  });

  console.log(`[seed] 完了 — ${QUOTES.length} 件登録しました`);
}

seed();