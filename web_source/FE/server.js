const WebSocket = require('ws');
const crypto = require('crypto');

const PORT = process.env.WS_PORT || 3000;
const TOTAL_TIME = 5 * 60 * 1000;
const ROOM_CAPACITY = parseInt(process.env.ROOM_CAPACITY || '20', 10);

const axios = require('axios');
const FILTER_SERVICE_URL = process.env.FILTER_SERVICE_URL || 'http://127.0.0.1:4000/filter';

const rooms = new Map();
let nextRoomNumber = 1;

const wss = new WebSocket.Server({ port: PORT });

const {
    writeDB,
    fetchDB
} = require('./services/fetchDB');

console.log(`WebSocket server started on port ${PORT}`);

function sendJson(ws, obj) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(obj));
    }
}

function broadcastJson(clients, obj) {
    const payload = JSON.stringify(obj);
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }
    });
}

function createRoom() {
    const roomId = `ROOM-${String(nextRoomNumber).padStart(3, '0')}`;
    nextRoomNumber += 1;
    const room = {
        id: roomId,
        clients: new Set()
    };

    rooms.set(roomId, room);
    return room;
}

function getAvailableRoom() {
    for (const room of rooms.values()) {
        if (room.clients.size < ROOM_CAPACITY) {
            return room;
        }
    }

    return createRoom();
}

function assignRoom(ws) {
    const room = getAvailableRoom();
    room.clients.add(ws);
    ws.roomId = room.id;
    return room;
}

function getRoomBySocket(ws) {
    if (!ws.roomId) {
        return null;
    }

    return rooms.get(ws.roomId) || null;
}

function broadcastRoomInfo(room) {
    if (!room) {
        return;
    }

    broadcastJson(room.clients, {
        type: 'room_info',
        roomId: room.id,
        occupants: room.clients.size,
        capacity: ROOM_CAPACITY
    });
}

function broadcastToRoom(ws, obj) {
    const room = getRoomBySocket(ws);
    if (!room) {
        return;
    }

    broadcastJson(room.clients, obj);
}

function removeFromRoom(ws) {
    const room = getRoomBySocket(ws);
    if (!room) {
        return;
    }

    room.clients.delete(ws);
    ws.roomId = null;

    if (room.clients.size === 0) {
        rooms.delete(room.id);
        return;
    }

    broadcastRoomInfo(room);
}

function sendInitialState(ws) {
    const serverTime = Date.now();
    const elapsed = Math.max(serverTime - ws.sessionStart, 0);
    const remainingTime = Math.max(TOTAL_TIME - elapsed, 0);
    const room = getRoomBySocket(ws);

    sendJson(ws, {
        type: 'room_assigned',
        clientId: ws.clientId,
        roomId: room ? room.id : null,
        occupants: room ? room.clients.size : 0,
        capacity: ROOM_CAPACITY
    });

    sendJson(ws, {
        type: 'timer_sync',
        startTime: ws.sessionStart,
        totalTime: TOTAL_TIME,
        serverTime,
        remainingTime
    });
}

function clearSessionTimer(ws) {
    if (ws.sessionTimer) {
        clearTimeout(ws.sessionTimer);
        ws.sessionTimer = null;
    }
}

function startSession(ws) {
    clearSessionTimer(ws);
    ws.sessionStart = Date.now();
    ws.sessionTimer = setTimeout(() => endSession(ws), TOTAL_TIME);
}

function endSession(ws) {
    clearSessionTimer(ws);
    sendJson(ws, { type: 'session_ended', serverTime: Date.now() });
    removeFromRoom(ws);
}

wss.on('connection', (ws) => {
    ws.clientId = crypto.randomUUID();
    const room = assignRoom(ws);
    startSession(ws);
    console.log(`Client connected -> ${room.id} (${room.clients.size}/${ROOM_CAPACITY})`);
    sendInitialState(ws);
    broadcastRoomInfo(room);

    ws.on('message', async (message) => {
        let data;
        try {
            data = JSON.parse(message.toString());
        } catch (error) {
            console.error('Invalid JSON received:', error);
            return;
        }

        if (data.type === 'chat') {
            const originalMessage = String(data.message || '').trim().slice(0, 20);

            try {
                const filterResult = await axios.post(
                    FILTER_SERVICE_URL,
                    {
                        message: originalMessage,
                        roomId: ws.roomId
                    }
                );

                if (!filterResult.data.allowed) {
                    sendJson(ws, {
                        type: 'chat_blocked',
                        reason: filterResult.data.reason,
                        matchedWord: filterResult.data.matchedWord,
                        serverTime: Date.now()
                    });

                    return;
                }

                const savedMessage = writeDB(filterResult.data.message);

                broadcastToRoom(ws, {
                    type: 'chat',
                    id: savedMessage.id,
                    message: savedMessage.message,
                    x: savedMessage.x,
                    y: savedMessage.y,
                    serverTime: savedMessage.createdAt
                });

            } catch (error) {
                console.error('filter-service error:', error.message);

                sendJson(ws, {
                    type: 'chat_blocked',
                    reason: 'filter_service_unavailable',
                    serverTime: Date.now()
                });
            }

            return;
        }

        if (data.type === 'inhale_start') {
            broadcastToRoom(ws, {
                type: 'inhale_start',
                clientId: ws.clientId,
                serverTime: Date.now()
            });
            return;
        }

        if (data.type === 'inhale_end') {
            broadcastToRoom(ws, {
                type: 'inhale_end',
                clientId: ws.clientId,
                serverTime: Date.now()
            });
            return;
        }

        if (data.type === 'start_new_session') {
            const room = assignRoom(ws);
            startSession(ws);
            sendInitialState(ws);
            broadcastRoomInfo(room);
            return;
        }

        console.log('Unknown message type:', data.type);
    });

    ws.on('close', () => {
        clearSessionTimer(ws);
        const roomId = ws.roomId;
        removeFromRoom(ws);
        console.log(`Client disconnected${roomId ? ` <- ${roomId}` : ''}`);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});