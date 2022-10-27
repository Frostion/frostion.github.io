var num_cubes;
var selected_cube = 0;
var selected_cube_index = 0;
var selected_cube_prev = selected_cube;
var selected_cube_ms = 0;

var font_header;
var img_header;

var pg_background;
var gl;

var after_millis;
var intro_ms = 3000;
var cube_rotate_in_ms = 3000;

var cubes = [
	{
		"title": "about me",
		"caption": "profile of the cyberdragon",
		"image": "info.png"
	},
	{
		"title": "journal",
		"caption": "updates on me and my projects",
		"image": "journal.png"
	},
	{
		"title": "inflatables",
		"caption": "the horde of inflatable dragons that I live with",
		"image": "balloon.png"
	},
	{
		"title": "tech museum",
		"caption": "info and resources about my favorite tech",
		"image": "tech.png"
	},
	{
		"title": "creative",
		"caption": "artwork, vrchat worlds, and photography",
		"image": "art.png"
	},
	{
		"title": "projects",
		"caption": "software and electronics I've developed",
		"image": "projects.png"
	},
	{
		"title": "interactive",
		"caption": "programs I've written that run in your browser",
		"image": "apps.png"
	}
];



function preload()
{
	font_header = loadFont("index_assets/Nintendo-DS-BIOS.woff");
	img_header = loadImage("index_assets/cyberheader.png");
	
	for(var i = 0; i < cubes.length; i++)
	{
		cubes[i].image = loadImage("index_assets/" + cubes[i].image);
	}
}


function setup()
{
	num_cubes = cubes.length;
	
	//create canvas and have it fill browser window
	setAttributes('antialias', false);
	setAttributes('alpha', true);
	var cnv = createCanvas(windowWidth, windowHeight, WEBGL);
	cnv.style('display', 'block');
	var x = (windowWidth - width) / 2;
	var y = (windowHeight - height) / 2;
	cnv.position(x, y);
	pg_background = createGraphics(40, 40);
	
	gl = this._renderer.GL;
}


function windowResized()
{
	resizeCanvas(windowWidth, windowHeight);
}


function draw()
{
	after_millis = millis() - intro_ms;
	
	drawBackground();
	drawIntro();
	drawText();
	
	
	rotateX(map(after_millis, 0, cube_rotate_in_ms, TWO_PI, 0, true));
	rotateY(map(after_millis, 0, cube_rotate_in_ms, -5, 0, true));
	rotateZ(map(after_millis, 0, cube_rotate_in_ms, 1.2, 0, true));
	scale(map(after_millis, 0, cube_rotate_in_ms, 0, 15, true));
	drawCubes();
	
	
	
	gl.clearColor(0, 0, 0, 1);
	gl.colorMask(false, false, false, true);
	// Set all of the pixels alpha values to 1 (this assumes there is a fully
	// opaque triangle covering every pixel, and WebGL is just botching the alpha
	// blending math)
	gl.clear(gl.COLOR_BUFFER_BIT);
	// re-enable the RGB channels
	gl.colorMask(true, true, true, true);
}


function drawIntro()
{
	if(millis() >= intro_ms) { return; }
	var sinpos = map(millis(), 0, intro_ms, 0, TWO_PI, true);
	var alpha = map(cos(sinpos), -1, 1, 255, 0);
	
	push();
	noFill();
	stroke(255, alpha);
	circle(0, 0, map(millis(), 0, intro_ms, 0, 1000));
	tint(255, alpha);
	image(img_header, int(-img_header.width / 2), int(-img_header.height / 2));
	pop();
}


function drawBackground()
{
	var bkg_color = color(25, 0, 50);
	background(lerpColor(color(0), bkg_color, map(millis(), 0, intro_ms, 0, 1, true)));
	
	push();
	rotateX(PI / 2);
	noFill();
	strokeWeight(5);
	
	var num_circles = 15;
	
	for(var i = 0; i < num_circles; i++)
	{
		var size = map(i, 0, num_circles, 128, 3000);
		var n = sineLFO(9000, 0, 1, (num_circles - i) * 0.5);
		var alpha = map(i, 0, num_circles, n * 255, 0);
		push();
		translate(0, 0, -300 + n * 50);
		stroke(255, map(millis(), intro_ms * 0.5, intro_ms * 2, 0, alpha, true));
		circle(0, 0, size);
		pop();
	}
	pop();
}


function drawCubes()
{
	//set up lighting and material for cubes
	push();
	lights();
	specularMaterial(0, 130, 255, 100);
	shininess(100);
	noStroke();
	
	//give the cubes a bit of left/right wobble
	rotateY(sineLFO(7000, -0.03, 0.03, 0));
	
	//rotate the cubes to the selected one
	rotateY(-map(millis() - selected_cube_ms, 0, 500, selected_cube_prev, selected_cube, true) * (TWO_PI / num_cubes));
	
	for(var i = 0; i < num_cubes; i++)
	{
		push();
		translate(0, sineLFO(5000, -0.6, 0.6, i), 15); //up/down wobble
		rotateZ(sineLFO(6000, -0.05, 0.05, i)); //rotational wobble
		rotateX(sineLFO(8000, -0.1, 0.1, i)); //front/back wobble
		box(5);
		translate(0, 0, 2.51);
		image(cubes[i].image, -1.5, -1.5, 3, 3);
		pop();
		rotateY(TWO_PI / (num_cubes));
	}
	pop();
}


function drawText()
{
	if(millis() < (intro_ms + cube_rotate_in_ms)) { return; }
	var alpha = map(after_millis - cube_rotate_in_ms, 0, 1000, 0, 255, true);
	push();
	noStroke();
	
	//draw header text
	fill(255, 255, sawLFO(1000, 50, 255), alpha);
	textFont(font_header);
	textSize(50);
	textAlign(CENTER, BASELINE);
	text(cubes[selected_cube_index].title, 0, -125 + sineLFO(3500, -3, 3, 0));
	
	//draw caption text
	fill(255, alpha);
	textSize(20);
	textAlign(CENTER, TOP);
	text(cubes[selected_cube_index].caption, 0, -120 + sineLFO(3500, -3, 3, -1));
	
	//draw left arrow
	fill(255, 255, sawLFO(1000, 50, 255), alpha);
	var move = sineLFO(1000, 0, 20, 0);
	push();
	translate(-200 - move, -125);
	scale(map(millis() - ms_since_left_pressed, 0, 250, 2, 1, true));
	beginShape();
	vertex(0, -12);
	vertex(-32, 0);
	vertex(0, 12);
	endShape(CLOSE);
	pop();
	
	//draw right arrow
	push();
	translate(200 + move, -125);
	scale(map(millis() - ms_since_right_pressed, 0, 250, 2, 1, true));
	beginShape();
	vertex(0, -12);
	vertex(32, 0);
	vertex(0, 12);
	endShape(CLOSE);
	pop();
	
	pop();
}

function sineLFO(time, min, max, offset)
{
	var sinpos = map(millis() % time, 0, time, 0, TWO_PI);
	return map(sin(sinpos + offset), -1, 1, min, max);
}
function sawLFO(time, min, max)
{
	return map(millis() % time, 0, time - 1, min, max);
}


var ms_since_left_pressed = 0;
var ms_since_right_pressed = 0;

function keyPressed()
{
	if(keyCode == LEFT_ARROW)
	{
		selected_cube_prev = selected_cube;
		selected_cube -= 1;
		selected_cube_ms = millis();
		ms_since_left_pressed = millis();
	}
	else if(keyCode == RIGHT_ARROW)
	{
		selected_cube_prev = selected_cube;
		selected_cube += 1;
		selected_cube_ms = millis();
		ms_since_right_pressed = millis();
	}
	
	selected_cube_index = mod(selected_cube, num_cubes);
}

function mod(x, m) {
    return (x%m + m)%m;
}