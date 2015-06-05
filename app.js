function addNumbers(a, b) {
	return a + b;
}

function totalForArray(arr) {
	arr.reduce(addNumbers);
}

function average(total, count) {
	return count / total;
}

function averageForArray(arr) {
	return average(totalForArray(arr), arr.length);
}

function getItem(propertyName) {
	return function(item) {
		if (item && item.hasOwnProperty(propertyName)) {
			return item[propertyName];
		} else {
			return null;
		}
	}
}

function pluck(arr, propertyName) {
	return arr.map(getItem(propertyName));
}

function combineArrays(arr1, arr2, finalArr) {
	finalArr = finalArr || [];
	finalArr.push([arr1.shift(), arr2.shift()]);

	if (arr1.length === 0 && arr2.length === 0) {
		return finalArr;
	} else {
		return combineArrays(arr1, arr2, finalArr);
	}
}

function makeArrayCount(keys, arr) {
	return keys.map(function(key) {
		return [
			key,
			arr.filter(function(item) { return item === key }).length
		]
	});
}

$(document).ready(function() {
	var diameter = 960;
	var format = d3.format(',d');
	var color = d3.scale.category20c();

	var bubble = d3.layout.pack()
		.sort(null)
		.size([diameter, diameter])
		.padding(1.5);

	var svg = d3.select('#bubble-graph').append('svg')
		.attr('width', diameter)
		.attr('height', diameter)
		.attr('class', 'bubble');

	function setGraphData(data) {
		var node = svg.selectAll('.node')
			.data(bubble.nodes(data).filter(function(d) { return !d.children }))
			.enter().append('g')
			.attr('class', 'node')
			.attr('transform', function(d) { return "translate(" + d.x + "," + d.y + ")" });

		node.append('circle')
			.attr('r', function(d) { return d.r })
			.style('fill', function(d) { return color(d.className) });

		node.append('text')
			.attr('dy', '.3em')
			.style('text-anchor', 'middle')
			.style('font-size', '12px')
			.text(function(d) { return d.className });
	}

	function processData(dataResponse) {
		var tagNames = pluck(_.flatten(pluck(dataResponse.data, 'tags')), 'name');
		var tagNamesUnique = _.compact(_.uniq(tagNames));

		return {
			children: makeArrayCount(tagNamesUnique, tagNames).map(function(tagArray) {
				return {
					className: tagArray[0],
					package: 'cluster',
					value: tagArray[1]
				}
			})
		}
	}

	function updateGraph(dataResponse) {
		setGraphData(processData(dataResponse));
	}

	var apikey = '5571b9af02e1140305e57a08';
	var dataRequest = $.get('http://api.crisis.net/item?limit=100&apikey=' + apikey);

	dataRequest.done( updateGraph );
});
