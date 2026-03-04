import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    path: '/socket.io/',
    addTrailingSlash: true,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Make io available globally for Next.js API routes
  global.io = io;

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-ticket', (ticketId) => {
      socket.join(ticketId);
      console.log(`Socket ${socket.id} joined ticket: ${ticketId}`);
    });

    socket.on('leave-ticket', (ticketId) => {
      socket.leave(ticketId);
      console.log(`Socket ${socket.id} left ticket: ${ticketId}`);
    });

    // When a message is sent via API, we'll notify clients.
    // However, to keep it simple, we'll also allow sockets to emit messages if needed,
    // but the API-centric approach is better for persistence.
    // For now, let's just use it to notify about new messages.
    socket.on('new-message', ({ ticketId, message }) => {
      io.to(ticketId).emit('message-received', message);
    });

    socket.on('ticket-updated', (ticketId) => {
      io.to(ticketId).emit('refresh-ticket');
    });

    socket.on('typing', ({ ticketId, userId, userName, isTyping }) => {
      socket.to(ticketId).emit('user-typing', { userId, userName, isTyping });
    });

    socket.on('mark-seen', ({ ticketId, userId }) => {
      io.to(ticketId).emit('messages-seen', { ticketId, userId });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
