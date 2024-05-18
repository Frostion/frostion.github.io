//load page name specified by "p" parameter
getPage();
function getPage()
{
	const url_params = new URLSearchParams(window.location.search);
	const page_name = url_params.get("p");
	if(!page_name) { return; }
	
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if(this.readyState == 4)
		{
			if(this.status == 200)
			{
				document.getElementById("content").innerHTML = this.responseText;
				document.getElementById("content").className = "show";
				
				//create new script object to actually get it to execute
				var scripts = document.querySelectorAll("#content script");
				for(var i = 0; i < scripts.length; i++)
				{
					var clone = document.createElement("script");
					clone.type  = "text/javascript";
					if(scripts[i].src) { clone.src = scripts[i].src; }
					else { clone.text = scripts[i].text; }
					scripts[i].remove();
					document.body.appendChild(clone);
				}
			}
		}
	}
	xhr.open("GET", "/" + page_name, true);
	xhr.send();
}

//when hovering over a navbar button, show its description on the navbar text
function setNavbarDesc(str)
{
	document.getElementById("navbardesc").innerHTML = str;
}
function resetNavbarDesc()
{
	document.getElementById("navbardesc").innerHTML = "<span class=\"headerbold\">select</span> your destination.";
}