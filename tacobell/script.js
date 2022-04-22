var frame_element = document.getElementById("frame");
var container_element = document.getElementById("item_container");
var display_element = document.getElementById("item_display");
var bottom_bar_element = document.getElementById("bottom_bar");


document.body.addEventListener("click", pageClicked);
frame_element.addEventListener("animationend", animationEnd);


function pageClicked()
{
	frame_element.style.animation = "frame_rotate 1s linear";
	container_element.style.animation = "fade_out 0.3s linear forwards";
}


function animationEnd(e)
{
	if(e.target.id == "frame")
	{
		frame_element.style.animation = "none";
		display_element.innerHTML = generateItem();
		container_element.style.animation = "fade_in 0.3s linear";
		bottom_bar_element.style.animation = "bottom_bar_in 0.7s linear forwards";
	}
}


function generateItem()
{
	const modifier = ["Baja Blast", "Volcano", "Ranch", "Chipotle", "Avocado", "White Hot", "Crunchy", "Cheesy", "Doritos", "Nacho", "Cinnamon", "Grilled", "Fiesta", "Classic", "Crispy"];
	const ingredient = ["Chicken", "Beef", "Steak", "Cheese", "Veggie", "Potato"];
	const type = ["Taco", "Burrito", "Nachos", "Bowl", "Crunchwrap", "Freeze", "Quesadilla", "Fries", "Quesarito"];
	
	var item = ingredient[Math.floor(Math.random() * ingredient.length)] + " " + type[Math.floor(Math.random() * type.length)];
	if(Math.random() > 0.75) { item += " Supreme"; }
	
	var num_modifiers = Math.floor(Math.random() * 3) + 1;
	for(var i = 0; i < num_modifiers; i++)
	{
		item = modifier[Math.floor(Math.random() * modifier.length)] + " " + item;
	}
	
	return item;
}