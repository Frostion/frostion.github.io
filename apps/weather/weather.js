//==============================================================================================================================
// get user's geolocation
//==============================================================================================================================

navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError, { enableHighAccuracy: true });

function geolocationSuccess(position)
{
	apiGetLocationProperties(position.coords.latitude, position.coords.longitude);
}

function geolocationError(position)
{
	document.getElementById("location").innerHTML = "Error finding location";
	hideLoading();
}

function hideLoading()
{
	document.getElementById("loading").style.display = "none";
}

//==============================================================================================================================
// get data from NWS API about user's location and forecast
//==============================================================================================================================

var json_location = null, json_forecast = null, json_hourly = null, json_grid = null, json_alerts = null;


function apiGetLocationProperties(latitude, longitude)
{
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if(this.readyState == 4)
		{
			if(this.status == 200)
			{
				json_location = JSON.parse(this.responseText);
				document.getElementById("location").innerHTML = json_location.properties.relativeLocation.properties.city + ", "  + json_location.properties.relativeLocation.properties.state;
				
				apiGetForecast(json_location.properties.forecast);
				apiGetAlerts(latitude, longitude);
			}
			else
			{
				document.getElementById("header").innerHTML = "<div><h2>NWS location error (HTTP " + this.status + ")</h2><p>Try refreshing the page.</p></div>";
			}
		}
	}
	xhr.open("GET", "https://api.weather.gov/points/" + latitude.toFixed(4) + "," + longitude.toFixed(4), true);
	xhr.send();
}


function apiGetForecast(url)
{
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if(this.readyState == 4)
		{
			if(this.status == 200)
			{
				json_forecast = JSON.parse(this.responseText);
				const data = json_forecast.properties.periods;
				var html = "";
				for(var i = 0; i < data.length; i++)
				{
					html += "<div><img src=\"" + data[i].icon + "\">";
					html += "<div><h2>" + data[i].name + "</h2>";
					html += "<p><span><img src=\"icons/temperature.png\"> " + data[i].temperature + "°</span>"
					html += "<span><img src=\"icons/humidity.png\"> " + data[i].relativeHumidity.value + "%</span>"
					html += "<span><img src=\"icons/dewpoint.png\"> " + CtoF(data[i].dewpoint.value) + "°</span>"
					html += "<span><img src=\"icons/precip.png\"> " + (data[i].probabilityOfPrecipitation.value || 0) + "%</span>"
					html += "<span><img src=\"icons/wind.png\"> " + data[i].windSpeed.replace(" to ", "-") + "</span></p>";
					html += "<details><summary>" + data[i].shortForecast + "</summary>" + data[i].detailedForecast + "</details></div></div>";
				}
				document.getElementById("forecast").innerHTML += html;
				
				//select background image based on current conditions
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
				document.getElementById("footer").innerHTML = "<div>Background: " + imgs[rand][1] + "<br>© 2024 Frost Sheridan</div>";
			}
			else
			{
				document.getElementById("header").innerHTML = "<div><h2>NWS forecast error (HTTP " + this.status + ")</h2><p>Try refreshing the page.</p></div>";
			}
			hideLoading();
		}
	}
	xhr.open("GET", url, true);
	xhr.send();
}

function CtoF(c) { return c * 1.8 + 32; }

function apiGetAlerts(latitude, longitude)
{
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200)
		{
			json_alerts = JSON.parse(this.responseText);
			const data = json_alerts.features;
			if(data.length == 0) { return; }
			
			var html = "";
			for(var i = 0; i < data.length; i++)
			{
				var formatted = data[i].properties.description.replace(/\n\s*\n/g, "<br>");
				html += "<details><summary><img src=\"icons/alert.png\"> " + data[i].properties.event + "</summary>" + formatted + "</details>";
			}
			document.getElementById("alerts").innerHTML = "<div>" + html + "</div>";
		}
	}
	xhr.open("GET", "https://api.weather.gov/alerts/active?point=" + latitude.toFixed(4) + "," + longitude.toFixed(4), true);
	xhr.send();
}