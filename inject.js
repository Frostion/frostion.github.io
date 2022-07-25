//================================================================================================
// cool text on home page
//================================================================================================


generateCybertext();
function generateCybertext()
{
	if(document.getElementsByClassName("cybertext")[0] == null) { return; }
	
	const phrases = ["choose your virtual echo.", "in the universe of the computer.", "welcome to my digital dimension.", "you are now on-line.", "access the infinite.", "i can feel my soul collide.", "the void will answer.", "welcome to the next reality.", "look into the core of your soul.", "continue without saving?", "what did you imagine?", "hyper unreality dynamic shift.", "ethereal reality reanimation."];
	var phrase = phrases[Math.floor(Math.random() * phrases.length)];
	var i = 0;
	var cur = true;
	typeCybertext();
	
	function typeCybertext()
	{
		i++;
		document.getElementsByClassName("cybertext")[0].innerHTML = "[&nbsp" + phrase.substring(0,i) + "&nbsp]";
		if(i < phrase.length) { setTimeout(typeCybertext, 35); }
		else { setTimeout(blinkCursor, 50); }
	}
	
	function blinkCursor()
	{
		var cur_string = cur ? "█" : "░";
		document.getElementsByClassName("cybertext")[0].innerHTML = "[&nbsp" + phrase.substring(0,i) + cur_string + "&nbsp]";
		cur = !cur;
		setTimeout(blinkCursor, 500);
	}
}


//================================================================================================
// inject sidebar html into current page
//================================================================================================


injectSidebars();
function injectSidebars()
{
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4)
		{
			if(this.status == 200)
			{
				document.getElementsByClassName("page")[0].innerHTML += this.responseText;
				requestYesterwebRing();
				requestStatusCafe();
			}
		}
	}
	xhttp.open("GET", "/sidebars.html", true);
	xhttp.send();
}


//================================================================================================
// yesterweb ring widget
//================================================================================================


var my_url = normalizeURL("https://www.cyberdragon.digital/");

function requestYesterwebRing()
{
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4)
		{
			if(this.status == 200)
			{
				createYesterwebRing(JSON.parse(this.responseText));
			}
		}
	}
	xhttp.open("GET", "https://webring.yesterweb.org/webring.json", true);
	xhttp.send();
}

function createYesterwebRing(sites)
{
	for(var i = 0; i < sites.length; i++)
	{
		var test_url = normalizeURL(sites[i].url);
		if(test_url === my_url)
		{
			var prev_url = sites[(i - 1 > 0 ? i : sites.length) - 1].url;
			var next_url = sites[(i + 1) % sites.length].url;
			var rand_url = sites[Math.random() * sites.length | 0].url;
			
			var el = document.getElementsByClassName("yw-widget-full")[0];
			if(el == null) { return; }
			el.innerHTML = "<h4>Yesterweb Ring</h4><p>This site, <a href=\"" + sites[i].url + "\">" + sites[i].name + "</a>, is keeping the old web alive. Thanks, <b>" + sites[i].owner + "</b>!</p><p><a href=\"" + prev_url + "\">[Prev]</a> <a href=\"" + rand_url + "\">[Rand]</a> <a href=\"" + next_url + "\">[Next]</a></p>";
			return;
		}
	}
}

function normalizeURL(url) {
	url = (url + '').replace(/\/?$/, '/');
	try {
		var src = new URL(url);
		var dst = new URL('https://example.com/');
		dst.hostname = src.hostname;
		dst.pathname = src.pathname;
		return dst.toString();
	} catch (err) {
		return url;
	}
}


//================================================================================================
// status.cafe widget
//================================================================================================


function requestStatusCafe()
{
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4)
		{
			if(this.status == 200)
			{
				var status_data = JSON.parse(this.responseText);
				document.getElementById("statuscafe").innerHTML = status_data.face + " <i>" + status_data.timeAgo + "</i><br>" + status_data.content;
			}
		}
	}
	xhttp.open("GET", "https://status.cafe/users/frostsheridan/status.json", true);
	xhttp.send();
}