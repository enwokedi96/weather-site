$(document).ready(function() {
    var lon; 
    var lat;
    var lonLatURL;
    var queryURL
    var cityInput;
    var searchCity;
    var forecastRelevantIndices;
    var searchLimit = 1;
    var today = $('#today')
    var forecast = $('#forecast')
    var searchFormHistory = $('#history'); 
    var apiKey = ""; 
    var weatherConditions = ['','Humidity','Temp','Wind']
    const numDisplayRows = 4;
    const forecastColDesigns = {'background-color':'gray',
                                'color' : 'white',
                                'margin' : '5px',
                                'padding': '5px',
                                'border':'solid black 1px',
                                'border-radius':'10px',
                                'left':'2px',
                                'width':'auto','height':'auto','display':'table'};

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

    // object to store weather icon codes for today and 5-day forecasts
    var storeIconCodes = new Object();

    // vain designs
    //$('.weather-header').css({'background-image': 'linear-gradient(red, blue);'})
                           
    // read and save tablular data to array and consequently, localStorage
    function tableToArray(tableId,objId){
      var arr=[]
      // this examines table in todays section 8 times (i.e. full 24-hour day);
      // null or unavailable forecasts will come up as empty strings
      if(objId==0){  tableId.find('tr').each(function(index,item){
          var wTime1=$(item).find('th').eq(1).text();
          var wTime2=$(item).find('th').eq(2).text();
          var wTime3=$(item).find('th').eq(3).text();
          var wTime4=$(item).find('th').eq(4).text();
          var wTime5=$(item).find('th').eq(5).text();
          var wTime6=$(item).find('th').eq(6).text();
          var wTime7=$(item).find('th').eq(7).text();
          var wTime8=$(item).find('th').eq(8).text();

          var wValue1=$(item).find('td').eq(1).text();
          var wValue2=$(item).find('td').eq(2).text();
          var wValue3=$(item).find('td').eq(3).text();
          var wValue4=$(item).find('td').eq(4).text();
          var wValue5=$(item).find('td').eq(5).text();
          var wValue6=$(item).find('td').eq(6).text();
          var wValue7=$(item).find('td').eq(7).text();
          var wValue8=$(item).find('td').eq(8).text();
          arr.push([wTime1,wTime2,wTime3,wTime4,wTime5,wTime6,wTime7,wTime8,
                wValue1,wValue2,wValue3,wValue4,wValue5,wValue6,wValue7,wValue8]);})
      }
      // simpler version for 5-day forecast since only two entries are made
      else {tableId.find('tr').each(function(index,item){
        var wTime1=$(item).find('th').eq(1).text();
        var wTime2=$(item).find('th').eq(2).text();
        var wValue1=$(item).find('td').eq(1).text();
        var wValue2=$(item).find('td').eq(2).text();
        var wValue3=$(item).find('td').eq(3).text();
        arr.push([wTime1,wTime2,wValue1,wValue2,wValue3]);})
      }

      // filter out all empty placeholders (if any)
      for (let i=0;i<arr.length;i++){
        arr[i] = arr[i].filter((x) => x !== "");
      }
      return arr;
    }

    // add button to clear history and page if need be
    var clearDiv = $('<div id="clear"></div>');
    var clearButton = $(`<button type="button" class="btn btn-danger btn-block mt-3">Clear Page</button>`); 
    clearButton.css({'position': 'sticky',
                    'bottom': '4px',
                    'right': '6px',
                    'border-radius':'50%'})
    clearDiv.append(clearButton);
    searchFormHistory.append(clearDiv);

    $('#clear').on('click', function(){
        console.log('clear all buttons!!')
        document.querySelectorAll('.btn-info').forEach(e => e.remove());
        today.css({'border':'0px'})
      })

    // get location on click event 
    $('#search-button').on('click',function(event){
        // prevent default input clear
        event.preventDefault();
        
        // clear and add border design around todays forecast
        today.html("");

        cityInput = $('#search-input').val();
        //console.log(countryInput);
        lonLatURL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityInput}&limit=${searchLimit}&appid=${apiKey}` 
        
        $('#search-input').val("")
        // get locations latitude and longitude 
        $.ajax({
          url: lonLatURL,
          method: "GET"
        }).then(function(response) {
          lon = response[0].lon;
          lat = response[0].lat;
          queryURL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

          // load weather and forecasts using longitude and latitude
          $.ajax({
            url: queryURL,
            method: "GET"
          }).done(function(result) {
            //console.log(result); 
            searchCity = `${result.city.name}`;
            todayHeading = $('<div></div>'); //style={display:"inline-block"}
            todayHeading.append(`<h2>${searchCity} Today (${moment().format('LL')})</h2>`);
            // create empty placeholder for all current icons 
            // corresponding to the search country
            storeIconCodes[`${searchCity}`] = {}; 
            //console.log(result.list[0].weather[0].main.toLowerCase())

            today.append(todayHeading);
            today.css({'border':'solid 1px black', 'padding':'10px'})
            var tableWeather = $("<table id='todayTable'></table>");
            tableWeather.css({'table-layout': 'fixed','width':'75%'})
            var splitDatetime = result.list[0].dt_txt.split(/(\s+)/);
            
            // search within 18 hours for the last-listed 
            // forecast of current day
            var todayLastForecast = []
            for (let i=0; i<8; i++){ // 8 is used because the API stores in 3-hour intervals, which equals a max of 8 weather logs/day
              (result.list[i].dt_txt.split(/(\s+)/)[0]==splitDatetime[0])?todayLastForecast.push(i):console.log('no more data for today')
            }  
            
            // loop rows and display times, weather conditions and values
            var weatherUnits = ['','%','°C','kph'];
            var saveIconCodes = [];          
            for (let j=0; j<numDisplayRows; j++){
              var nrow = $('<tr>')
              if (j==0) {nrow.append('<th></th>'); }
              else {nrow.append(`<td>${weatherConditions[j]}: </td>`);}
              // loop all available forecasts for today
              for (let k=0; k<todayLastForecast.length; k++){
                // headers for time
                if (j==0){
                  var iconCode = `${result.list[todayLastForecast[k]].weather[0].icon}`;
                  saveIconCodes.push(`${iconCode}`);
                  var iconURL = `http://openweathermap.org/img/w/${iconCode}.png`;
                  var iconImg=`<img class='icons' src="${iconURL}" alt="Weather icon">`; 
                  var headPlusImg = $(`<th></th>`); 
                  headPlusImg.html(`${result.list[todayLastForecast[k]].dt_txt.split(/(\s+)/)[2].slice(0,5)}`);
                  headPlusImg.append(iconImg); 
                  nrow.append(headPlusImg);
                  }
                
                // load wind conditions
                else if (j==3){
                  nrow.append(`<td>${result.list[todayLastForecast[k]][weatherConditions[j].toLowerCase()].speed} ${weatherUnits[j]}</td>`);
                }
                // load other weather conditions
                else {
                  var weatherVal = result.list[todayLastForecast[k]].main[weatherConditions[j].toLowerCase()];
                  // convert kelvin to degree celcius
                  if (weatherConditions[j]=='Temp'){
                    weatherVal = Math.round(((parseFloat(weatherVal) - 273.15) + Number.EPSILON) * 100) / 100 //parseInt(weatherVal) - 273.15
                  }
                  nrow.append(`<td>${weatherVal} ${weatherUnits[j]}</td>`);
                }
              }
              tableWeather.append(nrow);
            } 
            today.append(tableWeather);
            // save icon codes to current country and current-day index
            storeIconCodes[`${searchCity}`][0] = saveIconCodes;
            
            // save to object, save to persistent storage
            arr = tableToArray(tableWeather,0)
            storeCurrentSearch[0] = arr 

//--------------------------------------------------------------------------------------------------//

            // clear 5-day forecast of previous display
            forecast.html("");

            // search API data for next 5 days and save relevant indices
            var forecastOne=[];
            var forecastTwo=[];
            var forecastThree=[];
            var forecastFour=[];
            var forecastFive=[];
      
            for (let k=0; k<result.list.length; k++){
              //console.log(result.list[k].dt_txt.split(/(\s+)/)[0].slice(8,10),moment().add(1, 'days').format('L').slice(3,5))
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
              var saveIconCodes = [];
              var forecastID = `forecast-${l+1}`;
              var tableWeather = $(`<table id='${forecastID}'></table>`);
              var forecastCol = $("<div class='col-lg-1 pb-3'></div>");
              var forecastDate = moment().add(l+1, 'days').format('L');
              // append forecast date on column
              forecastCol.css(forecastColDesigns);          
              forecastCol.append(`<h4>${forecastDate}</h4>`);

              // for forecasts, time should display 09:00 and 21:00 for days (today+1) till (today+4), and then
              // display first and last available forecasts for day (today+5)
              if (forecastRelevantIndices[l].length==8){var timeIndex = 3}
              // specifically check last day (today+5) if it has ample time forecasts present
              else if (forecastRelevantIndices[4].length>=5){var timeIndex = 3}
              else {var timeIndex = 0}

              for (let j=0; j<numDisplayRows; j++){
                var nrow = $('<tr>')
                // add space and weather names 
                if (j==0) {nrow.append('<th></th>'); }
                else {nrow.append(`<td>${weatherConditions[j]}: </td>`);}

                // headers: time and icons
                if (j==0){
                  var iconCode = `${result.list[forecastRelevantIndices[l][timeIndex]].weather[0].icon}`;
                  saveIconCodes.push(iconCode);
                  var iconURL = `http://openweathermap.org/img/w/${iconCode}.png`;
                  var iconImg=`<img class='icons' src="${iconURL}" alt="Weather icon">`; 
                  var headPlusImg = $(`<th></th>`); 
                  headPlusImg.html(`${result.list[forecastRelevantIndices[l][timeIndex]].dt_txt.split(/(\s+)/)[2].slice(0,5)}`);
                  headPlusImg.append(iconImg); 
                  nrow.append(headPlusImg);
                  if (forecastRelevantIndices[l].length>1){
                    var iconCode = `${result.list[forecastRelevantIndices[l][forecastRelevantIndices[l].length-1]].weather[0].icon}`;
                    saveIconCodes.push(iconCode);
                    var iconURL = `http://openweathermap.org/img/w/${iconCode}.png`;
                    var iconImg=`<img class='icons' src="${iconURL}" alt="Weather icon">`; 
                    var headPlusImg = $(`<th></th>`); 
                    headPlusImg.html(`${result.list[forecastRelevantIndices[l][forecastRelevantIndices[l].length-1]].dt_txt.split(/(\s+)/)[2].slice(0,5)}`);
                    headPlusImg.append(iconImg); 
                    nrow.append(headPlusImg);                    
                  }
                }
                // load wind conditions
                else if (j==3){
                  nrow.append(`<td>${result.list[forecastRelevantIndices[l][timeIndex]][weatherConditions[j].toLowerCase()].speed}${weatherUnits[j]}</td>`);
                  if (forecastRelevantIndices[l].length>1){
                    nrow.append(`<td>${result.list[forecastRelevantIndices[l][forecastRelevantIndices[l].length-1]][weatherConditions[j].toLowerCase()].speed}${weatherUnits[j]}</td>`);}
                }
                // load other weather conditions
                else {
                  var weatherVal = result.list[forecastRelevantIndices[l][timeIndex]].main[weatherConditions[j].toLowerCase()];
                  // convert kelvin to degree celcius
                  if (weatherConditions[j]=='Temp'){
                    weatherVal = Math.round(((parseFloat(weatherVal) - 273.15) + Number.EPSILON) * 100) / 100 ;
                  }
                  nrow.append(`<td>${weatherVal}${weatherUnits[j]}</td>`);
                  if (forecastRelevantIndices[l].length>1){
                    var weatherVal = result.list[forecastRelevantIndices[l][forecastRelevantIndices[l].length-1]].main[weatherConditions[j].toLowerCase()];
                    // convert kelvin to degree celcius
                    if (weatherConditions[j]=='Temp'){
                      weatherVal = Math.round(((parseFloat(weatherVal) - 273.15) + Number.EPSILON) * 100) / 100 ;
                    }
                    nrow.append(`<td>${weatherVal}${weatherUnits[j]}</td>`);
                  }
                }
              // append relevant headers and weather content into col
              tableWeather.append(nrow);
              forecastCol.append(tableWeather);
            }
            forecastRow.append(forecastCol)

            // save icon codes to current country and current-day index
            storeIconCodes[`${searchCity}`][l+1] = saveIconCodes;

            // store forecast data in collective object
            // save to storage
            arr = tableToArray(tableWeather,l+1)
            storeCurrentSearch[l+1] = arr 
            }
            forecastContainer.append(forecastRow)
            forecast.append(forecastContainer);

            console.log(storeCurrentSearch)
            console.log(storeIconCodes)

            // save icon object to storage
            localStorage.setItem(`icons`,JSON.stringify(storeIconCodes));
            // save all weather forecasts to memory
            localStorage.setItem(`${searchCity}`,JSON.stringify(storeCurrentSearch));

            // ensure there are no duplicate buttons and then prepend
            $(`#${searchCity}`).remove();
            searchFormHistory.prepend(`<button type="button" class="btn btn-info btn-block mt-2" id="${searchCity}">${searchCity}</button>`);
            
          })
        })
      //searchForm.append(searchFormHistory);
    })

//----------------------------------LOAD PREVIOUS SEARCH FROM STORAGE------------------------------------//

    // listen for user click of buttons in search history
    searchFormHistory.on("click", function(event){
      event.preventDefault();
      var cityClicked = event.target.id;
      var allWeather = JSON.parse(localStorage.getItem(cityClicked));
      var allIcons = JSON.parse(localStorage.getItem('icons'));
      allIcons = allIcons[cityClicked];
      //console.log(allWeather)
      // clear all previously displayed forecast
      today.html("");
      forecast.html("");

      var forecastContainer = $("<div class='container'></div>")
      var forecastRow = $("<div class='row'></div>")
      forecastContainer.append("<h2>5-Day Forecast: </h2>")

      // load all weather from persistent storage
      // i: loop all arrays in storage, each corresponding to a day
      for (let i=0; i<Object.keys(allWeather).length; i++){
        // load todays section
        if (i==0){
          var tableWeather = $("<table></table>");
          tableWeather.css({'table-layout': 'fixed','width':'75%'})
          todayHeading = $('<div></div>'); 
          todayHeading.append(`<h2>${cityClicked} Today (${moment().format('LL')})</h2>`);
          today.append(todayHeading);
          // j: loop all rows dislayed in section/card
          for (let j=0; j<numDisplayRows; j++){
            var nrow = $('<tr>')
            if (j==0) {nrow.append('<th></th>'); }
            else {nrow.append(`<td>${weatherConditions[j]}: </td>`);}
            // k:  loop all items in specific days' array
            for (let k=0; k<allWeather[i][j].length; k++){
              // headers for time and icon
              if (j==0){
                var iconCode = allIcons[i][k]; 
                var iconURL = `http://openweathermap.org/img/w/${iconCode}.png`;
                var iconImg=`<img class='icons' src="${iconURL}" alt="Weather icon">`; 
                var headPlusImg = $(`<th></th>`); 
                headPlusImg.html(`${allWeather[i][j][k]}`);
                headPlusImg.append(iconImg); 
                nrow.append(headPlusImg);
                }

              // load other weather conditions
              else {
                var weatherVal = allWeather[i][j][k]
                nrow.append(`<td>${weatherVal}</td>`);
              }
            }
            tableWeather.append(nrow)
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
          forecastCol.css(forecastColDesigns)
              
          forecastCol.append(`<h4>${forecastDate}</h4>`);
          for (let j=0; j<numDisplayRows; j++){
            var nrow = $('<tr>')
            // headers for time
            if (j==0){
              nrow.append('<th></th>');
              var iconCode = allIcons[i][0]; 
              var iconURL = `http://openweathermap.org/img/w/${iconCode}.png`;
              var iconImg=`<img class='icons' src="${iconURL}" alt="Weather icon">`; 
              var headPlusImg = $(`<th></th>`); 
              headPlusImg.html(`${allWeather[i][j][0]}`);
              headPlusImg.append(iconImg); 
              nrow.append(headPlusImg);

              if (allWeather[i][j].length>1){
                var iconCode = allIcons[i][1]; 
                var iconURL = `http://openweathermap.org/img/w/${iconCode}.png`;
                var iconImg=`<img class='icons' src="${iconURL}" alt="Weather icon">`; 
                var headPlusImg = $(`<th></th>`); 
                headPlusImg.html(`${allWeather[i][j][1]}`);
                headPlusImg.append(iconImg); 
                nrow.append(headPlusImg);
              }
            }
            // load weather conditions, values
            else {
              var weatherVal = allWeather[i][j][0]
              nrow.append(`<td>${weatherConditions[j]}: </td>`);
              nrow.append(`<td>${weatherVal}</td>`);
              if (allWeather[i][j].length>1){
                var weatherVal = allWeather[i][j][1]
                nrow.append(`<td>${weatherVal}</td>`);
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