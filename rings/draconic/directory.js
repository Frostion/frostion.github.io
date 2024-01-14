function showHowToJoin()
{
	document.getElementById("howtojoin").hidden = !document.getElementById("howtojoin").hidden;
	document.getElementById("directory").hidden = true;
}
function showDirectory()
{
	document.getElementById("howtojoin").hidden = true;
	document.getElementById("directory").hidden = !document.getElementById("directory").hidden;
}
function directoryPrev()
{
	current_member--;
	document.getElementById("members").style.transform = "rotate3d(0, 1, 0, " + (-rotation_per_member * current_member) + "deg)";
}
function directoryNext()
{
	current_member++;
	document.getElementById("members").style.transform = "rotate3d(0, 1, 0, " + (-rotation_per_member * current_member) + "deg)";
}
function directoryGoto()
{
	var site = current_member;
	while(site < 0) { site += sites.length; }
	while(site >= sites.length) { site -= sites.length; }
	window.open(sites[site]["url"], "_blank");
}

var translation_amt = 410;
var scale_amt = 0.75;
var rotation_per_member = 0;
var current_member = 0;
var sites;

var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
	if(this.readyState == 4 && this.status == 200)
	{
		sites = JSON.parse(this.responseText);
		rotation_per_member = 360 / sites.length;
		for(var i = 0; i < sites.length; i++)
		{
			var site_link = document.createElement("a");
			site_link.href = sites[i]["url"];
			site_link.appendChild(document.createTextNode(sites[i]["name"]));
			var site_title = document.createElement("p");
			site_title.appendChild(site_link);
			site_title.appendChild(document.createElement("br"));
			site_title.appendChild(document.createTextNode("by: " + sites[i]["author"]));
			var site_desc = document.createElement("p");
			site_desc.appendChild(document.createTextNode(sites[i]["description"]));
			var member = document.createElement("div");
			member.appendChild(site_title);
			member.appendChild(site_desc);
			
			var rotation = (i / sites.length) * 360;
			member.style.transform = "translate(-50%, -50%) rotate3d(0, 1, 0, " + rotation + "deg) translate3d(0, 0, " + translation_amt + "px) scale(" + scale_amt + ")";
			
			document.getElementById("members").appendChild(member);
		}
	}
}
xhttp.open("GET", "sites.json", true);
xhttp.send();