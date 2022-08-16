function widthResizeCheckbox()
{
	var value = document.getElementById("widthResize").checked;
	document.getElementById("minWidth").disabled = !value;
	document.getElementById("maxWidth").disabled = !value;
}


function heightResizeCheckbox()
{
	var value = document.getElementById("heightResize").checked;
	document.getElementById("minHeight").disabled = !value;
	document.getElementById("maxHeight").disabled = !value;
}

var myloconfig = "";
var widgetpackage = "";


function generateXML()
{
	var myloconfig = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n\
<config xmlns=\"" + v("siteURL") + "\" version=\"1.0\">\n\
</config>";

	var widgetpackage = "<?xml version=\"1.0\" encoding=\"utf-8\" ?>\n\
<widgetPackage xmlns=\"" + v("siteURL") + "\" version=\"1.0\">\n\
	<info>\n\
		<packageName>" + v("packageName") + "</packageName>\n\
		<author>" + v("author") + "</author>\n\
		<abstract>" + v("abstract") + "</abstract>\n\
		<version>" + v("version") + "</version>\n\
		<locale>" + v("locale") + "</locale>\n\
		<engine>" + v("engine") + "</engine>\n\
		<updateURL>" + v("updateURL") + "</updateURL>\n\
		<siteURL>" + v("siteURL") + "</siteURL>\n";
		
		if(document.getElementById("widthResize").checked)
		{
			widgetpackage += "		<minWidth>" + v("minWidth") + "</minWidth>\n\
		<maxWidth>" + v("maxWidth") + "</maxWidth>\n";
		}
		
		if(document.getElementById("heightResize").checked)
		{
			widgetpackage += "		<minHeight>" + v("minHeight") + "</minHeight>\n\
		<maxHeight>" + v("maxHeight") + "</maxHeight>\n";
		}
		
		widgetpackage += "		<defWidth>" + v("defWidth") + "</defWidth>\n\
		<defHeight>" + v("defHeight") + "</defHeight>\n\
		<createDate>" + v("createDate") + "</createDate>\n\
	</info>\n\
</widgetPackage>";

	//enable download links
	document.getElementById("downloadmyloconfig").href = "data:attachment/text," + encodeURI(myloconfig);
	document.getElementById("downloadwidgetpackage").href = "data:attachment/text," + encodeURI(widgetpackage);
	
	//enable result previews
	document.getElementById("myloconfig").innerHTML = escapeHTML(myloconfig);
	document.getElementById("widgetpackage").innerHTML = escapeHTML(widgetpackage);
	document.getElementById("results").removeAttribute("hidden");
}


function v(id)
{
	return document.getElementById(id).value;
}

function escapeHTML(unsafe)
{
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }