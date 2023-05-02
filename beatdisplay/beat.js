//------------------------------------------------------------------------------------------------------------------------------
//display target time
//------------------------------------------------------------------------------------------------------------------------------

//get target beat time from URL query string (?time=###)
const url_params = new URLSearchParams(window.location.search);
const target_beats = parseInt(url_params.get("beats"));

//if entered target time is invalid (missing or out of range), show error
if(isNaN(target_beats) || target_beats < 0 || target_beats > 999)
{
	document.getElementById("target-beats").innerText = "ERR";
	document.getElementById("target-time").innerText = "ERROR";
}

//if entered target time is valid, display it
else
{
	//display target beats
	document.getElementById("target-beats").innerText = target_beats.toString().padStart(3, "0");
	
	//convert target beat time to local time
	var date = new Date();
	var proportion = target_beats / 1000;
	date.setUTCHours(Math.floor(24 * proportion) - 1); //hours in a day (minus 1 to adjust for swatch time offset)
	date.setUTCMinutes(Math.floor(1440 * proportion) % 60); //minutes in a day
	date.setUTCSeconds(Math.floor(86400 * proportion) % 60); //seconds in a day
	
	//display target time
	document.getElementById("target-time").innerText = date.toLocaleTimeString([], { timeStyle: "short" });
}
	

//------------------------------------------------------------------------------------------------------------------------------
//display current beat time
//------------------------------------------------------------------------------------------------------------------------------

updateTimeDisplay();
setInterval(updateTimeDisplay, 864); //each centibeat is 864ms long
function updateTimeDisplay()
{
	//the following code for getting the current beat time was written by melonking - https://wiki.melonland.net/swatch_time
	//get date in UTC/GMT
    var date = new Date();
    var hours = date.getUTCHours();
    var minutes = date.getUTCMinutes();
    var seconds = date.getUTCSeconds();
    var milliseconds = date.getUTCMilliseconds();
    //add hour to get time in Switzerland
    hours = (hours + 1) % 23;
    //time in seconds
    var timeInMilliseconds = ((hours * 60 + minutes) * 60 + seconds) * 1000 + milliseconds;
    //there are 86.4 seconds in a beat
    var millisecondsInABeat = 86400;
    //calculate beats to two decimal places
	var current_beat_time = Math.abs(timeInMilliseconds / millisecondsInABeat).toFixed(2).padStart(6, "0");
	
	//display current beat time
	document.getElementById("current-beats").childNodes[0].textContent = current_beat_time.split(".")[0];
	document.getElementById("current-centibeats").innerText = current_beat_time.split(".")[1];
}