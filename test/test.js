xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
	if(this.readyState == 4)
	{
		if(this.status == 200)
		{
			const parser = new DOMParser();
			const doc = parser.parseFromString(this.responseText, "text/html");
			doc.getElementsByClassName("centercolumn")[0].innerHTML = document.body.innerHTML;
			doc.head.innerHTML += document.head.innerHTML;
			document.documentElement.innerHTML = doc.documentElement.innerHTML;
		}
	}
}
xhttp.open("GET", "/template.html", true);
xhttp.send();