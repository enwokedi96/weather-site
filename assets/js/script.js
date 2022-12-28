$(document).ready(function() {
    var lon; var lat;
    var lonLatURL;
    var countryInput;
    var searchLimit = 1;
    var today = $('#today')
    var forecast = $('#forecast')
    var apiKey = ""; //"";

    $('#search-button').on('click',function(event){
        event.preventDefault();
        countryInput = $('#search-input').val();
        console.log(countryInput);
        lonLatURL = `http://api.openweathermap.org/geo/1.0/direct?q=${countryInput}&limit=${searchLimit}&appid=${apiKey}` 
        // load 
        $.ajax({
          url: lonLatURL,
          method: "GET"
        }).then(function(response) {
          lon = response[0].lon;
          lat = response[0].lat;
          console.log(response,lon,lat)//(JSON.stringify(response));
        })
    })

    
    //var queryURL = `api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

}
)