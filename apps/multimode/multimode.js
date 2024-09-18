document.getElementById("fileselect").onchange = function(event) {
	var files = event.target.files;
	if (FileReader && files && files.length)
	{
        var fr = new FileReader();
        fr.onload = function() {
			var img = new Image();
			img.onload = function() { makegif(img); };
            img.src = fr.result;
        };
		fr.readAsDataURL(files[0]);
    }
};

function makegif(input_image)
{
	var encoder = new GIFEncoder();
	encoder.setRepeat(0); //repeat forever
	encoder.setDelay(100); //delay between frames in milliseconds
	encoder.start();
	for(var i = 0; i < 9; i++)
	{
		var canvas = new OffscreenCanvas(320, 240);
		var context = canvas.getContext("2d");
		context.drawImage(input_image, (i%3) * 320, Math.floor(i/3) * 240, 320, 240, 0, 0, 320, 240);
		encoder.addFrame(context);
	}
	encoder.finish();
	var binary_gif = encoder.stream().getData();
	var data_url = "data:image/gif;base64," + encode64(binary_gif);
	document.querySelector("#output img").src = data_url;
	document.querySelector("#output a").href = data_url;
	document.querySelector("#output").hidden = false;
}