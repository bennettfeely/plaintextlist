var html = document.querySelector('html');
var content_list_wrapper = document.querySelector('.content_list_wrapper');


// List functions
if (document.querySelector('html').classList.contains('list')) {
	// Add a comma to each list item
	var list_items = document.querySelectorAll('.content_item');
	var i;
	for (i = 0; i < list_items.length; i++) { 
		list_items[i].insertAdjacentHTML('afterbegin', '<input class="checkbox" type="checkbox">')
		list_items[i].insertAdjacentHTML('beforeend', '<span class="comma">, </span>')
	}

	// Clone the list for resetting
	var list = document.querySelector('.content_list').cloneNode(true);
}

// State change indicator
function flash(elem) {
	document.querySelector(elem).classList.add('is-changed');
	setTimeout(function() {
		document.querySelector(elem).classList.remove('is-changed');
	}, 200);
}

// Sort list
function sort(order) {
	// Change indicator
	flash('.sort_' + order);

	if (order == 'default') {
		console.log('sort-default!')
		tinysort('.content_item',{
			order: 'asc',
			attr: 'data-order'
		});
	} else {
		// Sort list
		console.log('sort-it!')
		tinysort('.content_item', {
			order: order
		});
	}
}

// Toggle list settings
function listStyle(list_style) {
	// Change indicator
	flash('.style_' + list_style);

	if (list_style == 'default') {
		loopContent('div', 'p', list_style);
	}

	if (list_style == 'commas') {
		loopContent('div', 'span', list_style);
	}

	if (list_style == 'numbers') {
		loopContent('ol', 'li', list_style);
	}

	if (list_style == 'bullets') {
		loopContent('ul', 'li', list_style);
	}

	if (list_style == 'checkboxes') {
		loopContent('div', 'label', list_style);
	}
}

// Change list structure
function loopContent(parent_tag, child_tag, list_style) {
	var list_items = document.querySelectorAll('.content_item');

	var new_parent = document.createElement(parent_tag);
		new_parent.className = 'content_list ' + list_style;

	content_list_wrapper.innerHTML = '';
	content_list_wrapper.appendChild(new_parent);

	var i;
	for (i = 0; i < list_items.length; i++) { 
		var new_item = document.createElement(child_tag);
			new_item.className = 'content_item';

		var text_content = list_items[i].innerHTML;
		var data_order = list_items[i].getAttribute('data-order');

		new_item.innerHTML = text_content;
		new_item.setAttribute('data-order', data_order);

		new_parent.appendChild(new_item);
	}
}

// Turn on/off night mode via localstorage
var night_toggle = document.querySelector('#night_toggle');

console.log(night_toggle);

if (store.get('night_mode') == true) {
	html.classList.add('night');
	document.querySelector('#night_toggle').checked = true;
} else {
	html.classList.remove('night');
	document.querySelector('#night_toggle').checked = false;
}

// Toggle night mode via checkbox
function nightMode() {
	if (document.querySelector('#night_toggle').checked == true) {
		store('night_mode', true);
		html.classList.add('night');
	} else {
		store('night_mode', false);  
		html.classList.remove('night');
	}
}