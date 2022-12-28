$(document).ready(function() {
    var searchLimit = 1;
    var apiKey = ""; //"";
    var lonLatURL = `http://api.openweathermap.org/geo/1.0/direct?q=London&limit=${searchLimit}&appid=${apiKey}`
    var queryURL = `api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    var countryInput = $('').text;

    $.ajax({
        url: lonLatURL,
        method: "GET"
      }).then(function(response) {
        console.log(response);
      })

}
)