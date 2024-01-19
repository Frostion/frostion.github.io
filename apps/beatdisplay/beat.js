//------------------------------------------------------------------------------------------------------------------------------
//display target time and title
//------------------------------------------------------------------------------------------------------------------------------

//get target beat time from URL query string (?time=###)
var url_params = new URLSearchParams(window.location.search);
var target_beats = parseInt(url_params.get("beats"));
var widget_title = url_params.get("title");
if(isNaN(target_beats) || target_beats < 0 || target_beats > 999) { target_beats = 0; }

//display target beats and widget title
document.getElementById("target-beats").innerText = target_beats.toString().padStart(3, "0");
if(widget_title == null || widget_title == "") { document.getElementById("widget-title").hidden = true; }
else { document.getElementById("widget-title").innerText = widget_title; }


//convert target beat time to local time
var date = new Date();
var proportion = target_beats / 1000;
date.setUTCHours(Math.floor(24 * proportion) - 1); //hours in a day (minus 1 to adjust for swatch time offset)
date.setUTCMinutes(Math.floor(1440 * proportion) % 60); //minutes in a day
date.setUTCSeconds(Math.floor(86400 * proportion) % 60); //seconds in a day

//display target time
document.getElementById("target-time").innerText = date.toLocaleTimeString([], { timeStyle: "short" });
	

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
    hours = (hours + 1) % 24;
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

//------------------------------------------------------------------------------------------------------------------------------
//widget editor
//------------------------------------------------------------------------------------------------------------------------------

function openEditor()
{
	document.getElementById("display").hidden = true;
	document.getElementById("editor").hidden = false;
}

function cancelEdits()
{
	document.getElementById("display").hidden = false;
	document.getElementById("editor").hidden = true;
	document.getElementById("complete").hidden = true;
}

function saveEdits()
{
	var beats = parseInt(document.getElementById("target-beats-entry").value);
	if(isNaN(beats) || beats < 0 || beats > 999)
	{
		document.getElementById("editor-text").innerText = "please enter a valid beat time (between 0 and 999)."
		return;
	}
	
	document.getElementById("editor").hidden = true;
	document.getElementById("complete").hidden = false;
	
	var beats = document.getElementById("target-beats-entry").value;
	var title = document.getElementById("widget-title-entry").value;
	var url = window.location.href.split("?")[0] + "?beats=" + beats + "&title=" + encodeURIComponent(title);
	document.getElementById("bbcode").value = "[webgarden]" + url + "[/webgarden]";
	document.getElementById("finish-button").onclick = function() { window.location.href = url; };
}

