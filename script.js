
const API_KEY = 'YOUR_API_KEY';
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

let currentWeatherData = null;

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', hour: '2-digit', minute: '2-digit', month: 'long', day: 'numeric', year: 'numeric' };
    document.getElementById('date-time').textContent = now.toLocaleDateString('en-US', options);
}

updateDateTime();
setInterval(updateDateTime, 60000);

const celsiusBtn = document.getElementById('celsius');
const fahrenheitBtn = document.getElementById('fahrenheit');
let isCelsius = true;

celsiusBtn.addEventListener('click', () => {
    if (!isCelsius) {
        isCelsius = true;
        celsiusBtn.classList.add('active');
        fahrenheitBtn.classList.remove('active');
        convertTemperatures();
    }
});

fahrenheitBtn.addEventListener('click', () => {
    if (isCelsius) {
        isCelsius = false;
        fahrenheitBtn.classList.add('active');
        celsiusBtn.classList.remove('active');
        convertTemperatures();
    }
});

function convertTemperatures() {
    if (currentWeatherData) {
        updateWeatherDisplay(currentWeatherData);
    } else {
    
        if (isCelsius) {
            document.getElementById('temperature').innerHTML = '21<sup>°C</sup>';
            document.getElementById('feels-like').textContent = '23°C';
        } else {
            document.getElementById('temperature').innerHTML = '70<sup>°F</sup>';
            document.getElementById('feels-like').textContent = '73°F';
        }
    }
}


const hourlyToggle = document.getElementById('hourly-toggle');
const dailyToggle = document.getElementById('daily-toggle');
const hourlyForecast = document.getElementById('hourly-forecast');
const dailyForecast = document.getElementById('daily-forecast');

hourlyToggle.addEventListener('click', () => {
    hourlyToggle.classList.add('active');
    dailyToggle.classList.remove('active');
    hourlyForecast.style.display = 'grid';
    dailyForecast.style.display = 'none';
});

dailyToggle.addEventListener('click', () => {
    dailyToggle.classList.add('active');
    hourlyToggle.classList.remove('active');
    dailyForecast.style.display = 'block';
    hourlyForecast.style.display = 'none';
});

const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        fetchWeatherData(query);
        searchInput.value = '';
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchButton.click();
    }
});
async function fetchWeatherData(city) {
    try {
        
        showLoadingState();
    
        const weatherResponse = await fetch(
            `${API_BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        
        if (!weatherResponse.ok) {
            throw new Error(`Weather API Error: ${weatherResponse.status}`);
        }
        
        const weatherData = await weatherResponse.json();
        
        const forecastResponse = await fetch(
            `${API_BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`
        );
        
        if (!forecastResponse.ok) {
            throw new Error(`Forecast API Error: ${forecastResponse.status}`);
        }
        
        const forecastData = await forecastResponse.json();
        
    
        currentWeatherData = weatherData;
        
    
        updateWeatherDisplay(weatherData);
        updateForecastDisplay(forecastData);
        
        hideLoadingState();
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showErrorState(error.message);
        hideLoadingState();
    }
}

function updateWeatherDisplay(data) {

    document.getElementById('city-name').textContent = `${data.name}, ${data.sys.country}`;
    
    const temp = isCelsius ? data.main.temp : (data.main.temp * 9/5) + 32;
    const feelsLike = isCelsius ? data.main.feels_like : (data.main.feels_like * 9/5) + 32;
    const unit = isCelsius ? '°C' : '°F';
    
    document.getElementById('temperature').innerHTML = `${Math.round(temp)}<sup>${unit}</sup>`;
    document.getElementById('feels-like').textContent = `${Math.round(feelsLike)}${unit}`;
    
    
    if (document.getElementById('weather-description')) {
        document.getElementById('weather-description').textContent = 
            data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);
    }
    
    if (document.getElementById('humidity')) {
        document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    }
    
    if (document.getElementById('wind-speed')) {
        document.getElementById('wind-speed').textContent = `${data.wind.speed} m/s`;
    }
    
    if (document.getElementById('pressure')) {
        document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
    }
    
    if (document.getElementById('visibility')) {
        document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    }
}

function updateForecastDisplay(data) {

    updateHourlyForecast(data.list.slice(0, 8)); 
    
    
    updateDailyForecast(data.list);
}

function updateHourlyForecast(hourlyData) {
    const hourlyContainer = document.getElementById('hourly-forecast');
    if (!hourlyContainer) return;
    
    hourlyContainer.innerHTML = '';
    
    hourlyData.forEach(item => {
        const time = new Date(item.dt * 1000);
        const temp = isCelsius ? item.main.temp : (item.main.temp * 9/5) + 32;
        const unit = isCelsius ? '°C' : '°F';
        
        const hourlyItem = document.createElement('div');
        hourlyItem.className = 'hourly-item';
        hourlyItem.innerHTML = `
            <div class="time">${time.getHours()}:00</div>
            <div class="temp">${Math.round(temp)}${unit}</div>
            <div class="desc">${item.weather[0].main}</div>
        `;
        
        hourlyContainer.appendChild(hourlyItem);
    });
}

function updateDailyForecast(forecastData) {
    const dailyContainer = document.getElementById('daily-forecast');
    if (!dailyContainer) return;
    
    const dailyData = {};
    forecastData.forEach(item => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!dailyData[date]) {
            dailyData[date] = {
                temps: [],
                weather: item.weather[0],
                date: new Date(item.dt * 1000)
            };
        }
        dailyData[date].temps.push(item.main.temp);
    });
    
    dailyContainer.innerHTML = '';
    
    
    Object.values(dailyData).slice(0, 5).forEach(day => {
        const maxTemp = Math.max(...day.temps);
        const minTemp = Math.min(...day.temps);
        const maxTempDisplay = isCelsius ? maxTemp : (maxTemp * 9/5) + 32;
        const minTempDisplay = isCelsius ? minTemp : (minTemp * 9/5) + 32;
        const unit = isCelsius ? '°C' : '°F';
        
        const dayItem = document.createElement('div');
        dayItem.className = 'daily-item';
        dayItem.innerHTML = `
            <div class="day">${day.date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div class="temps">
                <span class="max">${Math.round(maxTempDisplay)}${unit}</span>
                <span class="min">${Math.round(minTempDisplay)}${unit}</span>
            </div>
            <div class="desc">${day.weather.main}</div>
        `;
        
        dailyContainer.appendChild(dayItem);
    });
}

function showLoadingState() {
    if (document.getElementById('loading')) {
        document.getElementById('loading').style.display = 'block';
    }
}

function hideLoadingState() {
    if (document.getElementById('loading')) {
        document.getElementById('loading').style.display = 'none';
    }
}

function showErrorState(message) {
    if (document.getElementById('error-message')) {
        document.getElementById('error-message').textContent = `Error: ${message}`;
        document.getElementById('error-message').style.display = 'block';
    } else {
        alert(`Weather data unavailable: ${message}`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchWeatherByCoordinates(position.coords.latitude, position.coords.longitude);
            },
            () => {
        
                fetchWeatherData('London');
            }
        );
    } else {
        
        fetchWeatherData('London');
    }
});


async function fetchWeatherByCoordinates(lat, lon) {
    try {
        showLoadingState();
        
        const weatherResponse = await fetch(
            `${API_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        
        if (!weatherResponse.ok) {
            throw new Error(`Weather API Error: ${weatherResponse.status}`);
        }
        
        const weatherData = await weatherResponse.json();
        
        const forecastResponse = await fetch(
            `${API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        
        if (!forecastResponse.ok) {
            throw new Error(`Forecast API Error: ${forecastResponse.status}`);
        }
        
        const forecastData = await forecastResponse.json();
        
        currentWeatherData = weatherData;
        updateWeatherDisplay(weatherData);
        updateForecastDisplay(forecastData);
        hideLoadingState();
        
    } catch (error) {
        console.error('Error fetching weather by coordinates:', error);
        fetchWeatherData('London');
    }
}