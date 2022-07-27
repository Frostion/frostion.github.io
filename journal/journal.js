//================================================================================================
// retreieve journal entry specified by query string
//================================================================================================


getJournalEntry();
function getJournalEntry()
{
	const url_params = new URLSearchParams(window.location.search);
	const page_param = url_params.get("p");
	if(page_param == null) { return; }
	
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4)
		{
			if(this.status == 200)
			{
				document.getElementsByClassName("centercolumn")[0].innerHTML += "<div>" + this.responseText + "</div>";
				requestStatusCafe();
			}
		}
	}
	xhttp.open("GET", page_param + "/index.html", true);
	xhttp.send();
}