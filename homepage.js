//================================================================================================
// cool text on home page
//================================================================================================


generateCybertext();
function generateCybertext()
{
	const phrases = ["choose your virtual echo.", "in the universe of the computer.", "welcome to the digital dimension.", "you are now connected.", "access the infinite.", "i can feel my soul collide.", "the void will answer.", "welcome to the next reality.", "look into the core of your soul.", "continue without saving?", "what does your mind's eye see?", "hyper unreality dynamic shift.", "ethereal reality reanimation.", "a path to experience digital eternity.", "behind the haze of digital abstraction.", "the gate remembers your signature.", "i saw the transfer gate before me.", "all reality disappearing around me."];
	var phrase = phrases[Math.floor(Math.random() * phrases.length)];
	document.getElementsByClassName("cybertext")[0].innerHTML = "[&nbsp" + phrase + "<span class=\"blinkcursor\">█</span>&nbsp]";
}


//================================================================================================
// get them RSS widgets populated
//================================================================================================


populateRSS("updates.xml", "updates");
populateRSS("journal/rss.xml", "journal");

function populateRSS(feed_url, target_id)
{
	var entries = [];
	const entry_template = { title: "", page: "", date: "", category: null };
	
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
				entry.page = items[i].querySelector("link").innerHTML;
				var d = new Date(items[i].querySelector("pubDate").innerHTML);
				entry.date = d.toLocaleDateString("default", { dateStyle: "medium" }).toLowerCase();
				var category_element = items[i].querySelector("category");
				if(category_element != null) { entry.category = category_element.innerHTML; }
				
				entries.push(entry);
			}
			
			//create index
			var html = "";
			for(var i = 0; i < entries.length; i++)
			{
				html += "<li><a href=\"" + entries[i].page + "\">" + entries[i].date + "</a> ";
				if(entries[i].category != null) { html += "<span class=\"tag\">" + entries[i].category + "</span> "; } else { html += "• "; }
				html += entries[i].title + "</li>";
			}
			document.getElementById(target_id).innerHTML = html;
		}
	}
	xhttp.open("GET", feed_url, true);
	xhttp.send();
}