function updateDateTime() {
    const now = new Date();
    updateTimer(now);
    updateDate(now);
    updateCharge();
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

function updateCharge() {
    navigator.getBattery().then(function(battery) {
        var batteryString = (battery.level * 100).toFixed(0) + "%" + (battery.charging ? "⬆️" : "⬇️");
        document.getElementById('charge').textContent = batteryString;
    });
}



function moveTimer() {
    moveElement('timer-container');
}

function moveElement(elementId) {
    const element = document.getElementById(elementId);
    
    // X coordinate can range from 0 to (window width - element width)
    const x = Math.floor(Math.random() * (window.innerWidth / 2 - element.clientWidth));

    // Y coordinate ranges from 0 to (1/3 of window height - element height)
    // Adjust the divisor (3 in this case) to change the vertical range
    const y = Math.floor(Math.random() * (window.innerHeight / 3 - element.clientHeight));

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

function toggleFullScreen() {
    if (!document.fullscreenElement &&    // alternative standard method
        !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}

document.addEventListener('click', toggleFullScreen);

async function requestWakeLock() {
    if ('wakeLock' in navigator) {
        try {
            const wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake Lock is active');

            // Handle visibility change or page unload to release the wake lock
            // ...
        } catch (err) {
            console.error(`${err.name}, ${err.message}`);
        }
    }
}

requestWakeLock();
