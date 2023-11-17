//================================================================================================
// inject sidebar html into current page
//================================================================================================


getColumns();
function getColumns()
{
	var xhrl = new XMLHttpRequest();
	xhrl.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200)
		{
			document.getElementById("leftcolumn").innerHTML += this.responseText;
		}
	}
	xhrl.open("GET", "/leftcolumn.html", true);
	xhrl.send();
	
	var xhrr = new XMLHttpRequest();
	xhrr.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200)
		{
			document.getElementById("rightcolumn").innerHTML += this.responseText;
			requestStatusCafe();
		}
	}
	xhrr.open("GET", "/rightcolumn.html", true);
	xhrr.send();
}


//================================================================================================
// status.cafe widget
//================================================================================================


function requestStatusCafe()
{
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200)
		{
			var status_data = JSON.parse(this.responseText);
			document.getElementById("statuscafe-widget").innerHTML = status_data.face + " - " + status_data.timeAgo + "<br>" + status_data.content;
		}
	}
	xhttp.open("GET", "https://status.cafe/users/frostsheridan/status.json", true);
	xhttp.send();
}