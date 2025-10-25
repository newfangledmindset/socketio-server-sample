import path from 'path';
import express from 'express';
const app = express();
import { createServer } from 'http';
const server = createServer(app);
import { Server } from "socket.io";
import RequestSchema from './schemas/request.schema.js';
import jwt from 'jsonwebtoken';

const io = new Server(server);

const __dirname = path.resolve();

const roomDataMap = new Map();

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  const userId = socket.user;

  socket.on('join', (roomId) => {
    let dataMap = roomDataMap.get(roomId);

    if (!dataMap) {
      dataMap = new Map();
      roomDataMap.set(roomId, dataMap);
    }

    dataMap.set(userId, {
      latitude: 0,
      longitude: 0,
    });

    socket.join(roomId);

    console.log(`user joined room: ${roomId}`);
    console.log(`user id: ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('locationUpdate', (data) => {
    try {
      console.log(data);
      const { roomId, latitude, longitude, nickname } = RequestSchema.parse(data);
      const dataMap = roomDataMap.get(roomId);
      if (!dataMap) {
        throw new Error(`Room ${roomId} does not exist.`);
      }

      const userData = dataMap.get(userId);
      if (!userData) {
        throw new Error(`User ${userData} does not exist in Room ${roomId}`);
      }

      dataMap.set(userId, { latitude, longitude, nickname });
      const it = dataMap.values();
      const response = Array.from(it);

      console.log('Response: ', response);

      io.to(roomId).emit('locationUpdated', response);
    } catch (error) {
      console.error("Invalid message received:", error);
      // Optionally, inform the client about the error
      // socket.emit('validation_error', error.flatten());
    }
  });
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error: No token provided."));
  }

  const decodedToken = jwt.decode(token);

  if (!decodedToken.userId) {
    return next(new Error("Authentication error: Invalid token provided."));
  }

  // user = userId
  socket.user = decodedToken.userId;

  next();

  /* API 서버의 Secret key 필요
  jwt.verify(token, "YOUR_SECRET_KEY", (err, decoded) => {
    if (err) {
      return next(new Error("Authentication error: Invalid token."));
    }
    socket.user = decoded;
    next();
  });
  */
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
