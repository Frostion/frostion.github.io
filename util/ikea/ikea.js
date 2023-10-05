//================================================================================================================================================
//check if there's any existing store and item data in the query string
//================================================================================================================================================

function checkQueryString()
{
	var query_params = new URLSearchParams(window.location.search);
	
	//"storeid" contains selected store ID number
	var storeid = query_params.get("storeid");
	if(storeid)
	{
		document.getElementById("store_select").value = storeid;
	}
	
	//"items" contains comma-separated list of item article numbers
	var items = query_params.get("items");
	if(items)
	{
		var items_list = items.split(",");
		var qty_list = query_params.get("qty").split(",");
		for(var x = 0; x < items_list.length; x++)
		{
			addItem(items_list[x], qty_list[x]);
		}
	}
}
checkQueryString();


//================================================================================================================================================
//add items to the table
//================================================================================================================================================


//add an item to the table by article number or URL
function addItem(articleno, qty)
{
	articleno = articleno.replace(/\D/g, ""); //get only numeric digits from article no
	if(articleno.length != 8) { return false; } //article numbers must be exactly 8 digits
	var row = document.getElementById("results_display").insertRow();
	row.id = articleno;
	row.insertCell(0).innerHTML = "<button type=\"button\" onclick=\"removeItem('" + articleno + "')\"><img src=\"trash.svg\"></button>";
	row.insertCell(1).innerHTML = "<a href=\"https://www.ikea.com/us/en/search/?q=" + articleno + "\" target=\"_blank\">" + articleno + "</a>";
	var qtycell = row.insertCell(2);
	qtycell.innerHTML = qty;
	qtycell.onclick = function() { editItemQty(articleno); };
	row.insertCell(3); row.insertCell(4); row.insertCell(5); row.insertCell(6);
	loadItemInfo(row);
	return true;
}

function removeItem(articleno)
{
	document.getElementById(articleno).remove();
	updateItemsQueryString();
}

function editItemQty(articleno)
{
	var new_qty = prompt("Edit quantity for item " + articleno + ":", getItemQty(articleno));
	if(new_qty)
	{
		new_qty = parseInt(new_qty);
		if(isNaN(new_qty))
		{
			alert("Quantity input could not be parsed as an integer.");
		}
		else
		{
			setItemQty(articleno, new_qty);
			updateItemsQueryString();
			loadItemInfo(document.getElementById(articleno));
		}
	}
}

function getItemQty(articleno)
{
	var rows = document.getElementById("results_display").rows;
	for(var i = 1; i < rows.length; i++)
	{
		if(rows[i].id == articleno) { return parseInt(rows[i].cells[2].innerText); }
	}
	return undefined;
}

function setItemQty(articleno, qty)
{
	var rows = document.getElementById("results_display").rows;
	for(var i = 1; i < rows.length; i++)
	{
		if(rows[i].id == articleno) { rows[i].cells[2].innerText = qty; }
	}
}

function addButtonClicked()
{
	var new_item = document.getElementById("item_entry").value;
	var qty = document.getElementById("qty_entry").value;
	if(qty < 1) { qty = 1; }
	else if(qty > 99) { qty = 99; }
	
	if(!addItem(new_item, qty)) { alert("Item text does not contain a valid article number."); }
	
	document.getElementById("item_entry").value = "";
	document.getElementById("qty_entry").value = 1;
	updateItemsQueryString();
}

function updateItemsQueryString()
{
	var rows = document.getElementById("results_display").rows;
	var new_items = "";
	var new_qty = "";
	for(var i = 1; i < rows.length; i++)
	{
		if(i > 1)
		{
			new_items += ",";
			new_qty += ",";
		}
		new_items += rows[i].id;
		new_qty += rows[i].cells[2].innerText;
	}
	modifyQueryString("items", new_items);
	modifyQueryString("qty", new_qty);
}

function updateStoreQueryString()
{
	var store = document.getElementById("store_select").value;
	loadAllItems();
	modifyQueryString("storeid", store);
}

function modifyQueryString(key, value)
{
	var query_params = new URLSearchParams(window.location.search);
    query_params.set(key, value);
    var new_url = window.location.pathname + '?' + query_params.toString();
    history.pushState(null, '', new_url);
}



//================================================================================================================================================
//load item info from the ikea api
//================================================================================================================================================

function loadItemInfo(row)
{
	row.cells[3].innerHTML = row.cells[4].innerHTML = row.cells[5].innerHTML = row.cells[6].innerHTML = "<img src=\"loading.svg\">";
	var storeno = document.getElementById("store_select").value;
	var articleno = row.id;
	apiGetItemInfo(storeno, articleno, row);
	apiGetItemLocation(storeno, articleno, row);
	apiGetItemAvailability(storeno, articleno, row);
	apiGetItemPrice(articleno, row);
}
function loadAllItems()
{
	var rows = document.getElementById("results_display").rows;
	for(var i = 1; i < rows.length; i++)
	{
		loadItemInfo(rows[i]);
	}
}

function apiGetItemInfo(storeno, articleno, row)
{
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200)
		{
			try
			{
				var json = JSON.parse(this.response);
				row.cells[3].innerText = json["data"][0]["localisedCommunications"][0]["itemNameLocal"];
			}
			catch(e)
			{
				row.cells[3].innerHTML = "Error";
			}
		}
	}
	xhr.open("GET", "https://api.ingka.ikea.com/salesitem/communications/ru/us?itemNos=" + articleno, true);
	xhr.setRequestHeader("X-Client-Id", "0b0cb44f-194c-42eb-a996-4cc165bd902a");
	xhr.send();
}

function apiGetItemLocation(storeno, articleno, row)
{
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200)
		{
			try
			{
				var json = JSON.parse(this.response);
				var loc = json["data"][0]["salesLocations"][0];
				var division = loc["division"]; //location in store: MARKETHALL, SELF_SERVE, or SHOW_ROOM
				var aisleandbin = loc["aisleAndBin"]; //self serve aisle and bin
				var department = loc["department"]; //markethall or showroom department
				
				division = division.replace("_", " ").toLowerCase();
				row.cells[5].innerHTML = "<span class=\"division\">" + division[0].toUpperCase() + division.slice(1).toLowerCase() + "</span><br>";
				if(aisleandbin != undefined) { row.cells[5].innerHTML += "Aisle " + aisleandbin["aisle"] + ", Bin " + aisleandbin["bin"]; }
				else if(department != undefined) { row.cells[5].innerHTML += department["names"][0]["name"]; }
				else { row.cells[5].innerHTML += "Unknown"; }
			}
			catch(e)
			{
				row.cells[5].innerHTML = "Error";
			}
		}
	}
	xhr.open("GET", "https://api.ingka.ikea.com/salesitem/salesspaces/sto/" + storeno + "?itemNos=" + articleno, true);
	xhr.setRequestHeader("X-Client-Id", "0b0cb44f-194c-42eb-a996-4cc165bd902a");
	xhr.send();
}

function apiGetItemAvailability(storeno, articleno, row)
{
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200)
		{
			try
			{
				var json = JSON.parse(this.response);
				var stores = json["data"];
				row.className = "";
				for(var i = 0; i < stores.length; i++)
				{
					if(stores[i]["classUnitKey"]["classUnitCode"] == storeno)
					{
						var stock = parseInt(stores[i]["availableStocks"][0]["quantity"]);
						row.cells[6].innerText = stock;
						if(stock == 0) { row.className = "outofstock"; }
						else if(stock < getItemQty(articleno)) { row.className = "understock"; }
					}
				}
			}
			catch(e)
			{
				row.cells[6].innerHTML = "Error";
			}
		}
	}
	xhr.open("GET", "https://api.ingka.ikea.com/cia/availabilities/ru/us?itemNos=" + articleno, true);
	xhr.setRequestHeader("X-Client-Id", "b6c117e5-ae61-4ef5-b4cc-e0b1e37f0631");
	xhr.send();
}

function apiGetItemPrice(articleno, row)
{
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if(this.readyState == 4)
		{
			if(this.status == 200)
			{
				var parser = new DOMParser();
				var html = parser.parseFromString(this.response, "text/html");
				row.cells[4].innerHTML = "$" + html.querySelector(".pip-temp-price__integer").innerText + html.querySelector(".pip-temp-price__decimal").innerText;
			}
			else
			{
				row.cells[4].innerHTML = "Error";
			}
		}
	}
	xhr.open("GET", corsProxy("https://www.ikea.com/us/en/products/" + articleno.slice(-3) + "/" + articleno + "-shoppable-fragment.html"), true);
	xhr.send();
}

function corsProxy(url)
{
	return "https://api.allorigins.win/raw?url=" + url;
}