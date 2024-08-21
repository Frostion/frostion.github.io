getPhotos(getCameraFilterParam());

function getCameraFilterParam()
{
	const url_params = new URLSearchParams(window.location.search);
	return url_params.get("camera");
}

function getPhotos(camerafilter)
{
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200)
		{
			var photos = this.responseText.split(/[\r\n]+/);
			var cameras = [];
			var html = "";
			
			for(var i = 1; i < photos.length; i++)
			{
				var photo = photos[i].split(",");
				var filename = photo[0] + ".thumb.jpeg";
				var date = new Date(photo[1]).toISOString().split('T')[0];
				var camera = photo[2];
				
				if(!camerafilter || camera == camerafilter)
				{
					html += "<div><img loading='lazy' src='/photos/gallery/" + filename + "'>" + date + "<br>" + camera + "</div>";
				}
				if(!cameras.includes(camera)) { cameras.push(camera); }
			}
			document.getElementById("photogallery").innerHTML = html;
			
			if(camerafilter)
			{
				document.getElementById("camerafilter").innerHTML += "Filter active: <b>" + camerafilter + "</b> <a href='?p=photos'>[View all photos]</a>";
			}
			else
			{
				document.getElementById("camerafilter").innerHTML += "Filter by camera model: ";
				cameras.sort();
				for(var i = 0; i < cameras.length; i++)
				{
					document.getElementById("camerafilter").innerHTML += " <a href='?p=photos&camera=" + cameras[i] + "'>[" + cameras[i] + "]</a>";
				}
			}
			
			var imgpopup = document.createElement("script");
			imgpopup.src = "/imgpopup.js";
			document.body.appendChild(imgpopup);
		}
	}
	xhr.open("GET", "/photos/gallery/list.txt", true);
	xhr.send();
}