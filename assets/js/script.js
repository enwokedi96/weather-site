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
            today.append(`<h2>${result.city.name} Today (${moment().format("MMM Do YY")})</h2>`);
            var tableWeather = $("<table></table>")
            var splitDatetime = result.list[0].dt_txt.split(/(\s+)/);
            console.log(splitDatetime)
            // search within 18 hours for the last-listed 
            // forecast of today
            var todayLastForecast = []
            for (let i=0; i<8; i++){
              (result.list[i].dt_txt.split(/(\s+)/)[0]==splitDatetime[0])?todayLastForecast.push(i):console.log('meowy')
            }  
            var weatherConditions = ['','Humidity','Temp','Wind']            
            for (let j=0; j<4; j++){
                var nrow = $('<tr>')
                if (j==0){
                  console.log(result.list[todayLastForecast[todayLastForecast.length-1]].dt_txt.split(/(\s+)/)[2])
                  nrow.append('<th>    </th>');
                  nrow.append(`<th>${result.list[todayLastForecast[0]].dt_txt.split(/(\s+)/)[2]}<th>`);
                  if (todayLastForecast.length>1){
                    nrow.append(`<th>${result.list[todayLastForecast[todayLastForecast.length-1]].dt_txt.split(/(\s+)/)[2]}<th>`);}
                }
                else {
                  nrow.append(`<td>${weatherConditions[j]}: </td>`);
                  nrow.append(`<td>${result.list[todayLastForecast[0]].main[weatherConditions[j].toLowerCase()]}<td>`);
                  if (todayLastForecast.length>1){
                    nrow.append(`<td>${result.list[todayLastForecast[todayLastForecast.length-1]].main[weatherConditions[j].toLowerCase()]}<td>`);
                  }
                }
                tableWeather.append(nrow);
            } 
            today.append(tableWeather);
          })
        })
        
    })

}
)