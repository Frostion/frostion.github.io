start();
async function start()
{
	//rss feeds are stored in the "feeds" url query param
	const params = new URLSearchParams(window.location.search);
	var feeds_param = params.get("feeds");
	
	if(feeds_param == null) //if there's no "feeds" param, then this must be a new blank session. show the help/about page
	{
		document.getElementById("status").innerHTML = "no feeds entered.";
		setVisible("helptext");
	}
	else //if there are feeds specified, fetch them and show their contents
	{
		//split the feeds string (delimited by newlines) into an array of urls
		var feeds_string = decodeURIComponent(feeds_param);
		var feed_urls_array = feeds_string.split("\n");
		setVisible("status");
		
		//download and parse requested feeds, then sort all feed items by descending date
		var feed_items = await downloadFeeds(feed_urls_array);
		feed_items.sort((a, b) => (b.pubdate.getTime() - a.pubdate.getTime()));
		displayFeedItems(feed_items);
		
		//put the list of feed urls back into the editor so that it can be viewed and modified by the user
		document.getElementById("feedlisteditor").value = feeds_string;
		
		//hide the status display 1 second after all feeds are downloaded to reduce clutter
		//setTimeout(function() { setVisible(null); }, 1000);
	}
}


function setVisible(id)
{
	if(id == null || !document.getElementById(id).hidden) { id = ""; }
	var tabs = document.getElementsByClassName("uitab");
	for(var i = 0; i < tabs.length; i++) { tabs.item(i).hidden = tabs.item(i).id != id; }
}


function saveFeeds()
{
	var feeds_param = encodeURIComponent(document.getElementById("feedlisteditor").value);
	if(feeds_param.length > 0)
	{
		var url = new URL(window.location);
		url.searchParams.set("feeds", feeds_param);
		window.location.href = url.toString();
	}
}


async function downloadFeeds(feed_urls)
{
	const feed_item_template = {
		author: "",
		title: "",
		url: "",
		pubdate: new Date(),
		toHTML: function()
		{
			var li = document.createElement("li");
			li.innerHTML = `${this.author} » <a href="${this.url}" target="linkpreview">${this.title}</a> <a href="${this.url}" target="_blank">↗</a>`;
			return li;
		},
	};
	var feed_items = [];
	
	for(var i = 0; i < feed_urls.length; i++)
	{
		//create status display for this feed
		var url = feed_urls[i].trim();
		var status_element = document.createElement("span");
		status_element.className = "loading";
		document.getElementById("status").appendChild(status_element);
		document.getElementById("status").appendChild(document.createTextNode(" " + url));
		document.getElementById("status").appendChild(document.createElement("br"));
		
		//download and parse feed xml
		try
		{
			//download feed from url through this one cool cors proxy
			var fetch_url = "https://api.allorigins.win/raw?url=" + encodeURIComponent(url);
			var response = await fetch(fetch_url).then(response => response.text());
			
			//parse downloaded text into xml
			var parser = new DOMParser();
			var xml = parser.parseFromString(response, "application/xml");
			
			//get data from rss xml
			var author = xml.querySelector("title").innerHTML;
			var items = xml.querySelectorAll("item");
			if(items.length == 0) { items = xml.querySelectorAll("entry"); } //atom feeds use 'entry' tags instead of 'item' tags
			for(var j = 0; j < items.length; j++)
			{
				var new_item = Object.create(feed_item_template);
				new_item.author = author;
				new_item.title = items[j].querySelector("title").innerHTML;
				new_item.url = items[j].querySelector("link").getAttribute("href") ?? items[j].querySelector("link").innerHTML;
				var date = items[j].querySelector("pubDate") ?? items[j].querySelector("published"); //atom feeds use 'published' tags instead of 'pubDate' tags
				new_item.pubdate = new Date(date.innerHTML);
				feed_items.push(new_item);
			}
			
			//mark this feed as complete
			status_element.className = "complete";
		}
		catch(error)
		{
			console.log("[ERROR] " + url + "\n" + error);
			status_element.className = "failed";
		}
	}
	return feed_items;
}


function displayFeedItems(feed_items)
{
	var day = null;
	var ul = null;
	for(var i = 0; i < feed_items.length; i++)
	{
		var pubdate = feed_items[i].pubdate;
		
		//we've reached a different day while parsing feeds, create a new date header and list
		if(day == null || day.toLocaleDateString() !== pubdate.toLocaleDateString())
		{
			day = pubdate;
			document.getElementById("app").innerHTML += "<h2>" + day.toLocaleDateString("default", { dateStyle: "full" }) + "</h2>";
			ul = document.createElement("ul");
			document.getElementById("app").appendChild(ul);
		}
		
		ul.appendChild(feed_items[i].toHTML());
	}
}