//vars
var cityFormEl = document.querySelector('#city-form');
var cityInputEl = document.querySelector('#city');
var cityTitle = document.querySelector('.subtitle');
var cityTemp = document.querySelector('.temp');
var cityWind = document.querySelector('.wind');
var cityHum = document.querySelector('.humidity');
var cityUviTitle = document.querySelector('.uvi');
var cityUvi = document.querySelector("#uvi");
var forecastEl = document.querySelector(".forecast-container");
var cityBtns = document.querySelector("#city-buttons");
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

    pushToStore(city);

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
            displayForecast(data);
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
        var dayBox = document.createElement("div");
        var dayDate = document.createElement("h5");
        var dayTemp = document.createElement("div");
        var dayWind = document.createElement("div");
        var dayHum = document.createElement("div");

        var todayDT = moment(data.daily[i].dt, "X").format("MMM/DD/YYYY");

        $(dayDate).addClass("col");
        dayDate.textContent = todayDT;
        dayBox.append(dayDate);
        $(dayTemp).addClass("col");
        dayTemp.textContent = "Temp: " + data.daily[i].temp.max + "/" + data.daily[i].temp.min + "F";
        dayBox.append(dayTemp);
        $(dayWind).addClass("col");
        dayWind.textContent = "Wind: " + data.daily[i].wind_speed + "MPH";
        dayBox.append(dayWind);
        $(dayHum).addClass("col");
        dayHum.textContent = "Humidity: " + data.daily[i].humidity + "%";
        dayBox.append(dayHum);
        forecastEl.append(dayBox);
    }
}

//stores searches
function pushToStore(city) {
    var localCheck = JSON.parse(localStorage.getItem("search-history"));
    console.log("localcheck1: ", localCheck);
    var counter = 0;

    if (localCheck === null) {
        console.log("localcheck null");
        localCheck = [];
        localCheck.push(city);
        
    } else {
        console.log("localcheck !null");
        for (i = 0; i < localCheck.length; i++) {
            if (localCheck[i] === city) {
            counter++;
            console.log("counter: ", counter);
            }
        }
        console.log("counter final: ", counter);
        
        if(counter === 0 && localCheck.length > 0) {
        console.log("city not present");
        localCheck.push(city);
        }
    }
    
    localStorage.setItem("search-history", JSON.stringify(localCheck));
}

//store/display historical searches
function displayHistory() {
    var localCheck = JSON.parse(localStorage.getItem("search-history"));

    if (localCheck.length > 0) {
        for (i = 0; i < localCheck.length; i++) {
        var newBtn = document.createElement('btn');

        newBtn.textContent = localCheck[i];
        $(newBtn).addClass('btn');
        cityBtns.append(newBtn);
        }
    }
}

//initialize page (pulls historical searches)
function init() {

}

//event listeners
cityFormEl.addEventListener('submit', formSubmitHandler);