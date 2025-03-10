
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
            
            if (isCelsius) {
                document.getElementById('temperature').innerHTML = '21<sup>°C</sup>';
                document.getElementById('feels-like').textContent = '23°C';
            } else {
                document.getElementById('temperature').innerHTML = '70<sup>°F</sup>';
                document.getElementById('feels-like').textContent = '73°F';
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
                document.getElementById('city-name').textContent = query;
                searchInput.value = '';
                fetchWeatherData(query); 
            }
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchButton.click();
            }
        });

async function fetchWeatherData(city) {
    try {
        const apiKey = 'YOUR_API_KEY';
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        
        if (response.ok) {
            updateWeatherDisplay(data);
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Failed to fetch weather data:', error);
        alert('Failed to fetch weather data. Please try again.');
    }
}

function updateWeatherDisplay(data) {
    document.getElementById('city-name').textContent = data.name;
    document.getElementById('temperature').innerHTML = `${Math.round(data.main.temp)}<sup>°C</sup>`;
    document.getElementById('condition-text').textContent = data.weather[0].description;
    document.getElementById('feels-like').textContent = `${Math.round(data.main.feels_like)}°C`;
}