$(document).ready(function() {
    var lon; 
    var lat;
    var lonLatURL;
    var queryURL
    var countryInput;
    var searchLimit = 1;
    var today = $('#today')
    var forecast = $('#forecast')
    var apiKey = ""; 
    
    // get location on click event 
    $('#search-button').on('click',function(event){
        event.preventDefault();
        countryInput = $('#search-input').val();
        console.log(countryInput);
        lonLatURL = `http://api.openweathermap.org/geo/1.0/direct?q=${countryInput}&limit=${searchLimit}&appid=${apiKey}` 
        
        // get locations latitude and longitude 
        $.ajax({
          url: lonLatURL,
          method: "GET"
        }).then(function(response) {
          lon = response[0].lon;
          lat = response[0].lat;
          //console.log(lon,lat) //(JSON.stringify(response));
          queryURL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

          // load weather and forecasts using longitude and latitude
          $.ajax({
            url: queryURL,
            method: "GET"
          }).done(function(result) {
            console.log(result); //(JSON.stringify(response));
            today.append(`<h2>Today (${moment().format("MMM Do YY")})</h2>`);

          })
        })
        
    })

}
)