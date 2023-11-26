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
        var batteryString = (battery.level * 100).toFixed(0) + "% " + (battery.charging ? "↑" : "↓");
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

let wakeLock = null;

async function requestWakeLock() {
    if ('wakeLock' in navigator) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake Lock is active');
        } catch (err) {
            console.error(`${err.name}, ${err.message}`);
        }
    }
}

async function releaseWakeLock() {
    if (wakeLock !== null) {
        await wakeLock.release();
        wakeLock = null;
        console.log('Wake Lock is released');
    }
}

function toggleFullScreen() {
    if (!document.fullscreenElement &&
        !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {

        // Entering full screen
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
        requestWakeLock(); // Request wake lock when entering full screen
        updateWeather();
        updateText();
    } else {
        // Exiting full screen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
        releaseWakeLock(); // Release wake lock when exiting full screen
    }
}

document.addEventListener('click', toggleFullScreen);

async function getNextRainOrSnow() {
    try {
        const position = await getCurrentLocation();
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=precipitation`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return analyzePrecipitationData(data.hourly);
    } catch (error) {
        console.error('Error:', error);
    }
}

function analyzePrecipitationData(hourlyData) {
    let isRaining = hourlyData.precipitation[0] > 0;
    let currentTime = new Date(hourlyData.time[0]);

    for (let i = 1; i < hourlyData.precipitation.length; i++) {
        const currentPrecipitation = hourlyData.precipitation[i];
        const forecastTime = new Date(hourlyData.time[i]);

        if ((isRaining && currentPrecipitation === 0) || (!isRaining && currentPrecipitation > 0)) {
            const hoursUntilChange = Math.abs(forecastTime - currentTime) / 36e5; // Convert milliseconds to hours
            return {
                time: hourlyData.time[i],
                startsRaining: !isRaining,
                hours: hoursUntilChange
            };
        }

        isRaining = currentPrecipitation > 0;
    }

    return null;
}

function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
        } else {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        }
    });
}

let weatherInterval;

function updateWeather() {
    getNextRainOrSnow()
    .then(result => {
        if (result) {
            var hoursUntilChange = Math.floor(result.hours);
            updateWeatherText(hoursUntilChange, result.startsRaining);

            // Clear any existing interval
            if (weatherInterval) {
                clearInterval(weatherInterval);
            }

            // Set up an interval to update the text every hour
            weatherInterval = setInterval(() => {
                hoursUntilChange--;
                if (hoursUntilChange >= 0) {
                    updateWeatherText(hoursUntilChange, result.startsRaining);
                } else {
                    clearInterval(weatherInterval);
                    document.getElementById('weather').textContent = "?";
                }
            }, 3600000); // 3600000ms = 1 hour
        } else {
            document.getElementById('weather').textContent = "?";
        }
    })
    .catch(error => console.error('Error:', error));
}

function updateWeatherText(hours, startsRaining) {
    var weatherString = (startsRaining ? "🌧️" : "☀️") + " in " + hours + " hrs";
    document.getElementById('weather').textContent = weatherString;
}

function updateText() {
    var paragraph = document.getElementById('infoParagraph');
    if (paragraph.style.display === 'none') {
        paragraph.style.display = 'block'; // Make the paragraph visible again
    } else {
        paragraph.style.display = 'none'; // Hide the paragraph
    }
}