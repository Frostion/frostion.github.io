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
		<h4>Draconic Ring</h4>
		<p><a href="${prev_url}">previous</a> • <a href="${index_url}">index</a> • <a href="${next_url}">next</a></p>`;
		
		var html_url_not_found = `
		<p>this website was not found in the <a href="${index_url}">Draconic Ring</a> members list.</p>`;
		
		var css = `
		#${widget_id}
		{
			width: 150px; height: 75px;
			
			background-image: url('${ring_url}bkg.png');
			background-position: 8px 8px;
			border: 6px ridge #777;
			clip-path: none;
			
			display: flex;
			flex-direction: column;
			justify-content: center;
			padding: 8px;
		}
		
		#${widget_id} *
		{
			text-align: center;
			margin-top: 5px;
			margin-bottom: 5px;
			padding: 0;
			
		}
		
		@font-face { font-family: draconic_title; src: url('${ring_url}OldLondon.ttf'); }
		@keyframes draconic_title_glow
		{
			0% { color: #c30; }
			100% { color: #d60; }
		}
		
		#${widget_id} h4
		{
			font-family: draconic_title;
			font-size: 19pt;
			font-weight: bold;
			color: #c30;
			text-shadow: 2px 2px 1px rgba(0, 0, 0, 0.7);
			animation: draconic_title_glow 2s linear alternate infinite;
		}
		
		#${widget_id} p
		{
			font-family: unset;
			font-size: 12px;
			color: #000;
			text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.3);
		}
		
		#${widget_id} a:link { color: #a20; text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.3); }
		#${widget_id} a:hover { color: #a20; text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.3); }
		#${widget_id} a:active { color: #a20; text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.3); }
		#${widget_id} a:visited { color: #a20; text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.3); }`;
		
		
		document.head.innerHTML += "<style>" + css + "</style>";
		document.getElementById(widget_id).innerHTML = (prev_url != null) ? html : html_url_not_found;
	}
}

