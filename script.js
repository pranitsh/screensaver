function updateDateTime() {
    const now = new Date();
    updateTimer(now);
    updateDate(now);
}

function updateTimer(now) {
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const diff = endOfDay - now;

    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor(diff / 1000 / 60) % 60;
    const seconds = Math.floor(diff / 1000) % 60;

    document.getElementById('timer').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateDate(now) {
    const dateStr = `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}/${now.getFullYear().toString().substr(-2)}`;
    document.getElementById('date').textContent = dateStr;
}

function moveTimer() {
    moveElement('timer-container');
}

function moveElement(elementId) {
    const element = document.getElementById(elementId);
    const x = Math.floor(Math.random() * (window.innerWidth - element.clientWidth));
    const y = Math.floor(Math.random() * (window.innerHeight - element.clientHeight));
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
}

// Update the timer every second
setInterval(updateDateTime, 1000);
updateDateTime();

// Move the timer and the date every 10 minutes (600000 milliseconds)
setInterval(moveTimer, 60000);
moveTimer();  // Call it once initially to position the elements

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
        // Registration was successful
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, function(err) {
        // registration failed :(
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }
  