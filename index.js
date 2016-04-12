var tableSchema = {
	fields: [{
		name: 'name',
		label: '姓名',
		sortable: false,
	}, {
		name: 'chinese',
		label: '语文',
		sortable: true,
	}, {
		name: 'math',
		label: '数学',
		sortable: true,
	}, {
		name: 'english',
		label: '英语',
		sortable: true,
	}, {
		name: 'total',
		label: '总分',
		sortable: true,
	}, ]
};
var datas = [{
	name: '小明',
	chinese: 80,
	math: 90,
	english: 70,
	total: 240
}, {
	name: '小红',
	chinese: 90,
	math: 60,
	english: 90,
	total: 240
}, {
	name: '小亮',
	chinese: 60,
	math: 100,
	english: 70,
	total: 230
}];
var t = createTable('#ui-table', tableSchema, datas);