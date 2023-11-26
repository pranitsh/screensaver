function updateDateTime() {
    const now = new Date();
    updateTimer(now);
    updateDate(now);
    moveTimer();
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
    const timer = document.getElementById('timer');
    const x = Math.floor(Math.random() * (window.innerWidth - timer.clientWidth));
    const y = Math.floor(Math.random() * (window.innerHeight - timer.clientHeight));
    timer.style.left = `${x}px`;
    timer.style.top = `${y}px`;
}

setInterval(updateDateTime, 1000);
updateDateTime();

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
  