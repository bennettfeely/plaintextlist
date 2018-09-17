var html = document.querySelector("html");
var content_list_wrapper = document.querySelector(".content_list_wrapper");

// Search
var item_list = new List("search_wrapper", {
	valueNames: ["list_item", { attr: "href", name: "list_link" }]
});

item_list.on("updated", function(e) {
	console.log(e);

	if (e.matchingItems.length == 0) {
		document.querySelector(".results").innerHTML = "No lists found";
	} else if (e.matchingItems.length == 1) {
		document.querySelector(".results").innerHTML = "Found 1 list";
	} else if (e.matchingItems.length >= 2) {
		document.querySelector(".results").innerHTML =
			"Found " + e.matchingItems.length + " lists";
	}
});

// List functions
if (document.querySelector("html").classList.contains("list")) {
	// Add a comma and checkbox to each list item
	var list_items = document.querySelectorAll(".content_item");
	var i;
	for (i = 0; i < list_items.length; i++) {
		list_items[i].insertAdjacentHTML(
			"afterbegin",
			'<input class="checkbox" type="checkbox">'
		);
		list_items[i].insertAdjacentHTML(
			"beforeend",
			'<span class="comma">, </span>'
		);
	}

	// Clone the list for resetting
	var list = document.querySelector(".content_list").cloneNode(true);

	// Append a copypate button
	if (ClipboardJS.isSupported()) {
		var default_text = "<span>Copy list to clipboard</span>";

		content_list_wrapper.insertAdjacentHTML(
			"beforebegin",
			'<button class="copy no_select no_print" data-clipboard-target=".content_list">' +
				default_text +
				"</button>"
		);

		var clipboard = new ClipboardJS(".copy");
		clipboard.on("success", function(e) {
			flash(".content_list_wrapper");

			document.querySelector(".copy").innerHTML =
				list_items.length + " items copied!";

			setTimeout(function() {
				document.querySelector(".copy").innerHTML = default_text;
			}, 2000);
		});
		clipboard.on("error", function(e) {
			console.log(e);
		});
	}
}

// State change indicator
function flash(elem) {
	document.querySelector(elem).classList.add("flash");
	setTimeout(function() {
		document.querySelector(elem).classList.remove("flash");
	}, 200);
}

// Sort list
function sort(order) {
	// Change indicator
	flash(".sort_" + order);

	if (order == "default") {
		console.log("sort-default!");
		tinysort(".content_item", {
			order: "asc",
			attr: "data-order"
		});
	} else {
		// Sort list
		console.log("sort-it!");
		tinysort(".content_item", {
			order: order,
			natural: true
		});
	}
}

// Toggle list settings
function listStyle(list_style) {
	// Change indicator
	flash(".style_" + list_style);

	if (list_style == "default") {
		loopContent("div", "p", list_style);
	}

	if (list_style == "commas") {
		loopContent("div", "span", list_style);
	}

	if (list_style == "numbers") {
		loopContent("ol", "li", list_style);
	}

	if (list_style == "bullets") {
		loopContent("ul", "li", list_style);
	}

	if (list_style == "checkboxes") {
		loopContent("div", "label", list_style);
	}
}

// Change list structure
function loopContent(parent_tag, child_tag, list_style) {
	var list_items = document.querySelectorAll(".content_item");

	var new_parent = document.createElement(parent_tag);
	new_parent.className = "content_list " + list_style;

	content_list_wrapper.innerHTML = "";
	content_list_wrapper.appendChild(new_parent);

	var i;
	for (i = 0; i < list_items.length; i++) {
		var new_item = document.createElement(child_tag);
		new_item.className = "content_item";

		var text_content = list_items[i].innerHTML;
		var data_order = list_items[i].getAttribute("data-order");

		new_item.innerHTML = text_content;
		new_item.setAttribute("data-order", data_order);

		new_parent.appendChild(new_item);
	}
}
