var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
	if(this.readyState == 4 && this.status == 200)
	{
		var sites = JSON.parse(this.responseText);
		for(var i = 0; i < sites.length; i++)
		{
			document.getElementById("directory").innerHTML += `<p><a href="${sites[i]["url"]}">${sites[i]["name"]}</a> • ${sites[i]["author"]}<br>${sites[i]["description"]}</p>`;
		}
	}
}
xhttp.open("GET", "sites.json", true);
xhttp.send();