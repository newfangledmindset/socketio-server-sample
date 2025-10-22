import express from 'express';
const app = express();
import { createServer } from 'http';
const server = createServer(app);
import { Server } from "socket.io";
import locationSchema from './schemas/location.schema';
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('join', (room) => {
    socket.join(room);
    console.log(`user joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('update', (data) => {
    try {
      const { room, location } = locationSchema.parse(data);
      io.to(room).emit('update', location);
    } catch (error) {
      console.error("Invalid message received:", error.errors);
      // Optionally, inform the client about the error
      // socket.emit('validation_error', error.flatten());
    }
  });
});

// JWT Validation middleware
/*
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error: No token provided."));
  }

  jwt.verify(token, "YOUR_SECRET_KEY", (err, decoded) => {
    if (err) {
      return next(new Error("Authentication error: Invalid token."));
    }
    socket.user = decoded;
    next();
  });
});
*/
server.listen(3000, () => {
  console.log('listening on *:3000');
});
