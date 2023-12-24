"use strict";

const API_KEY = "4d6d5a6c57ea7cc0b5d2b27a64d1cea4";

const dayEl = document.querySelector(".default_day");
const dateEl = document.querySelector(".default_date");
const btnEl = document.querySelector(".btn_search");
const inputEl = document.querySelector(".input_field");

const iconsContainer = document.querySelector(".icons");
const dayInfoEl = document.querySelector(".day_info");
const listContentEl = document.querySelector(".list_content ul");

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Display the day
const day = new Date();
const dayName = days[day.getDay()];
dayEl.textContent = dayName;

// Display date
const month = day.toLocaleString("default", { month: "long" });
const date = day.getDate();
const year = day.getFullYear();
dateEl.textContent = date + " " + month + " " + year;

// Add event
btnEl.addEventListener("click", async (e) => {
  e.preventDefault();

  // Check for empty value
  if (inputEl.value !== "") {
    const search = inputEl.value.toLowerCase();
    inputEl.value = "";
    await findLocation(search);
  } else {
    console.log("Please Enter City or Country Name");
  }
});

async function findLocation(name) {
  iconsContainer.innerHTML = "";
  dayInfoEl.innerHTML = "";
  listContentEl.innerHTML = "";
  try {
    const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${name}&appid=${API_KEY}`;
    const data = await fetch(API_URL);
    const result = await data.json();
    console.log(result);

    if (result.cod !== "404") {
      // Display image content
      const imageContent = displayImageContent(result);
      // Display right side content
      const rightSide = rightSideContent(result);
      // Forecast function
      await displayForeCast(result.coord.lat, result.coord.lon);

      setTimeout(() => {
        iconsContainer.insertAdjacentHTML("afterbegin", imageContent);
        iconsContainer.classList.add("fadeIn");
        dayInfoEl.insertAdjacentHTML("afterbegin", rightSide);

        // Send SMS after displaying weather information
        const weatherContent = getWeatherContent(result);
        sendMessage(weatherContent);
      }, 1500);
    } else {
      const message = `<h2 class="weather_temp">${result.cod}</h2>
      <h3 class="cloudtxt">${result.message}</h3>`;
      iconsContainer.insertAdjacentHTML("afterbegin", message);
    }
  } catch (error) {
    console.error(error);
  }
}

// Display image content and temp
function displayImageContent(data) {
  return `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" alt="" />
    <h2 class="weather_temp">${Math.round(data.main.temp - 275.15)}°C</h2>
    <h3 class="cloudtxt">${data.weather[0].description}</h3>`;
}

// Display the right side content
function rightSideContent(result) {
  return `<div class="content">
          <p class="title">NAME</p>
          <span class="value">${result.name}</span>
        </div>
        <div class="content">
          <p class="title">TEMP</p>
          <span class="value">${Math.round(result.main.temp - 275.15)}°C</span>
        </div>
        <div class="content">
          <p class="title">HUMIDITY</p>
          <span class="value">${result.main.humidity}%</span>
        </div>
        <div class="content">
          <p class="title">WIND SPEED</p>
          <span class="value">${result.wind.speed} Km/h</span>
        </div>`;
}

async function displayForeCast(lat, long) {
  const ForeCast_API = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&appid=${API_KEY}`;
  const data = await fetch(ForeCast_API);
  const result = await data.json();

  // Filter the forecast
  const uniqueForecastDays = [];
  const daysForecast = result.list.filter((forecast) => {
    const forecastDate = new Date(forecast.dt_txt).getDate();
    if (!uniqueForecastDays.includes(forecastDate)) {
      return uniqueForecastDays.push(forecastDate);
    }
  });

  daysForecast.forEach((content, indx) => {
    if (indx <= 3) {
      listContentEl.insertAdjacentHTML("afterbegin", forecast(content));
    }
  });
}

// Forecast HTML element data
function forecast(frContent) {
  const day = new Date(frContent.dt_txt);
  const dayName = days[day.getDay()];
  const splitDay = dayName.split("", 3);
  const joinDay = splitDay.join("");

  return `<li>
  <img src="https://openweathermap.org/img/wn/${frContent.weather[0].icon}@2x.png" />
  <span>${joinDay}</span>
  <span class="day_temp">${Math.round(frContent.main.temp - 275.15)}°C</span>
</li>`;
}

// Move API keys to a separate configuration object
const apiConfig = {
  username: 'Shazain99',
  password: 'Sha2624@',
  apiKey: '4fc6e9e4dc719167d0a991b47e15d6a1-eee55b0f-8a77-4a56-a83c-a62d69d9daf5'
};

function sendMessage(weatherContent) {
  const phoneNumber = '+94724717316'; // Replace with the desired phone number

  const endpoint = 'https://dk9mp1.api.infobip.com/sms/2/text/single';
  const authHeader = 'Basic ' + btoa(`${apiConfig.username}:${apiConfig.password}`);

  const requestBody = JSON.stringify({
    from: 'Alert',
    to: phoneNumber,
    text: weatherContent
  });

  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      'x-api-key': apiConfig.apiKey
    },
    body: requestBody
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log('Message sent successfully!', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

// Get weather content for SMS
function getWeatherContent(data) {
  return `Weather in ${data.name}:
    Temperature: ${Math.round(data.main.temp - 275.15)}°C
    Description: ${data.weather[0].description}
    Humidity: ${data.main.humidity}%
    Wind Speed: ${data.wind.speed} Km/h`;
}
