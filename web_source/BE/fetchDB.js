const crypto = require('crypto');

const messages = [];

function writeDB(message, nickname = 'anonymous') {
    const record = {
        id: crypto.randomUUID(),
        nickname,
        message,
        createdAt: Date.now(),
        x: Math.floor(Math.random() * 380) + 50,
        y: Math.floor(Math.random() * 120) + 30
    };

    messages.push(record);

    setTimeout(() => {
        const index = messages.findIndex(msg => msg.id === record.id);

        if (index !== -1) {
            messages.splice(index, 1);
        }
    }, 5000);

    return record;
}

function fetchDB() {
    return [...messages].sort((a, b) => a.createdAt - b.createdAt);
}

module.exports = {
    writeDB,
    fetchDB
};