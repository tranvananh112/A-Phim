const { Server } = require('socket.io');

let io;

module.exports = {
  init: (httpServer, corsOptions) => {
    console.log('--- Initializing Socket.io ---');
    console.log('CORS Origins:', corsOptions.origin);
    
    io = new Server(httpServer, {
      cors: corsOptions,
      path: '/socket.io/', // Explicitly set default path
      transports: ['polling', 'websocket'] // Ensure both are enabled
    });
    
    io.on('connection', (socket) => {
      console.log('🟢 Admin Dashboard Connected:', socket.id);
      
      socket.on('disconnect', (reason) => {
        console.log('🔴 Client disconnected:', socket.id, 'Reason:', reason);
      });
    });
    
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
  emitEvent: (event, data) => {
    if (io) {
      console.log(`📤 Emitting ${event}`);
      io.emit(event, data);
    } else {
        console.warn('⚠️ Cannot emit event, io not initialized');
    }
  }
};
