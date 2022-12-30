$(document).ready(function() {
    var lon; 
    var lat;
    var lonLatURL;
    var queryURL
    var countryInput;
    var forecastRelevantIndices;
    var searchLimit = 1;
    var today = $('#today')
    var forecast = $('#forecast')
    var searchForm = $('#search-form')
    var searchFormHistory = $('<div></div>')
    var apiKey = ""; 
    var weatherConditions = ['','Humidity','Temp','Wind']
    // object to store weather for both today and 5-day forecast 
    // index 0 corresponds to today and subsequent indices to forecasted days
    // remove records of old object
    if (typeof storeCurrentSearch !== "undefined") {
      Object.keys(storeCurrentSearch).forEach(item => delete storeCurrentSearch[item])
    }

    var storeCurrentSearch = new Object(); //
    storeCurrentSearch[0] = [];
    storeCurrentSearch[1] = [];
    storeCurrentSearch[2] = [];
    storeCurrentSearch[3] = [];
    storeCurrentSearch[4] = [];
    storeCurrentSearch[5] = [];
                           
    // read and save tablular data to array and consequently, localStorage
    function tableToArray(tableId,objId){
      var arr=[]
      tableId.find('tr').each(function(index,item){
        var wTime1=$(item).find('th').eq(1).text();
        var wTime2=$(item).find('th').eq(3).text();
        var wValue1=$(item).find('td').eq(1).text();
        var wValue2=$(item).find('td').eq(2).text();
        var wValue3=$(item).find('td').eq(3).text();
        arr.push([wTime1,wTime2,wValue1,wValue2,wValue3]);
      });

      // filter out all empty placeholders
      for (let i=0;i<arr.length;i++){
        arr[i] = arr[i].filter((x) => x !== "");
      }
      //storeCurrentSearch[objId].push(arr)
      //console.log(arr)
      return arr;
    }

    // get location on click event 
    $('#search-button').on('click',function(event){
        // prevent default input clear
        event.preventDefault();
        
        // clear and add border design around todays forecast
        today.html("");
        today.css({'border':'solid 1px black', 'padding':'10px'})

        countryInput = $('#search-input').val();
        //console.log(countryInput);
        lonLatURL = `http://api.openweathermap.org/geo/1.0/direct?q=${countryInput}&limit=${searchLimit}&appid=${apiKey}` 
        
        $('#search-input').val("")
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
          }).then(function(result) {
            console.log(result);
            todayHeading = $('<div></div>'); //style={display:"inline-block"}
            todayHeading.append(`<h2>${result.city.name} Today (${moment().format('LL')})</h2>`);
            
            // attach icon for current weather (not working yet)
            console.log(result.list[0].weather[0].main.toLowerCase())
            //todayHeading.append(`<i class="fa-solid fa-cloud"></i>`)

            today.append(todayHeading);
            var tableWeather = $("<table id='todayTable'></table>")
            var splitDatetime = result.list[0].dt_txt.split(/(\s+)/);
            
            // search within 18 hours for the last-listed 
            // forecast of current day
            var todayLastForecast = []
            for (let i=0; i<8; i++){ // 8 is used because the API stores in 3-hour intervals, which equals a max of 8 weather logs/day
              (result.list[i].dt_txt.split(/(\s+)/)[0]==splitDatetime[0])?todayLastForecast.push(i):console.log('meowy')
            }  
            // loop rows and display times, weather conditions and values
            var weatherUnits = ['','%','°C','kph']            
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
                  var weatherVal = result.list[todayLastForecast[0]].main[weatherConditions[j].toLowerCase()];
                  // convert kelvin to degree celcius
                  if (weatherConditions[j]=='Temp'){
                    weatherVal = Math.round(((parseFloat(weatherVal) - 273.15) + Number.EPSILON) * 100) / 100 //parseInt(weatherVal) - 273.15
                  }
                  nrow.append(`<td>${weatherConditions[j]}: </td>`);
                  nrow.append(`<td>${weatherVal} ${weatherUnits[j]}<td>`);
                  if (todayLastForecast.length>1){
                    var weatherVal = result.list[todayLastForecast[todayLastForecast.length-1]].main[weatherConditions[j].toLowerCase()];
                    // convert kelvin to degree celcius
                    if (weatherConditions[j]=='Temp'){
                      weatherVal = Math.round(((parseFloat(weatherVal) - 273.15) + Number.EPSILON) * 100) / 100 //parseInt(weatherVal) - 273.15
                    }
                    nrow.append(`<td>${weatherVal} ${weatherUnits[j]}<td>`);
                  }
                }
                tableWeather.append(nrow);
            } 
            today.append(tableWeather);
            
            // save to object
            arr = tableToArray(tableWeather,0)
            storeCurrentSearch[0] = arr //.push(arr)

//--------------------------------------------------------------------------------------------------//

            // clear and add border design around todays forecast
            forecast.html("");

            // search API data for next 5 days and save relevant indices
            var forecastOne=[];
            var forecastTwo=[];
            var forecastThree=[];
            var forecastFour=[];
            var forecastFive=[];
      
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

            // save all arrays of forecasts in single array
            forecastRelevantIndices=[forecastOne,forecastTwo,forecastThree,forecastFour,forecastFive]

            // load forecasts for each successive day (5 days)
            var forecastContainer = $("<div class='container'></div>")
            var forecastRow = $("<div class='row'></div>")
            forecastContainer.append("<h2>5-Day Forecast: </h2>")
            for (let l=0; l<forecastRelevantIndices.length; l++){
              var forecastID = `forecast-${l+1}`
              var tableWeather = $(`<table id='${forecastID}'></table>`)
              var forecastCol = $("<div class='col-lg-1 pb-3'></div>");
              var forecastDate = moment().add(l+1, 'days').format('L');
              // append forecast date on column
              forecastCol.css({'background-color':'gray',
                            'color' : 'white',
                            'margin' : '2px',
                            'padding': '5px',
                            'border':'solid black 1px',
                            'border-radius':'10px',
                            'left':'2px',
                            'width':'auto','height':'auto','display':'table'})
              
              forecastCol.append(`<h3>${forecastDate}</h3>`);
              for (let j=0; j<4; j++){
                var nrow = $('<tr>')
                // headers for time
                if (j==0){
                  nrow.append('<th>    </th>');
                  nrow.append(`<th>${result.list[forecastRelevantIndices[l][0]].dt_txt.split(/(\s+)/)[2].slice(0,5)}<th>`);
                  if (forecastRelevantIndices[l].length>1){
                  nrow.append(`<th>${result.list[forecastRelevantIndices[l][forecastRelevantIndices[l].length-1]].dt_txt.split(/(\s+)/)[2].slice(0,5)}<th>`);
                  }
                }
                // load wind conditions
                else if (j==3){
                  nrow.append(`<td>${weatherConditions[j]}: </td>`);
                  nrow.append(`<td>${result.list[forecastRelevantIndices[l][0]][weatherConditions[j].toLowerCase()].speed}${weatherUnits[j]}<th>`);
                  if (forecastRelevantIndices[l].length>1){
                    nrow.append(`<td>${result.list[forecastRelevantIndices[l][forecastRelevantIndices[l].length-1]][weatherConditions[j].toLowerCase()].speed}${weatherUnits[j]}<th>`);}
                }
                // load other weather conditions
                else {
                  var weatherVal = result.list[forecastRelevantIndices[l][0]].main[weatherConditions[j].toLowerCase()];
                  // convert kelvin to degree celcius
                  if (weatherConditions[j]=='Temp'){
                    weatherVal = Math.round(((parseFloat(weatherVal) - 273.15) + Number.EPSILON) * 100) / 100 ;
                  }
                  nrow.append(`<td>${weatherConditions[j]}: </td>`);
                  nrow.append(`<td>${weatherVal}${weatherUnits[j]}<td>`);
                  if (forecastRelevantIndices[l].length>1){
                    var weatherVal = result.list[forecastRelevantIndices[l][forecastRelevantIndices[l].length-1]].main[weatherConditions[j].toLowerCase()];
                    // convert kelvin to degree celcius
                    if (weatherConditions[j]=='Temp'){
                      weatherVal = Math.round(((parseFloat(weatherVal) - 273.15) + Number.EPSILON) * 100) / 100 ;
                    }
                    nrow.append(`<td>${weatherVal}${weatherUnits[j]}<td>`);
                  }
                }
              // append relevant headers and weather content into col
              tableWeather.append(nrow);
              
              //storeCurrentSearch[l+1].push(arr_)
              //console.log(result.city.name,arr)
              forecastCol.append(tableWeather);
            }
            forecastRow.append(forecastCol)

            // store forecast data in collective object
            //tableToArray(tableWeather, l+1)
            // save to object
            arr = tableToArray(tableWeather,l+1)
            storeCurrentSearch[l+1] = arr //.push(arr)
            }
            forecastContainer.append(forecastRow)
            forecast.append(forecastContainer);
            console.log(storeCurrentSearch)

            // save all weather forecasts to memory
            localStorage.setItem(`${result.city.name}`,JSON.stringify(storeCurrentSearch));
            // ensure there are no duplicate buttons and then prepend
            $(`#${result.city.name}`).remove();
            searchFormHistory.prepend(`<button type="button" class="btn btn-info btn-block" id="${result.city.name}">${result.city.name}</button>`);
          })
        })
      searchForm.append(searchFormHistory);
    })

    searchFormHistory.on("click", function(event){
      event.preventDefault();
      var countryClicked = event.target.id;
      var allWeather = JSON.parse(localStorage.getItem(countryClicked));
      //console.log(allWeather)
      // clear all previously displayed forecast
      today.html("");
      forecast.html("");

      var forecastContainer = $("<div class='container'></div>")
      var forecastRow = $("<div class='row'></div>")
      forecastContainer.append("<h2>5-Day Forecast: </h2>")

      // load all weather from persistent storage
      for (let i=0; i<Object.keys(allWeather).length; i++){
        if (i==0){
          var tableWeather = $("<table></table>");
          todayHeading = $('<div></div>'); //style={display:"inline-block"}
          todayHeading.append(`<h2>${countryClicked} Today (${moment().format('LL')})</h2>`);
          today.append(todayHeading);
          for (let j=0; j<4; j++){
            var nrow = $('<tr>')
            // headers for time
            if (j==0){
              nrow.append('<th>    </th>');
              nrow.append(`<th>${allWeather[i][j][0]}<th>`);
              if (allWeather[i][j].length>1){
                nrow.append(`<th>${allWeather[i][j][1]}<th>`);}
            }
            // load other todays-weather conditions from storage
            else {
              var weatherVal = allWeather[i][j][0]
              nrow.append(`<td>${weatherConditions[j]}: </td>`);
              nrow.append(`<td>${weatherVal}<td>`);
              if (allWeather[i][j].length>1){
                var weatherVal = allWeather[i][j][1]
                nrow.append(`<td>${weatherVal}<td>`);
              }
            }
            tableWeather.append(nrow);
        } 
        today.append(tableWeather);
        }

        // now works!!! 5-day forecast loading from persistent storage
        else {
          var forecastID = `forecast-${i}`
          var tableWeather = $(`<table id='${forecastID}'></table>`)
          var forecastCol = $("<div class='col-lg-1 pb-3'></div>");
          var forecastDate = moment().add(i, 'days').format('L');
          // append forecast date on column
          forecastCol.css({'background-color':'gray',
                            'color' : 'white',
                            'margin' : '2px',
                            'padding': '5px',
                            'border':'solid black 1px',
                            'border-radius':'10px',
                            'left':'2px',
                            'width':'auto','height':'auto','display':'table'})
              
          forecastCol.append(`<h3>${forecastDate}</h3>`);
          for (let j=0; j<4; j++){
            var nrow = $('<tr>')
            // headers for time
            if (j==0){
              nrow.append('<th>    </th>');
              nrow.append(`<th>${allWeather[i][j][0]}<th>`);
              if (allWeather[i][j].length>1){
                nrow.append(`<th>${allWeather[i][j][1]}<th>`);}
            }
            // load other weather conditions
            else {
              var weatherVal = allWeather[i][j][0]
              nrow.append(`<td>${weatherConditions[j]}: </td>`);
              nrow.append(`<td>${weatherVal}<td>`);
              if (allWeather[i][j].length>1){
                var weatherVal = allWeather[i][j][1]
                nrow.append(`<td>${weatherVal}<td>`);
              }
            }
            tableWeather.append(nrow);
        } 
        forecastCol.append(tableWeather);
        forecastRow.append(forecastCol)
        }
      }
      forecastContainer.append(forecastRow)
      forecast.append(forecastContainer);
  })
  
}
)