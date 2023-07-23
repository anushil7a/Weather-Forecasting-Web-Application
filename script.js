const btn = document.querySelector('#submit-btn');
const weatherContainer = document.querySelector('#weather-info');
const hourlyWeatherContainer = document.querySelector('#hourly-weather-info');
const apiKeyWeather = 'e89b94a8722fece754ffc4659d178453';
const apiKeyTimeZone = 'Y5HBW2MYKPIH';

btn.addEventListener('click', e => {
  e.preventDefault();

  const cityName = document.querySelector('#city-input').value;

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKeyWeather}`)
    .then(response => response.json())
    .then(data => {
      const lat = data.coord.lat;
      const lon = data.coord.lon;
      getTimeZone(lat, lon, apiKeyTimeZone);

      fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=${apiKeyWeather}`)
        .then(response => response.json())
        .then(data => {
          displayWeatherData(data, cityName);
        });

      fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,daily,alerts&appid=${apiKeyWeather}`)
        .then(response => response.json())
        .then(data => {
          displayHourlyWeatherData(data, cityName);
        });
    })
    .catch(error => {
      console.error("Error:", error);
      alert("Could not retrieve weather data. Try again.");
    });
});

function displayWeatherData(data, cityName) {
  let forecastHtml = `<div><h2>Here's the 7-day forecast for ${cityName}:</h2>`;
  
  forecastHtml += '<div class="forecast">';
  
  data.daily.forEach((day, index) => {
    const date = new Date(day.dt * 1000);
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
    const tempCelsius = day.temp.day - 273.15;
    const tempFahrenheit = tempCelsius * 9/5 + 32;
    
    forecastHtml += `
      <div>
        <h3>${dayOfWeek}</h3>
        <p>Expect ${day.weather[0].description}.<br>The temperature will be around ${tempCelsius.toFixed(2)}°C / ${tempFahrenheit.toFixed(2)}°F.</p>
      </div>
    `;
  });

  forecastHtml += `</div></div>`;

  weatherContainer.innerHTML = forecastHtml;
}

function displayHourlyWeatherData(data, cityName) {
  let forecastHtml = `<div><h2>Here's the hourly forecast for ${cityName}:</h2>`;
  
  forecastHtml += '<div class="forecast">';
  
  data.hourly.forEach((hour, index) => {
    if (index < 24) {
      const date = new Date(hour.dt * 1000);
      let hours = date.getHours();
      const minutes = date.getMinutes();
      
      // Change from 24-hour to 12-hour format
      const period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      
      const time = `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${period}`;
      
      const tempCelsius = hour.temp - 273.15;
      const tempFahrenheit = tempCelsius * 9/5 + 32;
      
      forecastHtml += `
        <div>
          <h3>${time}</h3>
          <p>Expect ${hour.weather[0].description}.<br>The temperature will be around ${tempCelsius.toFixed(2)}°C / ${tempFahrenheit.toFixed(2)}°F.</p>
        </div>
      `;
    }
  });

  forecastHtml += `</div></div>`;

  hourlyWeatherContainer.innerHTML = forecastHtml;
}


function getTimeZone(lat, lon, key) {
  fetch(`http://api.timezonedb.com/v2.1/get-time-zone?key=${key}&format=json&by=position&lat=${lat}&lng=${lon}`)
    .then(response => response.json())
    .then(data => {
      const time24 = data.formatted.split(' ')[1];
      const [hours24, minutes] = time24.split(':');
      let period = 'AM';
      let hours12 = parseInt(hours24);
      
      if (hours12 >= 12) {
        period = 'PM';
        if (hours12 > 12) hours12 -= 12;
      } else if (hours12 == 0) {
        hours12 = 12;
      }
      
      const time12 = `${hours12}:${minutes} ${period}`;
      document.querySelector('#time').textContent = `Time: ${time12}`;
    });
}

function openForecast(evt, forecastName) {
  // Declare all variables
  let i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(forecastName).style.display = "block";
  evt.currentTarget.className += " active";
}

