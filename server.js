const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);


app.use(express.static(path.join(__dirname, 'public')));


let bookings = [];


const venueNames = [
  'The Garden Terrace',
  'Seaside Bistro',
  'Mountain View Restaurant',
  'Urban Kitchen',
  'The Cozy Corner',
  'Riverside Dining',
  'Chef\'s Table',
  'The Golden Spoon',
  'Moonlight Café',
  'Harbor House',
  'The Local Eatery',
  'Sunset Grill',
  'The Wine Cellar',
  'Downtown Diner',
  'The Secret Garden'
];


function generateRandomBooking() {
  const venue = venueNames[Math.floor(Math.random() * venueNames.length)];
  const partySize = Math.floor(Math.random() * 8) + 1; // 1-8 people
  
  
  const now = new Date();
  
  const timeString = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const booking = {
    id: Date.now() + Math.random(), 
    venueName: venue,
    partySize: partySize,
    time: timeString,
    date: now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }),
    timestamp: new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  };

  return booking;
}

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
 
  socket.emit('existing-bookings', bookings);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});


setInterval(() => {
  const newBooking = generateRandomBooking();
  
  
  bookings.unshift(newBooking);
  if (bookings.length > 50) {
    bookings = bookings.slice(0, 50);
  }
  

  io.emit('new-booking', newBooking);
  
  console.log('New booking generated:', newBooking);
}, 5000);


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Live Bookings Viewer is active - generating mock bookings every 5 seconds');
});