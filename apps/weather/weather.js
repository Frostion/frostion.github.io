//==============================================================================================================================
// first, check if a location is supplied or not
//==============================================================================================================================


const url_params = new URLSearchParams(window.location.search);
var location_param = url_params.get("location");
if(location_param != null) { apiGetLocationProperties(location_param); }


function showStatus(txt, loading)
{
	document.getElementById("status").innerText = txt;
	setLoading(loading);
}
function setLoading(loading) { document.getElementById("loadingicon").hidden = !loading; }

//==============================================================================================================================
// get location
//==============================================================================================================================


function getGeolocation()
{
	showStatus("Finding location...", true);
	navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError, { enableHighAccuracy: true });
	
	function geolocationSuccess(position)
	{
		coordsString(position.coords.latitude, position.coords.longitude);
	}

	function geolocationError(position)
	{
		showStatus("Cannot find location");
	}
}


//use openstreetmap nominatim API to search for a location
function searchLocation()
{
	showStatus("Searching location...", true);
	const search_text = document.getElementById("locationinput").value;
	apiGet("https://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(search_text) + "&format=json&addressdetails=0&limit=1&countrycodes=us", success, failure);
	
	function success(json)
	{
		if(json.length == 1) { coordsString(parseFloat(json[0].lat), parseFloat(json[0].lon)); }
		else { showStatus("No results found"); }
	}
	
	function failure(code)
	{
		showStatus("Search error (HTTP " + code + ")");
	}
}


//NWS API requires specific coordinate formatting
function coordsString(latitude, longitude)
{
	window.location.href = "?location=" + latitude.toFixed(4) + "," + longitude.toFixed(4);
}


//=======================================================================================================================================================================
// get data from NWS API about user's location and forecast
//=======================================================================================================================================================================


function map(x, in_min, in_max, out_min, out_max) { return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min; }
function CtoF(c) { return c * 1.8 + 32; }


function apiGet(url, success, failure)
{
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if(this.readyState == 4)
		{
			if(this.status == 200) { success(JSON.parse(this.responseText)); }
			else if(failure != undefined) { failure(this.status); }
		}
	}
	xhr.open("GET", url, true);
	xhr.send();
}


function apiGetLocationProperties(coords_string)
{
	showStatus("NWS location lookup...", true);
	apiGet("https://api.weather.gov/points/" + coords_string, success, failure);
	
	function success(json)
	{
		showStatus(json.properties.relativeLocation.properties.city + ", "  + json.properties.relativeLocation.properties.state, true);
		apiGetForecast(json.properties.forecast, json.properties.forecastHourly);
		apiGetAlerts(coords_string);
	}
	
	function failure(code)
	{
		showStatus("NWS location error (HTTP " + code + ")");
	}
}


var forecastdays = new Array();

function apiGetForecast(dailyurl, hourlyurl)
{
	apiGet(dailyurl, successDaily, failure);
	
	function successDaily(json)
	{
		const data = json.properties.periods;
		var day = null;
		for(var i = 0; i < data.length; i++)
		{
			if(data[i].isDaytime || day == null)
			{
				day = new Object();
				day["date"] = new Date(data[i].startTime);
				day["daily"] = new Array();
				day["hourly"] = new Array();
			}
			day.daily.push(data[i]);
			if(!data[i].isDaytime)
			{
				forecastdays.push(day);
			}
		}
		apiGet(hourlyurl, successHourly, failure);
	}
	
	function successHourly(json)
	{
		const data = json.properties.periods;
		for(var i = 0; i < data.length; i++)
		{
			const date = new Date(data[i].startTime);
			for(var day = 0; day < forecastdays.length; day++)
			{
				if(forecastdays[day].date.getDate() == date.getDate())
				{
					forecastdays[day].hourly.push(data[i]);
					break;
				}
			}
		}
		setLoading(false);
		displayForecast();
		randomBackgroundImage();
	}
	
	function failure(code)
	{
		showStatus("NWS forecast error (HTTP " + code + ")");
	}
}


function apiGetAlerts(coords_string)
{
	apiGet("https://api.weather.gov/alerts/active?point=" + coords_string, success);
	
	function success(json)
	{
		const data = json.features;
		if(data.length == 0) { return; }
		
		var html = "";
		for(var i = 0; i < data.length; i++)
		{
			var formatted = data[i].properties.description.replace(/\n\s*\n/g, "<br>");
			html += "<details><summary><img src=\"icons/alert.png\"> " + data[i].properties.event + "</summary>" + formatted + "</details>";
		}
		document.getElementById("alerts").innerHTML = "<div>" + html + "</div>";
		document.getElementById("alerts").className = "";
	}
}


//=======================================================================================================================================================================
// create forecast display graphics
//=======================================================================================================================================================================


function displayForecast()
{
	for(var daynum = 0; daynum < forecastdays.length; daynum++)
	{
		var day = forecastdays[daynum];
		document.getElementById("forecast").innerHTML += `<h2>${day.daily[0].name}</h2>`;
		document.getElementById("forecast").appendChild(generateDailyForecastDiv(day.daily));
		document.getElementById("forecast").appendChild(generateHourlyForecastDiv(daynum, "temperature", "icons/temperature.png"));
		document.getElementById("forecast").appendChild(generateHourlyForecastDiv(daynum, "relativeHumidity", "icons/humidity.png", 0, 100));
		document.getElementById("forecast").appendChild(generateHourlyForecastDiv(daynum, "probabilityOfPrecipitation", "icons/precip.png", 0, 100));
		document.getElementById("forecast").appendChild(generateHourlyForecastDiv(daynum, "windSpeed", "icons/wind.png", 0));
	}
	document.getElementById("forecast").className = "";
	
	
	function generateDailyForecastDiv(data)
	{
		var div = document.createElement("div");
		div.className = "dailyforecast";
		
		for(var i = 0; i < data.length; i++)
		{
			div.innerHTML += `
				<img src="${data[i].icon}">
				<p>${data[i].shortForecast}</p>
				<p>
					<img src="icons/temperature.png">${data[i].temperature}° <img src="icons/humidity.png">${data[i].relativeHumidity.value}%<br>
					<img src="icons/precip.png"> ${(data[i].probabilityOfPrecipitation.value || 0)}%<br><img src="icons/wind.png"> ${data[i].windSpeed.replace(" to ", "-")}
				</p>`;
		}
		return div;
	}
	
	
	function generateHourlyForecastDiv(daynum, datapoint_name, iconurl, min, max)
	{
		var div = document.createElement("div");
		div.className = "hourlyforecast";
		
		//first, get min and max values across all days
		var allvalues = new Array();
		var values = new Array();
		for(var d = 0; d < forecastdays.length; d++)
		{
			for(var i = 0; i < forecastdays[d].hourly.length; i++)
			{
				var value = forecastdays[d].hourly[i][datapoint_name];
				if(typeof value === "object")
				{
					if(value.unitCode == "wmoUnit:degC") { value = CtoF(value.value); }
					else { value = value.value; }
				}
				else if(typeof value === "string")
				{
					value = parseInt(value);
				}
				allvalues.push(value);
				if(d == daynum) { values.push(value); }
			}
		}
		if(min == undefined) { min = Math.floor(Math.min(...allvalues) / 10) * 10; }
		if(max == undefined) { max = Math.ceil(Math.max(...allvalues) / 10) * 10; }
		
		//now create all div bars
		for(var i = 0; i < values.length; i++)
		{
			var bar = document.createElement("div");
			bar.className = "bar";
			if(!forecastdays[daynum].hourly[i].isDaytime) { bar.className += " night"; }
			bar.style.height = map(values[i], min, max, 0, 100) + "%";
			if(values.length <= 15 || i % 2 == 0)
			{
				bar.innerHTML = values[i];
			}
			div.appendChild(bar);
		}
		
		if(daynum == 0)
		{
			div.innerHTML += `<img src="${iconurl}">`;
		}
		return div;
	}
}


function randomBackgroundImage()
{
	const imgs = [
		["snow", "Cascade Valley Metro Park, OH"],
		["rain", "Shenandoah National Park, VA"],
		["sunset2", "Shenandoah National Park, VA"],
		["cloudy2", "Shenandoah National Park, VA"],
		["cloudy", "Cades Cove, TN"],
		["sun", "Vail, CO"],
		["sunset", "Vail, CO"],
		["lake", "Piney Lake, CO"],
		["day", "Millersburg, OH"],
	];
	const rand = Math.floor(Math.random() * imgs.length);
	document.getElementById("bkgimg").style.backgroundImage = "url('bkg/" + imgs[rand][0] + ".jpg')";
	document.getElementById("bkgimg").style.opacity = 1;
	document.getElementById("footer").innerHTML = "Background: " + imgs[rand][1] + "<br>by Frost Sheridan";
	document.getElementById("footer").className = "";
}