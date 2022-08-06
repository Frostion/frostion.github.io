const entries = ["2022.08.03", "2022.07.28", "2022.07.18"];


const url_params = new URLSearchParams(window.location.search);
var entry_param = url_params.get("entry");


if(entry_param == null)
{
	var page_param = parseInt(url_params.get("p"));
	if(isNaN(page_param)) { page_param = 0; }

	const entries_per_page = 5;
	const first_entry = entries_per_page * page_param;
	var at_end = false;

	for(var i = first_entry; i < first_entry + entries_per_page; i++)
	{
		if(i >= entries.length - 1) { at_end = true; }
		if(i >= entries.length) { break; }
		getEntry(entries[i]);
	}

	const newer_posts_link = (page_param == 0) ? "no newer entries" : ("<a href=\"?p=" + (page_param-1) + "\">newer entries →</a>");
	const older_posts_link = (at_end) ? "no older entries" : ("<a href=\"?p=" + (page_param+1) + "\">← older entries</a>");
	document.getElementsByClassName("centercolumn")[0].innerHTML += "<div style=\"overflow:auto; padding-left:100px; padding-right:100px;\"><p style=\"float:left;\">" + older_posts_link + "</p><p style=\"float:right;\">" + newer_posts_link + "</p></div>";
}


else
{
	getEntry(entry_param, "<p style=\"text-align:center;\">[ you are viewing a single entry. <a href=\"?p=0\">view all entries</a> ]</p>");
}


function getEntry(entry_name, before_text = "")
{
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4)
		{
			if(this.status == 200)
			{
				document.getElementsByClassName("centercolumn")[0].innerHTML += "<div>" + before_text + "<h2><a href=\"?entry=" + entry_name + "\">" + entry_name + "</a></h2>" + this.responseText + "</div>";
			}
			else
			{
				document.getElementsByClassName("centercolumn")[0].innerHTML += "<div><p>entry \"" + entry_name + "\" not found. (status code: " + this.status + ")</p></div>";
			}
		}
	}
	xhttp.open("GET", entry_name + "/index.html", false);
	xhttp.send();
}