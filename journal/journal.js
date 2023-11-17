//check if we should be loading an entry (specified as "p" query param) or the index
const url_params = new URLSearchParams(window.location.search);
var entry_param = parseInt(url_params.get("p"));

//load list of posts from RSS feed
loadRSS();
function loadRSS()
{
	var entries = [];
	const entry_template = { title: "", page: NaN, date: "", category: "" };
	
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200)
		{
			//parse rss feed as an xml document
			var parser = new DOMParser();
			var xml = parser.parseFromString(this.responseText, "application/xml");
			
			//iterate through all rss feed items and generate a list of links
			var items = xml.querySelectorAll("item");
			for(var i = 0; i < items.length; i++)
			{
				var entry = Object.create(entry_template);
				
				entry.title = items[i].querySelector("title").innerHTML;
				entry.page = parseInt(items[i].querySelector("link").innerHTML.split("=")[1]);
				var d = new Date(items[i].querySelector("pubDate").innerHTML);
				entry.date = d.toLocaleDateString("default", { dateStyle: "medium" }).toLowerCase();
				entry.category = items[i].querySelector("category").innerHTML;
				
				entries.push(entry);
			}
			
			if(isNaN(entry_param)) { generateIndex(entries); }
			else { loadEntry(entries, entry_param); }
		}
	}
	xhttp.open("GET", "rss.xml", true);
	xhttp.send();
}


function generateIndex(entries)
{
	var html = "";
	for(var i = 0; i < entries.length; i++)
	{
		html += "<li><a href=\"?p=" + entries[i].page + "\">" + entries[i].date + "</a> <span class=\"tag\">" + entries[i].category + "</span> " + entries[i].title + "</li>";
	}
	document.getElementById("header").innerHTML += "<ul>" + html + "</ul>";
}


function loadEntry(entries, num)
{
	const index_button = "<a href=\"/journal/\"><img class=\"returnbutton\" src=\"/assets/nav/return.png\"></img></a>";
	document.getElementById("header").innerHTML = index_button + document.getElementById("header").innerHTML;
	document.getElementById("centercolumn").innerHTML += "<div id=\"entry\"></div>";
	
	var entry = null;
	for(var i = 0; i < entries.length; i++)
	{
		if(entries[i].page == num)
		{
			entry = entries[i];
			break;
		}
	}
	
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4)
		{
			if(this.status == 200)
			{
				//generate header for page using entry's date and title, and include entry document
				document.getElementById("entry").innerHTML = "<h2>" + entry.date + " - " + entry.title + "</h2>" + this.responseText;
				
				//update the src attribute of images to include the folder they're stored in
				var imgs = document.getElementById("entry").querySelectorAll("img");
				for(var i = 0; i < imgs.length; i++)
				{
					if(!imgs[i].hasAttribute("data-absolutesrc"))
					{
						imgs[i].src = entry.page + "/" + imgs[i].getAttribute("src");
					}
				}
				
				//update the src attribute of videos as well
				var videos = document.getElementById("entry").querySelectorAll("video");
				for(var i = 0; i < videos.length; i++)
				{
					var source = videos[i].querySelector("source");
					source.src = entry.page + "/" + source.getAttribute("src");
				}
			}
			else
			{
				//specified entry number not found (or some other error occurred)
				document.getElementById("entry").innerHTML = "<h2>error " + this.status + "</h2><p>entry \"" + num + "\" not found. <a href=\"/journal/\">return to index</a></p>";
			}
		}
	}
	xhttp.open("GET", entry.page + "/index.html");
	xhttp.send();
}