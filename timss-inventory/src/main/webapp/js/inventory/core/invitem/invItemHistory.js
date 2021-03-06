//获取列表中选择的信息
function getSelected() {
	var obj = $("#item_grid").datagrid("getChecked");
	if (obj) {
		var o = {};
		for ( var i = 0; i < obj.length; i++) {
			o[obj[i].itemcode] = JSON.stringify(obj[i]);
		}
		return o;
	} else {
		return null;
	}
}

//获取选中物资条目
function getFullDataSelected() {
	return $("#item_grid").datagrid("getChecked");
}

//刷新页面
function refCurPage() {
	$("#item_grid").datagrid("reload");
}