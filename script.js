const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardDiv = document.querySelector(".weather-cards");

//API KEY openWeather
const API_KEY = "e1a1cbb0ecb191ebbca6ff016f43f907";

//update weather card
const createWeatherCard = (cityName, weatherItem, index) => {
    //updating main weather card
    if(index === 0){
        return `
            <div class="details">
                <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                <h4>Wind: ${weatherItem.wind.speed}M/S</h4>
                <h4>Humidity: 79%</h4>
            </div>
            <div class="icon">
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather">
                <h4>${weatherItem.weather[0].description}</h4>
            </div>
        `;
    }
    else{
        //updating 5 day forcast
     return `<li class="card">
                <h2>(${weatherItem.dt_txt.split(" ")[0]})</h2>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather">
                <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                <h4>Wind: ${weatherItem.wind.speed}M/S</h4>
                <h4>Humidity: 79%</h4>
             </li>`;
    }
}

//getting weather details from API
const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
    .then(res => res.json())
    .then(data => {
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)){
                return uniqueForecastDays.push(forecastDate);
            }
        });
        //clearing previous value 
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardDiv.innerHTML = ""; 


        console.log(fiveDaysForecast);
        fiveDaysForecast.forEach((weatherItem, index) => {
            if(index===0){ //current weather card
                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            }
            else{ //5 day weather card
                weatherCardDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            }
            
        });
    })
    .catch(() => {
        alert("An error occurred while fetching the weather forecast");
    });
}


//getting weather according to city coordinates
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if(!cityName){
        return;
    }
    const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    //fetching data from site
    fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
        if(!data.length){
            return alert("An error occurred while fetching the coordinates");
        }
        const {name, lat, lon} = data[0];
        getWeatherDetails(name, lat, lon);
    })
    .catch(() => {
        alert("An error occurred while fetching the coordinates");
    })
}

//getting user current coordinates
const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const {latitude, longitude} = position.coords; //getting coordinates 
            const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            fetch(REVERSE_GEOCODING_URL)
            .then(res => res.json())
            .then(data => {
                const {name} = data[0];
                getWeatherDetails(name, latitude, longitude);
                
            })
            .catch(() => {
                alert("An error occured while fetching the city");
            });
        },
        error => {
            if(error.code === error.PERMISSION_DENIED){
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            }
            else{
                alert("Geolocation request error. Please reset location permission.");
            }
        }
    );
}


locationButton.addEventListener('click', getUserCoordinates);
searchButton.addEventListener('click', getCityCoordinates);

cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());