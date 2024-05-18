//wrap all images in the gallery in <a> tags that open a modal popup when clicked
gallery();
function gallery()
{
	var imgs = document.querySelectorAll("div.gallery img");
	for(var i = 0; i < imgs.length; i++)
	{
		var a = document.createElement("a");
		a.href = "javascript:openImgPopup('" + imgs[i].src + "')";
		imgs[i].parentNode.insertBefore(a, imgs[i]);
		a.appendChild(imgs[i]);
	}
}

function openImgPopup(path)
{
	document.body.innerHTML += "<div id='imgpopup' onclick='closeImgPopup()'><img src='" + path + "'></div>";
}

function closeImgPopup()
{
	var img = document.querySelector("#imgpopup img");
	img.style.animationName = "imgpopupout";
	img.addEventListener("animationend", () => {
	  document.getElementById("imgpopup").remove();
	});
}