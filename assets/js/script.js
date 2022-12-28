$(document).ready(function() {
    var lonLatURL;
    var countryInput;
    var searchLimit = 1;
    var apiKey = ""; //"";

    $('#search-button').on('click',function(event){
        event.preventDefault();
        countryInput = $('#search-input').val();
        console.log(countryInput)
        lonLatURL = 'http://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid=ebc857fdadc713393f458859461c4d71' //`http://api.openweathermap.org/geo/1.0/direct?q=${countryInput}&limit=${searchLimit}&appid=${apiKey}`;
        $.ajax({
          url: lonLatURL,
          method: "GET"
        }).then(function(response) {
          console.log(JSON.stringify(response));
        })
    })

    //var queryURL = `api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

}
)