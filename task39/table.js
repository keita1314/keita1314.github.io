//table component
(function() {
	'use strict';
	window.createTable = function(id, schema, datas) {
		var table = {
			schema: schema,
			datas: datas,
			tableTemplate: document.querySelector(id),
			init: function(schema, datas) {
				var that = this;
				var tableElement = this.tableTemplate;
				tableElement.innerHTML = '';
				if (schema === null) {
					tableElement.remove();
					return;
				}
				var thead = document.createElement('thead');
				thead.style.backgroundColor = 'grey';
				var tbody = document.createElement('tbody');
				schema.fields.forEach(function(field) {
					var tableHeader = document.createElement('th');
					tableHeader.textContent = field.label;
					thead.appendChild(tableHeader);
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
				});
				tableElement.appendChild(thead);
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
				if (this.schema.freezeTableHeader) {
					this.freeze();
				}
			},
			redraw: function() {
				var that = this;
				var tableElement = this.tableTemplate;
				var tbody = this.tableTemplate.children[1];
				tbody.innerHTML = '';
				this.datas.forEach(function(data) {
					var tableRow = document.createElement('tr');
					that.schema.fields.forEach(function(field) {
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
			},
			freeze: function() {
				this.tableTemplate.children[0].style.width = this.tableTemplate.width;
				this.tableTemplate.children[0].style.position = 'fixed';
				this.tableTemplate.children[1].style.display = 'block';
				this.tableTemplate.children[1].style.height = this.tableTemplate.offsetHeight / 3 + 'px';
				this.tableTemplate.children[1].style.overflow = 'scroll';
				var th = this.tableTemplate.children[0];
				var tbody = this.tableTemplate.children[1];
				var that = this;
				tbody.onscroll = function(event) {
					if (tbody.scrollTop > th.offsetHeight) {
						var height = tbody.offsetHeight - th.offsetHeight;
						tbody.style.height = height + 'px';
						that.datas.shift();
						that.redraw();
					}
					if (tbody.offsetHeight <= th.offsetHeight) {
						that.init(null, []);
					}
				}
			}
		};
		table.sort(schema.fields[1].name, 'desc');
		return table;
	};
})();