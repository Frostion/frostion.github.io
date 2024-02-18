draconicRing();

function draconicRing()
{
	var ring_url = "https://www.cyberdragon.digital/rings/draconic/";
	var widget_id = "draconic-widget";
	var index_url = ring_url;
	
	
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200)
		{
			findRingURLs(JSON.parse(this.responseText));
		}
	}
	xhttp.open("GET", ring_url + "sites.json", true);
	xhttp.send();
	
	
	function findRingURLs(sites)
	{
		var current_url = window.location.hostname;
		var prev_url = null;
		var next_url = null;
		
		for(var i = 0; i < sites.length; i++)
		{
			if(sites[i]["url"].includes(current_url))
			{
				var prev_url = sites[(i > 0) ? (i - 1) : (sites.length - 1)]["url"];
				var next_url = sites[(i + 1) % sites.length]["url"];
				break;
			}
		}
		
		createWidget(prev_url, next_url);
	}
	
	
	function createWidget(prev_url, next_url)
	{
		var html = `
		<a href="${index_url}"><img class="indexbtn" src="${ring_url}indexbtn.png" alt="Draconic Webring"></a>
		<a href="${prev_url}"><img class="prevbtn" src="${ring_url}prevbtn.png" alt="Previous Site"></a>
		<a href="${next_url}"><img class="nextbtn" src="${ring_url}nextbtn.png" alt="Next Site"></a>`;
		
		var html_url_not_found = `
		<a href="${index_url}"><img class="indexbtn" src="${ring_url}indexbtn.png" alt="Draconic Webring"></a>
		<img class="urlnotfound" src="${ring_url}notfound.png" alt="Site not found in members list.">`;
		
		var css = `
		#${widget_id}
		{
			width: 150px; height: 90px;
			background-image: url('${ring_url}widgetbkg.png');
			border: none;
			clip-path: none;
			position: relative;
			box-sizing: border-box;
		}
		#${widget_id} img { position: absolute; display: block; }
		#${widget_id} img.urlnotfound { left: 28px; top: 51px; }
		#${widget_id} img.indexbtn { left: 20px; top: 22px; }
		#${widget_id} img.prevbtn { left: 26px; top: 52px; }
		#${widget_id} img.nextbtn { left: 88px; top: 52px; }`;
		
		document.head.innerHTML += "<style>" + css + "</style>";
		document.getElementById(widget_id).innerHTML = (prev_url != null) ? html : html_url_not_found;
	}
}

