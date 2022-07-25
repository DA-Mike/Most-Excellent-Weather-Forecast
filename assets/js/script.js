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
var pageCounter = 0;

//formSubmitHandler searches for the city designated by user
var formSubmitHandler = function (event) {
    event.preventDefault();
    cityGlob = cityInputEl.value;
    
    try {
        var cityName = cityInputEl.value.split(',')[0].trim();
        var stateName = cityInputEl.value.split(',')[1].trim();

        if (cityName) {
            getLatLong(cityName, stateName);

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
    try {
        var cityName = city.split(',')[0].trim();
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

//get latitude and longitude of city
var getLatLong = function (city, state) {
    var apiUrl = 'https://api.openweathermap.org/geo/1.0/direct?q=' + city + ',' + state + ',US&limit=1&appid=' + apiKey;
    pageCounter++;

    // formats cityGlob for the lazy user
    cityGlob = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase() + ", " + state.toUpperCase();

    fetch(apiUrl)
    .then(function (response) {
    if (response.ok) {
        response.json().then(function (data) {
            try {
                var lat = data[0].lat;
                var lon = data[0].lon;
            } catch(err) {
                return $(document).ready(function(){
                    $(".modal-body").children()[0].textContent = "Invalid city";
                    $("#myModal").modal('show');
                });
            }   
            getWeatherData(lat, lon);
            if (pageCounter > 1) {
                pushToStore(cityGlob);
            }
        });
    } else {
        alert('Error: ' + response.statusText);
    }
    })
    .catch(function (error) {
    alert('Unable to connect to OpenWeather');
    });
} 
    


//gets current weather and forecast
var getWeatherData = function(lat, lon) {
    var apiURL = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lon + '&units=imperial&exclude=minutely,hourly,warnings&appid=' + apiKey;

    try {
        fetch(apiURL)
        .then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
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
    } catch(err) {
        return $(document).ready(function(){
            $(".modal-body").textContent = "Invalid city";
            $("#myModal").modal('show');
        });
    }
};


//populates summary data for current day
function displaySummary(data) {
    var weatherIcon = document.createElement("img");
    $(weatherIcon).attr("src", "https://openweathermap.org/img/wn/" + data.current.weather[0].icon + ".png");

    sumDate.textContent = moment(data.current.dt, "X").format("MMM/DD/YYYY");
    cityTitle.textContent = cityGlob + " " + "(" + sumDate.textContent + ")";
    cityTitle.append(weatherIcon);
    cityTemp.textContent = "Temp: " + Math.floor(data.current.temp) + " °F";
    cityWind.textContent = "Wind Speed: " + Math.floor(data.current.wind_speed) + " MPH";
    cityHum.textContent = "Humidity: " + data.current.humidity + "%";
    cityUvi.textContent = data.current.uvi;
    cityUviTitle.textContent = "UV Index: ";
    cityUviTitle.append(cityUvi);

    // UV index styler
    if(data.current.uvi < 3) {
        $(cityUvi).css('background-color', 'green');
    } else if (data.current.uvi > 2 && data.current.uvi < 6) {
        $(cityUvi).css('background-color', 'yellow');
        $(cityUvi).css('color', 'black');
    } else if (data.current.uvi > 5 && data.current.uvi < 8) {
        $(cityUvi).css('background-color', 'orange');
    } else {
        $(cityUvi).css('background-color', 'red');
    }
}

//populates forecast data
function displayForecast(data) {    
    $(forecastEl).children().remove();

    for (i = 1; i < 6; i++) {
        var dayBox = document.createElement("div");
        var dayDate = document.createElement("h5");
        var dayTemp = document.createElement("div");
        var dayWind = document.createElement("div");
        var dayHum = document.createElement("div");
        var weatherIcon = document.createElement("img");
        $(weatherIcon).attr("src", "https://openweathermap.org/img/wn/" + data.daily[i].weather[0].icon + ".png");
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
    var localCheck = JSON.parse(localStorage.getItem("search-history"));
    var counter = 0;

    if (localCheck === null) {
        localCheck = [];
        localCheck.push(search);
        localStorage.setItem("search-history", JSON.stringify(localCheck));
    } else {
        for (i = 0; i < localCheck.length; i++) {
            if (localCheck[i] === search) {
            counter++;
            }
        }

        if (localCheck.length > 9) {
            localCheck.pop();
        }
        
        if(counter === 0 && localCheck.length > 0) {
        localCheck.unshift(search);
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

//initialize page (pulls historical searches and defaults to San Francisco)
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