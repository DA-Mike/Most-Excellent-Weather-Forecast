//vars
var cityFormEl = document.querySelector('#city-form');
var cityInputEl = document.querySelector('#city');
var cityTitle = document.querySelector('.subtitle');
var cityTemp = document.querySelector('.temp');
var cityWind = document.querySelector('.wind');
var cityHum = document.querySelector('.humidity');
var cityUviTitle = document.querySelector('.uvi');
var cityUvi = document.querySelector("#uvi");
var apiKey = 'b011db637bad336f73754395f19fc139';
var cityGlob = '';
var cityObj = {name: '', lat: '', lon: ''};
var priorSearches = [];

//formSubmitHandler
var formSubmitHandler = function (event) {
    event.preventDefault();
    cityGlob = cityInputEl.value;
    var cityName = cityInputEl.value.split(',')[0].trim();
    var stateName = cityInputEl.value.split(',')[1].trim();

    if (cityName) {
        console.log("getLatLong called by fSH");
        getLatLong(cityName, stateName);

        // cityTitle.textContent = '';
        cityInputEl.value = '';
    } else {
        alert('Please enter a city name');
    }
};


//buttonClickHandler (for historical searches)

//get lat long
var getLatLong = function (city, state) {
    var apiUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=' + city + ',' + state + ',US&limit=1&appid=' + apiKey;

    fetch(apiUrl)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
            console.log("getWeatherData called by getLatLong");
            var lat = data[0].lat;
            var lon = data[0].lon;            
            
            getWeatherData(lat, lon);
        });
      } else {
        alert('Error: ' + response.statusText);
      }
    })
    .catch(function (error) {
      alert('Unable to connect to OpenWeather');
    });
}

//getWeatherData
var getWeatherData = function(lat, lon) {
    var apiURL = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lon + '&units=imperial&exclude=minutely,hourly,warnings&appid=' + apiKey;

    fetch(apiURL)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
            console.log("display functions called by getWeatherData");
            displaySummary(data);
            // displayForecast(data);
        });
      } else {
        alert('Error: ' + response.statusText);
      }
    })
    .catch(function (error) {
      alert('Unable to connect to OpenWeather');
    });
};


//populate summary data
function displaySummary(data) {
    console.log('displaySummary: ' , cityGlob, 
    "temp: ", data.current.temp,
    " wind: ", data.current.wind_speed,
    " humidity: ", data.current.humidity,
    " UV Index: ", data.current.uvi);

    cityTitle.textContent = cityGlob;
    cityTemp.textContent = "Temp: " + data.current.temp + "F";
    cityWind.textContent = "Wind Speed: " + data.current.wind_speed + "MPH";
    cityHum.textContent = "Humidity: " + data.current.humidity + "%";
    cityUvi.textContent = data.current.uvi;
    cityUviTitle.textContent = "UV Index: ";
    cityUviTitle.append(cityUvi);

    if(data.current.uvi < 3) {
        $(cityUvi).css('background-color', 'green');
    } else if (data.current.uvi > 2 && data.current.uvi < 6) {
        $(cityUvi).css('background-color', 'yellow');
    } else if (data.current.uvi > 5 && data.current.uvi < 8) {
        $(cityUvi).css('background-color', 'orange');
    } else {
        $(cityUvi).css('background-color', 'red');
    }
}

//populate forecast data
function displayForecast(data) {
    console.log("displayForecast: " , cityGlob, data);
    for (i = 0; i < 6; i++) {

    }
}

//store/display historical searches
function displayHistory() {

}

//initialize page (pulls historical searches)
function init() {

}

//event listeners
cityFormEl.addEventListener('submit', formSubmitHandler);