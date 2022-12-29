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
        // prevent default input clear
        event.preventDefault();
        
        // clear and add border design around todays forecast
        today.html("");
        today.css({'border':'solid 1px black', 'padding':'10px'})

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
            console.log(result);
            todayHeading = $('<div></div>'); //style={display:"inline-block"}
            todayHeading.append(`<h2>${result.city.name} Today (${moment().format('LL')})</h2>`);
            
            // attach icon for current weather (not working yet)
            console.log(result.list[0].weather[0].main.toLowerCase())
            //todayHeading.append(`<i class="fa-solid fa-cloud"></i>`)

            today.append(todayHeading);
            var tableWeather = $("<table></table>")
            var splitDatetime = result.list[0].dt_txt.split(/(\s+)/);
            
            // search within 18 hours for the last-listed 
            // forecast of current day
            var todayLastForecast = []
            for (let i=0; i<8; i++){
              (result.list[i].dt_txt.split(/(\s+)/)[0]==splitDatetime[0])?todayLastForecast.push(i):console.log('meowy')
            }  
            // loop rows and display times, weather conditions and values
            var weatherConditions = ['','Humidity','Temp','Wind']
            var weatherUnits = ['','%','°C','KPH']            
            for (let j=0; j<4; j++){
                var nrow = $('<tr>')
                // headers for time
                if (j==0){
                  nrow.append('<th>    </th>');
                  nrow.append(`<th>${result.list[todayLastForecast[0]].dt_txt.split(/(\s+)/)[2].slice(0,5)}<th>`);
                  if (todayLastForecast.length>1){
                    nrow.append(`<th>${result.list[todayLastForecast[todayLastForecast.length-1]].dt_txt.split(/(\s+)/)[2].slice(0,5)}<th>`);}
                }
                // load wind conditions
                else if (j==3){
                  nrow.append(`<td>${weatherConditions[j]}: </td>`);
                  nrow.append(`<td>${result.list[todayLastForecast[0]][weatherConditions[j].toLowerCase()].speed} ${weatherUnits[j]}<th>`);
                  if (todayLastForecast.length>1){
                    nrow.append(`<td>${result.list[todayLastForecast[todayLastForecast.length-1]][weatherConditions[j].toLowerCase()].speed} ${weatherUnits[j]}<th>`);}
                }
                // load other weather conditions
                else {
                  nrow.append(`<td>${weatherConditions[j]}: </td>`);
                  nrow.append(`<td>${result.list[todayLastForecast[0]].main[weatherConditions[j].toLowerCase()]} ${weatherUnits[j]}<td>`);
                  if (todayLastForecast.length>1){
                    nrow.append(`<td>${result.list[todayLastForecast[todayLastForecast.length-1]].main[weatherConditions[j].toLowerCase()]} ${weatherUnits[j]}<td>`);
                  }
                }
                tableWeather.append(nrow);
            } 
            today.append(tableWeather);
            // search API data for next 5 days and save relevant indices
            var forecastOne=[];
            var forecastTwo=[];
            var forecastThree=[];
            var forecastFour=[];
            var forecastFive=[];
            //console.log(parseInt(moment().add(3, 'days').format('L').slice(3,5)))
            //console.log(result.list[k].dt_txt.split(/(\s+)/)[0].slice(8,10),moment().format('L').slice(3,5))
      
            for (let k=0; k<result.list.length; k++){
              console.log(result.list[k].dt_txt.split(/(\s+)/)[0].slice(8,10),moment().add(1, 'days').format('L').slice(3,5))
              if (result.list[k].dt_txt.split(/(\s+)/)[0].slice(8,10)==moment().add(1, 'days').format('L').slice(3,5)){
                forecastOne.push(k);}
              else if (result.list[k].dt_txt.split(/(\s+)/)[0].slice(8,10)==moment().add(2, 'days').format('L').slice(3,5)){
                forecastTwo.push(k);}
              else if (result.list[k].dt_txt.split(/(\s+)/)[0].slice(8,10)==moment().add(3, 'days').format('L').slice(3,5)){
                forecastThree.push(k);}
              else if (result.list[k].dt_txt.split(/(\s+)/)[0].slice(8,10)==moment().add(4, 'days').format('L').slice(3,5)){
                forecastFour.push(k);}
              else if (result.list[k].dt_txt.split(/(\s+)/)[0].slice(8,10)==moment().add(5, 'days').format('L').slice(3,5)){
                forecastFive.push(k);}
              else {continue;}
            }
            console.log(forecastOne,forecastThree,forecastFive)
          })
        })
      // load forecasts for each successive day (5 days)
      var forecastContainer = $("<div class='container'></div>")
      var forecastRow = $("<div class='row'></div>")
      var blankCol = $("<div class='col-lg-1'></div>")
      for (let l=0; l<5; l++){
        var forecastCol = $("<div class='col-lg-1 pb-3'></div>")
        forecastCol.append()
      }
    })

}
)