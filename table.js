//table component
(function() {
	'use strict';
	window.createTable = function(id, schema, datas) {
		var table = {
			schema: schema,
			datas: datas,
			init: function(schema, datas) {
				var that = this;
				var tableElement = document.querySelector(id);
				tableElement.innerHTML = '';
				schema.fields.forEach(function(field) {
					var thead = document.createElement('thead');
					var tableHeader = document.createElement('th');
					thead.appendChild(tableHeader);

					tableHeader.textContent = field.label;
					if (field.sortable) {
						var up = document.createElement('i');
						var down = document.createElement('i');
						up.setAttribute('class', 'arrow-up');
						down.setAttribute('class', 'arrow-down');
						up.addEventListener('click', function() {
							that.sort(field.name, 'asc', field.callback);
						});
						down.addEventListener('click', function() {
							that.sort(field.name, 'desc', field.callback);
						});
						tableHeader.appendChild(up);
						tableHeader.appendChild(down);
					}
					tableElement.appendChild(tableHeader);
				});
				var tbody = document.createElement('tbody');
				datas.forEach(function(data) {
					var tableRow = document.createElement('tr');
					schema.fields.forEach(function(field) {
						var tableData = document.createElement('td');
						tableData.textContent = data[field.name];
						tableRow.appendChild(tableData);
						tbody.appendChild(tableRow);
					});
				});
				tableElement.appendChild(tbody);
			},
			sort: function(sortKey, direction, callback) {
				if (callback) {
					this.datas.sort(callback);
				} else {
					this.datas.sort(function(a, b) {
						if (direction === 'desc') {
							return a[sortKey] > b[sortKey] ? -1 : 1;
						} else if (direction === 'asc') {
							return a[sortKey] < b[sortKey] ? -1 : 1;
						}
					});
				}
				this.init(this.schema, this.datas);
			}
		};
		table.sort(schema.fields[1].name, 'desc');
		return table;
	};
})();
