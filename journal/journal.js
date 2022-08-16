const url_params = new URLSearchParams(window.location.search);
var entry_param = url_params.get("p");

if(entry_param == null)
{
	var html = "";
	for(var entry_num in entries)
	{
		var entry = entries[entry_num];
		html += "<li><a href=\"?p=" + entry["date"] + "\">" + entry["date"] + "</a> • " + entry["title"] + "</li>";
	}
	document.getElementById("header").innerHTML += "<ul>" + html + "</ul>";
}
else
{
	const index_button = "<a href=\"/journal/\"><img class=\"returnbutton\" src=\"/assets/nav/return.png\"></img></a>";
	document.getElementById("header").innerHTML = index_button + document.getElementById("header").innerHTML;
	document.getElementById("page").innerHTML += "<div id=\"entry\"></div>";
	
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4)
		{
			if(this.status == 200)
			{
				for(var entry_num in entries)
				{
					var entry = entries[entry_num];
					if(entry["date"] == entry_param)
					{
						document.getElementById("entry").innerHTML = "<h2>" + entry["date"] + " - " + entry["title"] + "</h2>";
						break;
					}
				}
				document.getElementById("entry").innerHTML += this.responseText;
			}
			else
			{
				document.getElementById("entry").innerHTML = "<h2>error " + this.status + "</h2><p>entry \"" + entry_param + "\" not found. <a href=\"/journal/\">return to index</a></p>";
			}
		}
	}
	xhttp.open("GET", entry_param + "/index.html");
	xhttp.send();
}