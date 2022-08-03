//================================================================================================
// inject sidebar html into current page
//================================================================================================


injectSidebars();
function injectSidebars()
{
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200)
		{
			document.getElementsByClassName("page")[0].innerHTML += this.responseText;
			requestStatusCafe();
		}
	}
	xhttp.open("GET", "/sidebars.html", true);
	xhttp.send();
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