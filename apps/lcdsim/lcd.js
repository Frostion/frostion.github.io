const color_scheme = [
	{ bg: "#CDD8B1", charbg: "#BDC6A3", charfg: "#000000" },
	{ bg: "#0166FF", charbg: "#2450E4", charfg: "#B2CCFF" },
	{ bg: "#98D403", charbg: "#89CE03", charfg: "#184200" },
	{ bg: "#19150C", charbg: "#5D6152", charfg: "#B2FFFD" }
];

const custom_char_text = "⁰¹²³⁴⁵⁶⁷";
const custom_chars = new Array(8);
for(var i = 0; i < 8; i++) { custom_chars[i] = new ImageData(5, 8); }
var currently_editing = 0;
document.getElementById("chareditor").addEventListener("click", charEditorClicked);
document.getElementById("chareditor").addEventListener("mousemove", charEditorHovered);

const fontimg = new Image();
fontimg.onload = function()
{
	loadFromQueryString();
	updateCharThumbnails();
	draw();
}
fontimg.src = "font.png";

function draw()
{
	saveToQueryString();
	
	const border_width = 2;
	//read rendering settings from user inputs
	const color = color_scheme[parseInt(document.getElementById("colorscheme").value)];
	const cols = document.getElementById("cols").value;
	const width = cols * 6 + border_width * 2 - 1;
	const rows = document.getElementById("rows").value;
	const height = rows * 9 + border_width * 2 - 1;
	const scale = document.getElementById("scale").value;
	
	//apply user input sizes and zoom
	const canvas = document.getElementById("output");
	canvas.width = width * scale;
	canvas.height = height * scale;
	
	//draw background color
	const ctx = canvas.getContext("2d");
	ctx.scale(scale, scale);
	ctx.fillStyle = color.bg;
	ctx.fillRect(0, 0, width, height);
	
	//draw character segment backgrounds
	ctx.fillStyle = color.charbg;
	for(var col = 0; col < cols; col++)
	{
		for(var row = 0; row < rows; row++)
		{
			ctx.fillRect(col * 6 + border_width, row * 9 + border_width, 5, 8);
		}
	}
	
	//draw text
	ctx.imageSmoothingEnabled = false;
	ctx.globalCompositeOperation = "destination-out";
	const string = document.getElementById("textinput").value;
	var col = 0, row = 0;
	for(var i = 0; i < string.length; i++)
	{
		const c = string[i];
		if(c == "\n")
		{
			row++;
			col = 0;
		}
		if(row >= rows) { break; }
		if(col >= cols) { continue; }
		
		for(var custom = 0; custom < 8; custom++)
		{
			if(c == custom_char_text[custom])
			{
				ctx.drawImage(getCustomCharCanvas(custom), col * 6 + border_width, row * 9 + border_width);
				col++;
			}
		}
		
		const ascii = c.charCodeAt(0);
		if(ascii >= 32 && ascii <= 127)
		{
			ctx.drawImage(fontimg, (ascii - 32) * 6, 0, 5, 8, col * 6 + border_width, row * 9 + border_width, 5, 8);
			col++;
		}
	}
	
	//draw text color
	ctx.globalCompositeOperation = "destination-over";
	ctx.fillStyle = color.charfg;
	ctx.fillRect(0, 0, width, height);
}


function loadCharIntoEditor()
{
	currently_editing = parseInt(document.querySelector("input[name='charselect']:checked").value);
	const ctx = document.getElementById("chareditor").getContext("2d");
	ctx.clearRect(0, 0, 5, 8);
	ctx.drawImage(getCustomCharCanvas(currently_editing), 0, 0);
}

function charEditorClicked(e)
{
	const x = Math.floor(e.offsetX / 15);
	const y = Math.floor(e.offsetY / 15);
	const i = y * 5 + x;
	
	const bmp = custom_chars[currently_editing];
	bmp.data[i*4+3] = bmp.data[i*4+3] == 255 ? 0 : 255;
	updateCharThumbnails();
	draw();
}

function updateCharThumbnails()
{
	for(var c = 0; c < 8; c++)
	{
		getCustomCharCanvas(c).getContext("2d").putImageData(custom_chars[c], 0, 0);
		getCustomCharButton(c).getContext("2d").putImageData(custom_chars[c], 0, 0);
	}
	loadCharIntoEditor();
}

function charEditorHovered(e)
{
	const x = Math.floor(e.offsetX / 15);
	const y = Math.floor(e.offsetY / 15);
	const i = y * 5 + x;
	
	loadCharIntoEditor();
	const ctx = document.getElementById("chareditor").getContext("2d");
	ctx.fillStyle = "rgba(0, 100, 200, 0.5)";
	ctx.fillRect(x, y, 1, 1);
}

function insertChar(c)
{
	document.getElementById("textinput").value += custom_char_text[c];
	draw();
}

function getCustomCharCanvas(c) { return document.getElementById("charselect" + c); }
function getCustomCharButton(c) { return document.getElementById("charbutton" + c); }


function saveToQueryString()
{
	const url = new URL(window.location);
	const params = url.searchParams;
	setParam("rows");
	setParam("cols");
	setParam("scale");
	setParam("colorscheme");
	setParam("textinput");
	
	function setParam(id)
	{
		params.set(id, encodeURIComponent(document.getElementById(id).value));
	}
	
	for(var c = 0; c < 8; c++)
	{
		var str = "";
		for(var i = 0; i < 40; i++)
		{
			str += custom_chars[c].data[i*4+3] == 255 ? 1 : 0;
		}
		var bin = BigInt("0b" + str);
		params.set("c" + c, bin.toString(16));
	}
	
	window.history.pushState(null, '', url.toString());
}

function loadFromQueryString()
{
	const params = new URLSearchParams(window.location.search);
	
	setElementValue("rows");
	setElementValue("cols");
	setElementValue("scale");
	setElementValue("colorscheme");
	setElementValue("textinput");
	
	function setElementValue(id)
	{
		var value = params.get(id);
		if(value != null)
		{
			document.getElementById(id).value = decodeURIComponent(value);
		}
	}
	
	for(var c = 0; c < 8; c++)
	{
		const hex = params.get("c" + c);
		if(hex != null)
		{
			const bigint = BigInt("0x" + hex);
			const bin = bigint.toString(2).padStart(40, "0");
			for(var i = 0; i < 40; i++)
			{
				custom_chars[c].data[i*4+3] = bin[i] == "1" ? 255 : 0;
			}
		}
	}
}

function reset()
{
	window.location.search = "";
}