//inject sidebars into html page
xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
	if(this.readyState == 4)
	{
		if(this.status == 200)
		{
			document.getElementsByClassName("page")[0].innerHTML += this.responseText;
		}
	}
}
xhttp.open("GET", "/sidebars.html", true);
xhttp.send();