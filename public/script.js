const socket = io();


const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const bookingsList = document.getElementById('bookingsList');
const totalBookingsEl = document.getElementById('totalBookings');
const totalGuestsEl = document.getElementById('totalGuests');
const lastBookingTimeEl = document.getElementById('lastBookingTime');


let totalBookings = 0;
let totalGuests = 0;
let lastBookingTime = null;

socket.on('connect', () => {
    console.log('Connected to server');
    updateConnectionStatus('connected', 'Connected');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    updateConnectionStatus('disconnected', 'Disconnected');
});

socket.on('connect_error', (error) => {
    console.log('Connection error:', error);
    updateConnectionStatus('disconnected', 'Connection Error');
});


socket.on('existing-bookings', (bookings) => {
    console.log('Received existing bookings:', bookings.length);
    
  
    bookingsList.innerHTML = '';
    
    if (bookings.length === 0) {
        showEmptyState();
    } else {
        // Display existing bookings
        bookings.forEach(booking => {
            addBookingToDOM(booking, false); 
        });
        updateStats();
    }
});


socket.on('new-booking', (booking) => {
    console.log('New booking received:', booking);
    addBookingToDOM(booking, true); 
    updateStats();
    updateLastBookingTime();
});


function updateConnectionStatus(status, text) {
    statusIndicator.className = `status-indicator ${status}`;
    statusText.textContent = text;
}


function addBookingToDOM(booking, animate = true) {
 
    const emptyState = bookingsList.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }

  
    const bookingElement = createBookingElement(booking);
    
  
    if (animate) {
        bookingElement.style.opacity = '0';
        bookingElement.style.transform = 'translateY(-20px)';
    }
    
  
    bookingsList.insertBefore(bookingElement, bookingsList.firstChild);
    
 
    if (animate) {
        setTimeout(() => {
            bookingElement.style.opacity = '1';
            bookingElement.style.transform = 'translateY(0)';
        }, 50);
    }
    
   
    totalBookings++;
    totalGuests += booking.partySize;
}


function createBookingElement(booking) {
    const bookingDiv = document.createElement('div');
    bookingDiv.className = 'booking-item';
    bookingDiv.innerHTML = `
        <div class="booking-info">
            <div class="venue-name">${escapeHtml(booking.venueName)}</div>
            <div class="booking-details">
                <div class="booking-time">
                    <span>🕒</span>
                    <span>${booking.time}</span>
                </div>
                <div class="booking-date">
                    <span>📅</span>
                    <span>${booking.date}</span>
                </div>
                <div class="booking-timestamp">
                    <span>⏰</span>
                    <span>Created: ${booking.timestamp}</span>
                </div>
            </div>
        </div>
        <div class="party-size ${getPartySizeClass(booking.partySize)}">
            <span>👥</span>
            <span>${booking.partySize} ${booking.partySize === 1 ? 'Guest' : 'Guests'}</span>
        </div>
    `;
    
    return bookingDiv;
}


function getPartySizeClass(partySize) {
    if (partySize <= 2) return 'party-size-1';
    if (partySize <= 4) return 'party-size-3';
    if (partySize <= 6) return 'party-size-5';
    return 'party-size-large';
}


function updateStats() {
    totalBookingsEl.textContent = totalBookings;
    totalGuestsEl.textContent = totalGuests;
}

function updateLastBookingTime() {
    const now = new Date();
    lastBookingTimeEl.textContent = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
}


function showEmptyState() {
    bookingsList.innerHTML = `
        <div class="empty-state">
            <h3>No bookings yet</h3>
            <p>New bookings will appear here automatically every 5 seconds</p>
        </div>
    `;
}


function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}


document.addEventListener('DOMContentLoaded', () => {
    updateStats();
});