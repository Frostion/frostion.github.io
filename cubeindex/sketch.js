var num_cubes;
var selected_cube = 0;
var selected_cube_index = 0;
var selected_cube_prev = selected_cube;
var selected_cube_ms = 0;

var font_header;
var img_header;

var pg_background;
var gl;

var state = 0;
var state_start_time, state_in_time;
var intro_length = 4000, cubein_length = 3000, accept_length = 700;
var cursor_length = 400;

var cubes = [
	{
		"title": "system info",
		"caption": "webmaster profile",
		"image": "info.png"
	},
	{
		"title": "journal",
		"caption": "updates on me and my projects",
		"image": "journal.png"
	},
	{
		"title": "inflatables",
		"caption": "the horde of inflatable dragons that live with me",
		"image": "balloon.png"
	},
	{
		"title": "technology",
		"caption": "info and resources about my favorite tech",
		"image": "tech.png"
	},
	{
		"title": "creative",
		"caption": "artwork, vrchat worlds, photography",
		"image": "art.png"
	},
	{
		"title": "projects",
		"caption": "software and electronics development",
		"image": "projects.png"
	},
	{
		"title": "interactive",
		"caption": "programs that run in your browser!",
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
	
	setState(0);
}


function windowResized()
{
	resizeCanvas(windowWidth, windowHeight);
}


function draw()
{
	state_in_time = millis() - state_start_time;
	if(state == 0 && state_in_time >= 250) { setState(1); }
	if(state == 1 && state_in_time >= intro_length) { setState(2); }
	if(state == 2 && state_in_time >= cubein_length) { setState(3); }
	if(state == 4 && state_in_time >= accept_length) { location.reload(); }
	
	drawBackground();
	drawIntro();
	drawText();
	drawCubes();
	
	gl.clearColor(0, 0, 0, 1);
	gl.colorMask(false, false, false, true);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.colorMask(true, true, true, true);
}


function setState(n)
{
	console.log("state transition: " + state + " -> " + n);
	state = n;
	state_start_time = millis();
	state_in_time = 0;
}


function drawBackground()
{
	var bkg_color = color(25, 0, 50);
	
	if(state == 0) //initial blanking
	{
		background(0);
	}
	else if(state == 1) //logo intro
	{
		background(lerpColor(color(0), bkg_color, map(state_in_time, 0, intro_length, 0, 1, true)));
	}
	else if(state == 2) //cube rotate in animation
	{
		background(bkg_color);
		drawCircles(map(state_in_time, 0, cubein_length, 0, 255, true));
	}
	else //regular menu state
	{
		background(bkg_color);
		drawCircles(255);
	}
	
	function drawCircles(alpha_attenuation)
	{
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
			stroke(255, map(alpha_attenuation, 0, 255, 0, alpha, true));
			circle(0, 0, size);
			pop();
		}
		pop();
	}
}


function drawIntro()
{
	if(state != 1) { return; }
	
	var sinpos = map(state_in_time, 0, intro_length, 0, TWO_PI, true);
	var alpha = map(cos(sinpos), -1, 1, 255, 0);
	
	push();
	noFill();
	stroke(255, alpha);
	circle(0, 0, map(state_in_time, 0, intro_length, 0, 1000));
	tint(255, alpha);
	image(img_header, int(-img_header.width / 2), int(-img_header.height / 2));
	pop();
}


function drawCubes()
{
	if(state < 2) { return; }
	
	//cube rotate in animation
	push();
	rotateX(animValue(TWO_PI, 0));
	rotateY(animValue(-5, 0));
	rotateZ(animValue(1.2, 0));
	scale(animValue(0, 15));
	
	//set up lighting and shiny, translucent material for cubes
	lights();
	specularMaterial(0, 130, 255, 100);
	shininess(100);
	noStroke();
	
	//give the cubes a bit of left/right wobble
	rotateY(sineLFO(7000, -0.03, 0.03, 0));
	
	//rotate the cubes to the selected one
	rotateY(-map(millis() - selected_cube_ms, 0, cursor_length, selected_cube_prev, selected_cube, true) * (TWO_PI / num_cubes));
	
	for(var i = 0; i < num_cubes; i++)
	{
		push();
		translate(0, sineLFO(5000, -0.6, 0.6, i), 15); //up/down wobble
		rotateZ(sineLFO(6000, -0.05, 0.05, i)); //rotational wobble
		rotateX(sineLFO(8000, -0.1, 0.1, i)); //front/back wobble
		
		//animation when a cube has been selected
		if(state == 4)
		{
			if(i == selected_cube_index)
			{
				scale(map(state_in_time, 0, accept_length, 1, 5, true));
				rotateX(map(state_in_time, 0, accept_length, 0, 2, true));
				rotateY(map(state_in_time, 0, accept_length, 0, -3, true));
			}
			else
			{
				scale(map(state_in_time, 0, accept_length * 0.5, 1, 0, true));
			}
		}
		
		box(5);
		translate(0, 0, 2.51);
		image(cubes[i].image, -1.5, -1.5, 3, 3);
		pop();
		rotateY(TWO_PI / (num_cubes));
	}
	pop();
	
	
	function animValue(from, to)
	{
		if(state == 2) { return map(state_in_time, 0, cubein_length, from, to, true); }
		else { return to; }
	}
}


function drawText()
{
	if(state < 3) { return; }
	
	var alpha = 255;
	if(state == 3) { alpha = map(state_in_time, 0, 1000, 0, 255, true); }
	else if(state == 4) { alpha = map(state_in_time, 0, 400, 255, 0, true); }
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
	if(state == 3 && millis() - selected_cube_ms >= cursor_length)
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
		else if(key == ' ')
		{
			setState(4);
		}
		selected_cube_index = mod(selected_cube, num_cubes);
	}
	
	
	
}

function mod(x, m) {
    return (x%m + m)%m;
}