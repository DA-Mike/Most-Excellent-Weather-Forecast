//vars
var sumDate = document.querySelector('#date');
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
    
    try {
        var cityName = cityInputEl.value.split(',')[0].trim();
        var stateName = cityInputEl.value.split(',')[1].trim();

        if (cityName) {
            console.log("getLatLong called by fSH");
            getLatLong(cityName, stateName);
            pushToStore(cityGlob);

            cityInputEl.value = '';
        } else {
            alert('Please enter a city name');
        }
    } catch(err) {
        return $(document).ready(function(){
                $("#myModal").modal('show');
        });
    }
};


//buttonClickHandler (for historical searches)
function buttonClickHandler(event) {
    var city = event.target.getAttribute('city-attribute');
    cityGlob = city;
    console.log("city: ", city);
    try {
        var cityName = city.split(',')[0].trim();
        console.log("cityName: ", cityName);
        var stateName = city.split(',')[1].trim();

        if (city) {
            getLatLong(cityName, stateName);
        }
    } catch(err) {
        return $(document).ready(function(){
            $("#myModal").modal('show');
        });
    }
}

//get lat long
var getLatLong = function (city, state) {
    var apiUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=' + city + ',' + state + ',US&limit=1&appid=' + apiKey;

    // pushToStore(city);

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

    var weatherIcon = document.createElement("img");
    $(weatherIcon).attr("src", "http://openweathermap.org/img/wn/" + data.current.weather[0].icon + ".png");

    sumDate.textContent = moment(data.current.dt, "X").format("MMM/DD/YYYY");
    cityTitle.textContent = cityGlob + " " + "(" + sumDate.textContent + ")"; //+ " " + data.current.weather[0].icon;
    cityTitle.append(weatherIcon);
    cityTemp.textContent = "Temp: " + Math.floor(data.current.temp) + " °F";
    cityWind.textContent = "Wind Speed: " + Math.floor(data.current.wind_speed) + " MPH";
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
    
    $(forecastEl).children().remove();

    for (i = 1; i < 6; i++) {
        var dayBox = document.createElement("div");
        var dayDate = document.createElement("h5");
        var dayTemp = document.createElement("div");
        var dayWind = document.createElement("div");
        var dayHum = document.createElement("div");
        var weatherIcon = document.createElement("img");
        $(weatherIcon).attr("src", "http://openweathermap.org/img/wn/" + data.daily[i].weather[0].icon + ".png");
        $(weatherIcon).css({
            width: "50px",
            height: "50px",
        });

        var todayDT = moment(data.daily[i].dt, "X").format("MMM/DD/YYYY");

        dayDate.textContent = todayDT;
        dayBox.append(dayDate);
        dayBox.append(weatherIcon);
        dayTemp.textContent = "Temp: " + Math.floor(data.daily[i].temp.max) + "/" + Math.floor(data.daily[i].temp.min) + " °F";
        dayBox.append(dayTemp);
        dayWind.textContent = "Wind: " + Math.floor(data.daily[i].wind_speed) + " MPH";
        dayBox.append(dayWind);
        dayHum.textContent = "Humidity: " + data.daily[i].humidity + "%";
        dayBox.append(dayHum);
        $(dayBox).addClass("col card card-forecast");
        forecastEl.append(dayBox);
    }
}

//stores searches
function pushToStore(search) {
    console.log(search);
    var localCheck = JSON.parse(localStorage.getItem("search-history"));
    console.log("localcheck1: ", localCheck);
    var counter = 0;

    if (localCheck === null) {
        console.log("localcheck null");
        localCheck = [];
        localCheck.push(search);
        localStorage.setItem("search-history", JSON.stringify(localCheck));
    } else {
        console.log("localcheck !null");
        for (i = 0; i < localCheck.length; i++) {
            if (localCheck[i] === search) {
            counter++;
            console.log("counter: ", counter);
            }
        }
        console.log("counter final: ", counter);

        if (localCheck.length > 10) {
            localCheck.pop();
        }
        
        if(counter === 0 && localCheck.length > 0) {
        console.log("city not present");
        localCheck.push(search);
        localStorage.setItem("search-history", JSON.stringify(localCheck));
        }
    }
    helper();
}

//helps avoid problems with calling displayHistory()
function helper() {
    var localCheck = JSON.parse(localStorage.getItem("search-history"));

    if (localCheck === null) {
    } else {
        displayHistory();
    }
}

//store/display historical searches
function displayHistory() {
    $(cityBtns).children().remove();
    var localCheck = JSON.parse(localStorage.getItem("search-history"));

    if (localCheck === null) {
    } else {
        for (i = 0; i < localCheck.length; i++) {
        var newBtn = document.createElement('btn');

        newBtn.textContent = localCheck[i];
        $(newBtn).addClass('btn btn-city');
        $(newBtn).attr('city-attribute', localCheck[i]);
        cityBtns.append(newBtn);
        }
    }
}

//initialize page (pulls historical searches)
function init() {
    displayHistory();
    getLatLong("San Francisco", "CA");
    cityGlob = "San Francisco, CA";
}

//event listeners
cityFormEl.addEventListener('submit', formSubmitHandler);
cityBtns.addEventListener('click', buttonClickHandler);

//initialize page
init();