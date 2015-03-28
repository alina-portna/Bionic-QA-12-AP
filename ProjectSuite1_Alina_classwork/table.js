var c_InnerPadding = 5;

function table_setActive(element)
{
	element.innerHTML = "";
	element.preventDefault = false;

	table_CreateRootFrame(element);
	table_CreateTable(element);
	table_ClearFilter(element);
	table_CreateRows(element, null, -1, 0);

	table_resizeCaptions(element);

	// Creating columns here because their widths are correct only after appending to body

	var tp = element.rootDiv.tablePane;
	tp.m_dataTable.creating = true;
	tp.m_dataTable.totalWidth = 0;

	for (var i = 0; i < element.m_Captions.length; i++)
		caption_CreateControl(element.m_Captions[i], false);

	if (tp.m_dataTable.mozilla)
	{
		tp.m_dataTable.width = tp.m_dataTable.totalWidth;
		tp.linkedDiv.m_headTable.width = tp.m_dataTable.totalWidth;
	}
	tp.m_dataTable.creating = false;
	if (tp.m_dataTable.rows.length > 1)
		tp.m_dataTable.rows[1].click();

	table_updateFilterState(element.table.columns);
	table_checkHeaderWidth(tp);

	table_OperaForceRedraw(element, true);
}

function table_CreateTable(element)
{
	element.m_NestedObject = null;
	element.m_Captions = new Array();

	if (element.table.columns != null)
	{
		var oTablePane = window.document.createElement("DIV");
		oTablePane.className = "tableBody";
		element.rootDiv.appendChild(oTablePane);
		element.rootDiv.tablePane = oTablePane;
		oTablePane.tableElement = element;

		oTablePane.style.width = element.rootDiv.offsetWidth - 2 * c_InnerPadding;
		oTablePane.style.height = element.rootDiv.offsetHeight - 2 * c_InnerPadding;

		var oTable = window.document.createElement("TABLE");
		oTablePane.appendChild(oTable);
		oTable.cellPadding = 0;
		oTable.cellSpacing = 0;
		oTable.border = 0;
		oTable.style.position = "relative";
		oTable.style.top = 4;

		oTable.m_sortColumnId = -1;
		oTable.m_sortAscending = true;
		oTable.m_sortCaption = null;

		var oHead = window.document.createElement("THEAD");
		oTable.appendChild(oHead);
	
		var oTR = window.document.createElement("TR");
		oHead.appendChild(oTR);
		
		for (var i = 0; i < element.table.columns.length; i++)
		{
			var oColumn = element.table.columns[i];
//			if (getColumnTypeIsSuppressed(oColumn.typeName)) // false
//				continue;
			
			var oTD = window.document.createElement('TD');
			oTD.column = oColumn;
			oTD.m_dataTable = oTable;
			oTD.noWrap = true;
			oColumn.realTD = oTD;
			oTR.appendChild(oTD);
		}

		var oBody = window.document.createElement("TBODY");
		element.rowBody = oBody;
		oTable.appendChild(oBody);

		oTablePane.m_dataTable = oTable;
		oTablePane.getScreenX = Function("return getScreenX(this)");
		oTablePane.getScreenY = Function("return getScreenY(this)");
		
// Creating headers of columns

		var oFlowDiv = window.document.createElement("DIV");
		element.rootDiv.appendChild(oFlowDiv);

		oFlowDiv.id = "oFlowDiv";
		oFlowDiv.parentDiv = oTablePane;
		oFlowDiv.style.padding = 2;
		oFlowDiv.style.position = "absolute";
	
		oFlowDiv.style.backgroundColor = "white";
//		oFlowDiv.style.width = oTablePane.offsetWidth - 20;
		oFlowDiv.style.height = 21;
		oFlowDiv.style.overflow = "hidden";
	
		oTablePane.linkedDiv = oFlowDiv;
		oTablePane.onscroll = table_doTablePaneScroll;
	
		var oFlowTable = window.document.createElement("TABLE");
		oFlowDiv.appendChild(oFlowTable);
		oFlowDiv.m_headTable = oFlowTable;

		oFlowTable.cellPadding = 0;
		oFlowTable.cellSpacing = 0;
		oFlowTable.border = 0;
	
		var oFlowHead = window.document.createElement("THEAD");
		oFlowTable.appendChild(oFlowHead);
	
		var oFlowTR = window.document.createElement("TR");
		oFlowHead.appendChild(oFlowTR);
	
		for (var i = 0; i < element.table.columns.length; i++)
		{
			var oColumn = element.table.columns[i];
//			if (getColumnTypeIsSuppressed(oColumn.typeName)) // false
//				continue;
			
			var oFlowTD = window.document.createElement('TD');

			oFlowTD.className = 'aqds_caption';
			oFlowTD.realTD = oColumn.realTD;
			oFlowTD.column = oColumn;
			oFlowTD.noWrap = true;

			element.m_Captions.push(oFlowTD);
			oFlowTR.appendChild(oFlowTD);

			oColumn.m_caption = oFlowTD;
			// captions creation moved from here
		}

		table_UpdateColumnsPosition(element);
	}
}

function table_UpdateColumnsPosition(element)
{
	var oTablePane = element.rootDiv.tablePane;
	if (oTablePane == null) return;

	var oFlowDiv = oTablePane.linkedDiv;
	if (oFlowDiv == null) return;

	var _delta = c_InnerPadding - 1;
	if ((oTablePane.clientHeight - 6) < oTablePane.m_dataTable.offsetHeight)
		_delta += 18;

	if (isIE)
	{
		oFlowDiv.style.left = oTablePane.getScreenX();
		oFlowDiv.style.top = oTablePane.getScreenY() - 1;
		oFlowDiv.style.width = oTablePane.offsetWidth - _delta;
	}
	else
	{
		oFlowDiv.style.left = getScreenX(oTablePane) + 2;
		oFlowDiv.style.top = getScreenY(oTablePane) + 1;
		oFlowDiv.style.width = oTablePane.offsetWidth - _delta;
	}

	var nestedObject = element.m_NestedObject;
	if (nestedObject != null && nestedObject.popupDiv != null)
	{
		nestedObject.popupDiv.style.left = (getScreenX(nestedObject) - (isIE ? 2 : 1)) + "px";
		nestedObject.popupDiv.style.top  = (getScreenY(nestedObject) - (isIE ? 2 : 0)) + "px";
		if (nestedObject.popupIFrame != null)
		{
			nestedObject.popupIFrame.style.left = nestedObject.popupDiv.style.left;
			nestedObject.popupIFrame.style.top = nestedObject.popupDiv.style.top;
		}
	}
}

function table_CreateRootFrame(element)
{
	var hasNestedData = getHasNestedData(element);
	var nestedDataIsPlain = getNestedDataIsPlain(element);

	// Create a root table
	var oTable = window.document.createElement("TABLE");
	element.appendChild(oTable);
	element.rootTable = oTable;
	element.filtered = false;

	if (element.showCaption != false)
	{
		oTable.className = "singleFrame";
	}

	oTable.cellPadding = 0;
	oTable.cellSpacing = 0;
	oTable.border = 0;

	oTable.style.width = element.offsetWidth;
	oTable.style.height = element.offsetHeight;
	
	if (element.showCaption != false)
	{
		// Create a table caption
		var oHead = window.document.createElement("THEAD");
		oTable.appendChild(oHead);
		
		var oTR = window.document.createElement("TR");
		oHead.appendChild(oTR);
		
		var oTD = window.document.createElement("TD");
		oTD.colSpan = 2;
		oTR.appendChild(oTD);

		oTD.className = "cellCaption"; 
		oTD.innerText = element.table.caption;
	}

	// Create a table body
	var oBody = window.document.createElement("TBODY");
	oTable.appendChild(oBody);
    
	var oTableTR = window.document.createElement("TR");
	oBody.appendChild(oTableTR);
	
	oTD = window.document.createElement("TD");
	oTD.style.verticalAlign = "top";

	var percent = 100;

//	if (hasNestedData == true && nestedDataIsPlain == false)
	if (element.table.nestedDataCount > 0)
	{
		percent = 100 / (element.table.nestedDataCount + 1);
		oTD.colSpan = 2;
	}
	oTableTR.appendChild(oTD);

	// Create an inner placeholder
	var oDiv = window.document.createElement("DIV");
	oDiv.style.padding = c_InnerPadding;
	oDiv.style.width = "100%";
	oDiv.style.height = "100%";
	oDiv.id = "rootdiv" + element.table.nestedDataCount;
	oTD.appendChild(oDiv);

	element.rootDiv = oDiv;
	element.rootTD = oTD;

	element.rootDiv.m_h_percent = percent;
	element.rootDiv.m_w_percent = 1;

	if (hasNestedData == true)
	{
		if (element.detailsDiv == null)
		{
			// Create details placeholder
			if (nestedDataIsPlain == false)
			{
				oTR = window.document.createElement("TR");
				oBody.appendChild(oTR);
			} else {
				oTR = oTableTR;
			}
			
			oTD = window.document.createElement("TD");
			if (nestedDataIsPlain) { 
				oTD.width = "30%";
				oTD.style.padding = c_InnerPadding;
				element.rootDiv.m_w_percent = 0.7;

				var oDivHead = window.document.createElement("DIV");
				oDivHead.className = "singleFrame";
				oDivHead.style.width = "100%";
				oDivHead.style.height =  (treeHeadHeight - (isIE ? 2 : 0)) + "px";
				oDivHead.style.borderBottom = "0px";
				oDivHead.m_element = element;
				oDivHead.innerHTML = "<div class='cellCaption' style='overflow:hidden;'><div style='float:left; white-space:nowrap;'>Extended Information</div>" + 
					"<img src='show.gif' onmousemove='this.src=\"show1.gif\"' onmouseout='this.src=\"show.gif\"' " +
					"style='float:right; margin:1px 3px 3px 1px; cursor:pointer;' onclick='detailsHeadBtnClick(this)' alt='Hide'></div>";
				oTD.appendChild(oDivHead);

				var oDivHead2 = window.document.createElement("DIV");
				oDivHead2.className = "singleFrame";
				oDivHead2.style.display = "none";
				oDivHead2.style.width = treeHeadWidth;
				oDivHead2.style.height =  "100%";
				oDivHead2.m_element = element;
				oDivHead2.innerHTML = "<img src='hide.gif' onmousemove='this.src=\"hide1.gif\"' " +
					"onmouseout='this.src=\"hide.gif\"' style='margin:3px; cursor:pointer;' " +
					"onclick='detailsHeadBtnClick(this)' alt='Show'><br><img src='details.gif' style='margin:3px;'>";
				oTD.appendChild(oDivHead2);

				element.detailsVisible = true;
				element.detailsHead = oDivHead;
				element.detailsHead2 = oDivHead2;
			} else {
				oTD.colSpan = 2;
				element.detailsHead = null;
			}
			oTD.className = "detailsBody";
			oTD.style.verticalAlign = "top";
			oTR.appendChild(oTD);
		 
			oDiv = window.document.createElement("DIV");
			if (nestedDataIsPlain) { oDiv.className = "singleFrame"; oDiv.style.borderTop = "0px"; }
			oDiv.style.width = (nestedDataIsPlain ? "100%" : "100%");
			oDiv.style.height = "100%";
			oDiv.style.padding = (nestedDataIsPlain ? 0 : c_InnerPadding);
			oDiv.style.overflow = "hidden";
			oTD.appendChild(oDiv);

			element.detailsDiv = oDiv;
			element.detailsDiv.id = "detailsDiv" + element.table.nestedDataCount;
		}
	} else {

		element.detailsDiv = null;
	}
	
	element.doResize = function(_Width, _Height, details_Width, details_Height)
	{
		var pad2 = c_InnerPadding * 2;

		var h0 = _Height;
		if (this.showCaption) h0 -= 21;
		var h = h0;
		if (this.showCaption) h = Math.round(h0 * this.rootDiv.m_h_percent / 100);

		var dWidth = 0;
		var dHeight = 0;

		var haveHead = this.detailsDiv && this.detailsHead;
		var headVisible = haveHead ? this.detailsVisible : false;
		var headHeight = headVisible ? this.detailsHead.offsetHeight : 0;

		if (this.showCaption || this.table.nestedDataCount == 0)
		{
			if (this.table.nestedDataCount > 0)
			{
				dWidth = _Width - 2;
				dHeight = h0 - h;
			}

			if (this.table.nestedDataCount == 0 && this.detailsDiv != null)
			{
				dWidth = _Width * (1 - element.rootDiv.m_w_percent) - (haveHead ? pad2 : 0);
				dHeight = h - (haveHead ? treeHeadHeight - pad2 : 0);
			}
		}
		else
		{
			dWidth = details_Width;
			dHeight = details_Height;
		}

		var detailsWidth = dWidth - (haveHead ? 2 : pad2);
		var detailsHeight = dHeight - (haveHead ? headHeight + 2 : pad2);

		if (this.m_NestedObject != null)
		{
			if (this.m_NestedObject.doResize)
				this.m_NestedObject.doResize(detailsWidth, detailsHeight);
		}

		if (this.detailsDiv)
		{
			if (this.detailsHead) this.detailsHead.style.width = dWidth;
			this.detailsDiv.style.width = dWidth;
			this.detailsDiv.style.height = dHeight - headHeight;
		}

		var rootWidth = (!haveHead || headVisible ? _Width * element.rootDiv.m_w_percent - 2 : _Width - treeHeadWidth - pad2 - 2);

		if (this.rootDiv.tablePane)
		{
			this.rootDiv.tablePane.style.width = rootWidth - pad2;
			if (this.filtered)
				this.rootDiv.tablePane.style.height = h - pad2 - 21;
			else
				this.rootDiv.tablePane.style.height = h - pad2;
		}
		this.rootDiv.style.width = rootWidth;
		this.rootDiv.style.height = h;

		this.rootTable.style.width = _Width;
		this.rootTable.style.height = _Height;

		this.style.width = _Width;
		this.style.height = _Height;

		if (this.m_NestedObject != null)
		{
			if (this.m_NestedObject.popupDiv != null)
			{
				this.m_NestedObject.popupDiv.style.width = detailsWidth + 2;
				if (this.m_NestedObject.popupIFrame != null)
					this.m_NestedObject.popupIFrame.style.width = detailsWidth + 2;
			}
		}
	}

	if (element.detailsDiv != null)
		element.doResize(element.offsetWidth, element.offsetHeight, element.detailsDiv.offsetWidth, element.detailsDiv.offsetHeight);
	else
		element.doResize(element.offsetWidth, element.offsetHeight, 0, 0);
}

function detailsHeadBtnClick(btn)
{
	var parent = btn;
	while (parent != null && parent.m_element == null) parent = parent.parentNode;
	if (parent == null) return;
	var element = parent.m_element;

	var width = element.offsetWidth;
	var height = element.offsetHeight;
	element.detailsVisible = !element.detailsVisible;
	element.detailsHead.style.display = element.detailsVisible ? "" : "none";
	element.detailsDiv.style.display = element.detailsVisible ? "" : "none";
	element.detailsHead2.style.display = element.detailsVisible ? "none" : "";

	element.doResize(width, height, 0, 0);
	table_UpdateColumnsPosition(element);
}

function FilterObject(value)
{
	this.value = value;
	this.checked = true;
}

function table_ClearFilter(element)
{
	for (var i = 0; i < element.table.columns.length; i++)
	{
		var oc = element.table.columns[i];
		while (oc.filterList.length > 0)
		{
			var fo = oc.filterList.pop();
			fo = null;
		}
	}
}

var _nbsp = String.fromCharCode(160); // 0x0160 - nbsp
function table_AddToFilter(column, value)
{
	if (value == "" || value == "&nbsp;" || value == _nbsp)
		value = "&lt;Empty&gt;";

	if (column.typeName == "aqds:float")
		value = value.replace(",", ".");

	var _found = false;
	for (var i = 0; i < column.filterList.length; i++)
		if (column.filterList[i].value == value) { _found = true; break; }
	if (!_found)
	{
		var _fo = new FilterObject(value);
		column.filterList.push(_fo);
	}
}

function table_CreateRows(element, parentRow, parentid, level)
{
	var resultRows = new Array();
	var globalIndent = 5 + level * 16;
	var rowPath = element.table.getPath() + "[@pid=\"" + parentid + "\"]";

	var nety_nodes = _select_Nodes(element.table.xmlData.documentElement, element.table.getPath() + "[@nety=\"True\"]");
	var data_is_tree = nety_nodes.length > 0;

	var oColumns = element.table.columns;
	var columns_length = oColumns.length;

	var rows = _select_Nodes(element.table.xmlData.documentElement, rowPath);
	for (var i = 0; i < rows.length; i++)
	{
		var oRow = rows[i];
		//var oTR = element.rowBody.insertRow(-1);
		var oTR = window.document.createElement("TR");
		resultRows.push(oTR);

		oTR.subRows = null;
		oTR.parentRow = parentRow;
		oTR.defaultColumn = null;
		oTR.onclick = table_doDefaultNestedData;
		oTR.tableElement = element;
		oTR.style.cursor = m_PointerCursor;
		oTR.filtered = false;
		oTR.mustBeVisible = true;
		
		var rowColor = oRow.getAttribute("color");
		var rowBgColor = oRow.getAttribute("bcolor");
		var rowBold = oRow.getAttribute("bold") == "True";
		var rowItalic = oRow.getAttribute("italic") == "True";
		var rowUnderline = oRow.getAttribute("underline") == "True";
		var rowStrikeout = oRow.getAttribute("strikeout") == "True";

		if (rowColor != null) oTR.style.color = rowColor;
		if (rowBgColor != null) oTR.style.backgroundColor = rowBgColor;
		oTR.m_bgColor = rowBgColor;

		if (level > 0)
			oTR.style.display = "none";
		
		var row_nety = (oRow.getAttribute("nety").toLowerCase() == "true");

		var currentRecordId = oRow.getAttribute("id");
		if (currentRecordId == null) currentRecordId = "";

		var firstColumn = true;
		for (var j = 0; j < columns_length; j++)
		{
			var oColumn = oColumns[j];
			//if (getColumnTypeIsSuppressed(oColumn.typeName)) continue; //false

			var oTD = window.document.createElement("TD");

			oTD.className = "cellValue";
			oTD.noWrap = true;

			if (rowBold) oTD.style.fontWeight = "bold";
			if (rowItalic) oTD.style.fontStyle = "italic";
			if (rowUnderline) oTD.style.textDecoration = "underline";
			if (rowStrikeout) oTD.style.textDecoration += " line-through";

			oTD.recordID = currentRecordId;
			oTD.vAlign = "center";
			oTD.align = "left";
			oTR.appendChild(oTD);

			if (firstColumn)
			{
				firstColumn = false;	
				oTD.parentRow = parentRow;
				oTD.level = level;
				oTD.m_dataTable = element.rootDiv.tablePane.m_dataTable;

				if (data_is_tree)
				{
				if (row_nety)
				{
					oTD.image = createTreeImage(false);
					oTD.image.parentTD = oTD;
					oTD.image.onclick = table_expandRow;
				} else {

					oTD.image = createTreeImageDummy();
				}
				oTD.image.style.marginLeft = 0;
				oTD.image.style.marginRight = 5;
				oTD.appendChild(oTD.image);
				oTD.style.textIndent = globalIndent;
				oTR.m_treeImage = oTD.image;
				}
			}

//			var columns = _select_Nodes(oRow, oColumn.name);
//			if (columns.length > 0) 
			{
				var firstChild = oRow.childNodes[j]; // columns[0].firstChild;
				var nodeValue = (firstChild != null) ? _get_Text(firstChild): "";
				var oSpan = window.document.createElement("SPAN");
				oTD.appendChild(oSpan);
				
				if (oColumn.typeName == "aqds:image")
				{
					oTD.vAlign = "top";
					if (nodeValue != "")
						oSpan.innerHTML = "<img src=\"" + correctLocation(element.location, nodeValue) + "\" border=\"0\" style=\"position: relative; top:1;\"/>";
					else
						oSpan.innerHTML = "&nbsp;";

					table_AddToFilter(oColumn, oSpan.innerHTML);
				} else if (oColumn.typeName == "aqds:picture") {
				
					if (nodeValue != "") 
					{
						oSpan.innerHTML = "[Picture]";
						oSpan.onclick = table_doShowNestedPicture;
						oSpan.className = "linkCell";
						oTD.cellValue = correctLocation(element.location, nodeValue);
						
						if (oTR.defaultColumn == null)
						  oTR.defaultColumn = oTD;
					} else {
						oSpan.innerHTML = "[Empty]";
						oSpan.className = "fakeLinkCell";
					}
				
				} else if (oColumn.typeName == "aqds:table") {
				
					oSpan.innerHTML = "[Table]";
					oSpan.onclick = table_doShowNestedTable;
					oSpan.className = "linkCell";

					if (oTR.defaultColumn == null)
						oTR.defaultColumn = oTD;

				} else if (oColumn.typeName == "aqds:graph") {
				
					oSpan.innerHTML = "[Table]";
					oSpan.onclick = table_doShowNestedGraph;
					oSpan.className = "linkCell";

					if (oTR.defaultColumn == null)
						oTR.defaultColumn = oTD;

				} else if (oColumn.typeName == "aqds:diagram") {
				
					oSpan.innerHTML = "[Table]";
					oSpan.onclick = table_doShowNestedDiagram;
					oSpan.className = "linkCell";

					if (oTR.defaultColumn == null)
						oTR.defaultColumn = oTD;

				} else if (oColumn.typeName == "aqds:text") {

					if (nodeValue != "")
					{
						oSpan.innerHTML = "[Memo]";
						oSpan.onclick = table_doShowNestedText;
						oSpan.className = "linkCell";
						oTD.cellValue = nodeValue;

						if (oTR.defaultColumn == null)
						  oTR.defaultColumn = oTD;
					} else {
						oSpan.innerHTML = "[Empty]";
						oSpan.className = "fakeLinkCell";
					}

				} else if (oColumn.typeName == "aqds:hyperlink") {

					if (nodeValue != "") {
						oSpan.innerHTML = nodeValue;
						oSpan.onclick = table_doShowNestedUrl;
						oSpan.className = "linkCell";
						oTD.cellValue = nodeValue; //correctLocation(element.location, nodeValue);

						if (oTR.defaultColumn == null)
						  oTR.defaultColumn = oTD;
					} else {
					
						oSpan.innerHTML = "&nbsp;";
					}

				
				} else {
					if (nodeValue == "") oSpan.innerHTML = "&nbsp;"; else oSpan.innerHTML = 
						"<pre style='margin:0px; padding:2px;'>" + nodeValue.replace(/[&]/g, "&amp;").replace(/[<]/g, "&lt;").replace(/[>]/g, "&gt;") + "</pre>";
					table_AddToFilter(oColumn, nodeValue);
				}
				oTD.column = oColumn;
				oTD.topControl = element;
			}
		}

		element.rowBody.appendChild(oTR);

		// Reading subrows
		if (row_nety)
		{
			element.isTree = true;
			oTR.subRows = table_CreateRows(element, oTR, currentRecordId, level + 1);
			if (oTR.subRows.length == 0)
				hideTreeImage(oTR.m_treeImage);
		}
	}

	return resultRows;
}

function table_OperaForceRedraw(element, opera9too)
{
	// Bug in Opera - incorrect redraw of table rows and invisible scroller

	if (!isOpera) return;
	if (opera9too || isOpera8)
	{
		var tablePane = element.rootDiv.tablePane;
		var delta = 1;
		if (tablePane.scrollLeft > 0) delta = -1;
		tablePane.scrollLeft += delta;
		if (tablePane.scrollLeft > 0)
		{
			tablePane.scrollLeft -= delta;
		}
		else
		{
			tablePane.m_dataTable.width -= 1;
			tablePane.m_dataTable.width += 1;
		}
	}
}

function table_setActiveRow(element, newRow, doClear)
{
	if (element.m_activeRow != null)
	{
		element.m_activeRow.className = "";
		element.m_activeRow.style.backgroundColor = element.m_activeRow.m_bgColor;
	}

	if (doClear && element.m_NestedObject != null)
	{
		element.detailsDiv.innerHTML = "";
		element.m_NestedObject = null;
	}

	if (element.detailsDiv)
		element.detailsDiv.style.overflow = "";

	element.m_activeRow = newRow;

	if (element.m_activeRow != null)
	{
		element.m_activeRow.style.backgroundColor = "";
		element.m_activeRow.className = "selectedRow";
		table_OperaForceRedraw(element, false);
	}
}

function table_doShowNestedTable()
{
	var _status = window.status;
	window.status = "Loading...";

	var oTD = this.parentNode;
	oTD.topControl.preventDefault = true;
	table_setActiveRow(oTD.topControl, oTD.parentNode, true);

	var m_NestedObject = window.document.createElement("DIV");
	//m_NestedObject.className = "aqds_table";
	oTD.topControl.detailsDiv.appendChild(m_NestedObject);

	m_NestedObject.style.width = "100%";
	m_NestedObject.style.height = "100%";
	m_NestedObject.table = oTD.column;
	m_NestedObject.table.topRecord = oTD.recordID;
	m_NestedObject.location = oTD.topControl.location;
	m_NestedObject.showCaption = true;

	oTD.topControl.m_NestedObject = m_NestedObject;

	table_setActive(m_NestedObject);

	window.status = _status;
}

function table_doShowNestedGraph(recordId)
{
	var _status = window.status;
	window.status = "Loading...";

	var oTD = this.parentNode;
	table_setActiveRow(oTD.topControl, oTD.parentNode, true);
	
	var m_NestedObject = window.document.createElement("DIV");
	m_NestedObject.className = "aqds_graph";
	oTD.topControl.detailsDiv.appendChild(m_NestedObject);

	m_NestedObject.style.width = "100%";
	m_NestedObject.style.height = "100%";
	m_NestedObject.table = oTD.column;
	m_NestedObject.table.topRecord = oTD.recordID;
	m_NestedObject.location = oTD.topControl.location;

	oTD.topControl.m_NestedObject = m_NestedObject;

	graph_setActive(m_NestedObject, oTD.topControl);

	window.status = _status;
}

function table_doShowNestedDiagram(recordId)
{
	var _status = window.status;
	window.status = "Loading...";

	var oTD = this.parentNode;
	table_setActiveRow(oTD.topControl, oTD.parentNode, true);
	
	var m_NestedObject = window.document.createElement("DIV");
	m_NestedObject.className = "aqds_diagram";
	oTD.topControl.detailsDiv.appendChild(m_NestedObject);

	m_NestedObject.style.width = "100%";
	m_NestedObject.style.height = "100%";
	m_NestedObject.table = oTD.column;
	m_NestedObject.table.topRecord = oTD.recordID;
	m_NestedObject.location = oTD.topControl.location;

	oTD.topControl.m_NestedObject = m_NestedObject;

	diagram_setActive(m_NestedObject, oTD.topControl);

	window.status = _status;
}

function table_doShowNestedText(recordId)
{
	var oTD = this.parentNode;
	oTD.topControl.preventDefault = true;
	table_setActiveRow(oTD.topControl, oTD.parentNode, true);
	
	var m_NestedObject = window.document.createElement("DIV");

	m_NestedObject.style.width = "100%";
	m_NestedObject.style.height = "100%"; 
	m_NestedObject.className = "aqds_text";
	oTD.topControl.detailsDiv.appendChild(m_NestedObject);

	m_NestedObject.value = oTD.cellValue;
	text_load(m_NestedObject);

	oTD.topControl.m_NestedObject = m_NestedObject;
}

function table_doShowLink(MHT_XML, location, url)
{
	if (MHT_XML)
	{
		var _xml = _load_XML(url);
		if (!_xml)
		{
			alert('Unable to load XML file');
			return;
		}

		var _xsl = _load_XML(changeFileExt(url, "xsl"));
		if (!_xsl)
		{
			// try to find xsl link in the loaded xml file
			for (var i = 0; i < _xml.childNodes.length; i++)
			{
				if (_xml.childNodes[i].nodeName.toLowerCase() != "xml-stylesheet") continue;
				var value = _xml.childNodes[i].nodeValue;
				var pos = value.indexOf(".xsl");
				if (pos < 0) continue;
				value = value.substring(0, pos + 4);
				var xslUrl = correctLocation(location, value.substring(value.lastIndexOf("\"") + 1));
				_xsl = _load_XML(xslUrl);
			}
		}

		if (!_xsl) // show xml as plain text
		{
			var text = "" + _xml.xml;
			var re = /</g;
			text = text.replace(re, "&lt;");
			var re = />/g;
			text = text.replace(re, "&gt;");
			document.write("<html><body><pre>" + text + "</pre></body></html>");
		}
		else // transform xml using xsl
		{
			var text = _xml.transformNode(_xsl);
			document.write(text);
			text = "" + document.body.onload;
			var pos = text.indexOf("{");
			if (pos > 0)
			{
				text = text.substring(pos + 1, text.indexOf("}"));
				eval(text);
			}
		}
	}
	else
	{
		window.open(url, "_blank", "status=yes,toolbar=no,menubar=no,location=no,scrollbars=yes");
		return;
	}
}

function table_hideLinkPopup(btn)
{
	var parent = btn.offsetParent.offsetParent.offsetParent.parentNode;
	parent.removeChild(parent.popupDiv);
	if (isIE) parent.removeChild(parent.popupIFrame);
}

function table_showLinkPopup(oTD, MHT_XML, correction) // Open link in the new window
{
	var div = oTD.topControl.m_NestedObject;
	if (!div) div = oTD.topControl;
	var div2 = window.document.createElement("DIV");
	div2.className = "singleFrame";
	div2.style.position = "absolute";
	div2.style.left = (getScreenX(div) - (isIE ? 2 : 1)) + "px";
	div2.style.top  = (getScreenY(div) - (isIE ? 2 : 0)) + "px";
	div2.style.zIndex = 1000;
	div2.style.padding = "3px";
	div2.style.height = "21px";
	div2.style.width = div.offsetWidth + 2 + "px"; //  + (isIE ? 0 : correction)
	div2.style.backgroundColor = "#FFFFE0";
	var html = "<TABLE cellpadding=0 cellspacing=0 width='100%'><TR><TD>&nbsp;<A href='javascript:table_doShowLink(" + MHT_XML + ", \"" +
		oTD.topControl.location.replace(/\\/g, "\\\\") + "\", \"" + oTD.cellValue.replace(/\\/g, "\\\\") + "\")'>Open link in " + (MHT_XML ? "the main" : "a new") + " window</A></TD>" +
		(!MHT_XML ? "<TD width=13><INPUT type='image' width=13 height=13 src='close.gif' title='Hide' onclick='table_hideLinkPopup(this)' " +
			"onmouseover='this.src=\"close1.gif\"' onmouseout='this.src=\"close.gif\"'></TD>" : "") + "</TR></TABLE>";
	div2.innerHTML = html;
	div.appendChild(div2);
	div.popupDiv = div2;

	if (isIE)
	{
		var iframe2 = window.document.createElement("IFRAME");
		iframe2.style.position = "absolute";
		iframe2.style.left = div2.style.left;
		iframe2.style.top  = div2.style.top;
		iframe2.style.height = "22px";
		iframe2.style.width = div2.style.width;
		iframe2.style.zIndex = 999;
		iframe2.frameBorder = 0;
		iframe2.scrolling = "no";
		div.appendChild(iframe2);
		div.popupIFrame = iframe2;
	}
}

function table_doShowNestedUrl(recordId)
{
	var oTD = this.parentNode;
	oTD.topControl.preventDefault = true;
	table_setActiveRow(oTD.topControl, oTD.parentNode, true);

	var url = oTD.cellValue;
	var loc = window.document.location.href;
	var MHT_XML = (url.indexOf(".xml") == url.length - 4) && (loc.indexOf(".mht") == loc.length - 4);

	var iframe = window.document.createElement("IFRAME");
	iframe.frameBorder = 0;
	iframe.width = "100%";
	iframe.height = "100%";
	iframe.style.zIndex = 100;
	iframe.src = MHT_XML ? "about:blank" : url;

	var div = window.document.createElement("DIV");
//	div.className = "singleFrame";
	div.style.width = "100%";
	div.style.height = "100%";
	div.appendChild(iframe);

	oTD.topControl.detailsDiv.appendChild(div);
	oTD.topControl.m_NestedObject = div;

	table_showLinkPopup(oTD, MHT_XML, 0);
}

function table_doShowNestedPicture(recordId)
{
	var oTD = this.parentNode;
	oTD.topControl.preventDefault = true;
	table_setActiveRow(oTD.topControl, oTD.parentNode, true);
	
	var m_NestedObject = window.document.createElement("DIV");
	m_NestedObject.className = "aqds_picture";
	oTD.topControl.detailsDiv.appendChild(m_NestedObject);

	m_NestedObject.style.width = "100%";
	m_NestedObject.style.height = "100%";
	m_NestedObject.value = oTD.cellValue;
	picture_load(m_NestedObject);

	oTD.topControl.m_NestedObject = m_NestedObject;

	table_showLinkPopup(oTD, false, 2);
}

function table_doDefaultNestedData()
{
	if (this.tableElement.preventDefault)
	{
		this.tableElement.preventDefault = false;
		return;
	}

	var oTD = this.defaultColumn;

	if (oTD != null && oTD.firstChild != null) {

		oTD.firstChild.click();
		this.tableElement.preventDefault = false;

	} else {

		var m_NestedObject = this.tableElement.m_NestedObject;

		if (m_NestedObject != null) 
		{
			m_NestedObject.parentNode.innerHTML = "";
			this.tableElement.m_NestedObject = null;
		}
	}

	table_setActiveRow(this.tableElement, this, false);
}

function table_checkHeaderWidth(oTablePane)
{
	var _delta = c_InnerPadding - 1;
	if ((oTablePane.clientHeight - 6) < oTablePane.m_dataTable.offsetHeight)
		_delta += 18;
	oTablePane.linkedDiv.style.width = oTablePane.offsetWidth - _delta;
}

function table_doTablePaneScroll()
{
	if (this.linkedDiv != null)
	{
		this.linkedDiv.scrollLeft = this.scrollLeft;
	}
	if (this.m_filterDiv != null)
	{
		caption_setFilterPosition(this.m_filterDiv, this);
	}
}

function table_expandRow()
{
	roloverTreeImage(this);
	this.parentTD.parentNode.opened = this.opened;
	table_showSubRows(this.parentTD.parentNode, this.opened);
	table_resizeCaptions(this.parentTD.topControl);
	table_checkHeaderWidth(this.parentTD.topControl.rootDiv.tablePane);
}

function table_showSubRows(row, value)
{
	var element = row.tableElement;

	if (row.subRows != null)
	{
		var _value = value;
		if (value && !row.opened && row.mustBeVisible) _value = false; // do not open closed subrows
		for (var i = 0; i < row.subRows.length; i++)
		{
			var isFolder = row.subRows[i].subRows != null && table_isSubRowsFiltered(row.subRows[i]) == false;
			row.subRows[i].style.display = (_value && row.subRows[i].mustBeVisible) ? "": "none";
			table_showSubRows(row.subRows[i], _value);
		}
	}
}

function table_resizeCaptions(element)
{
	for (var i = 0; i < element.m_Captions.length; i++)
		element.m_Captions[i].style.width = element.m_Captions[i].realTD.offsetWidth;
}

// ------------------------------ SORTING ------------------------------

var m_SortColumnId;

function table_sort(oTable)
{
	var _prevColumnId = m_SortColumnId;
	m_SortColumnId = oTable.m_sortColumnId;

	if (oTable.rows.length < 3 || m_SortColumnId < 0) return;

	var _sortColumn = oTable.rows[0].cells[m_SortColumnId].column;
	var _dataType = _sortColumn.typeName;

	var _sortFunction = table_sort_caseinsensitive;
	if (_dataType == "aqds:image") _sortFunction = table_sort_image;
	if (_dataType == "aqds:int" || _dataType == "aqds:float") _sortFunction = table_sort_numeric;

	var sortRows = new Array();
	for (var i = 1; i < oTable.rows.length; i++)
		sortRows[i - 1] = oTable.rows[i];

	if (_sortColumn.filterList.length > 1)
	{
		if (oTable.m_sortAscending) sortRows.reverse();
		sortRows.sort(_sortFunction);
		if (!oTable.m_sortAscending) sortRows.reverse();
	}
	else
	{
		if (_prevColumnId == m_SortColumnId) sortRows.reverse();
	}

	for (var i = 0; i < sortRows.length; i++) 
	{
		if (!sortRows[i].parentRow)
		{
			oTable.tBodies[0].appendChild(sortRows[i]);
			add_subRows(oTable, sortRows[i], sortRows);
		}
	}
}

function add_subRows(oTable, oRow, sortRows)
{
	if (!oRow.subRows) return;

	for (var i = 0; i < sortRows.length; i++)
	{
		for (var j = 0; j < oRow.subRows.length; j++)
			if (oRow.subRows[j] == sortRows[i])
			{
				oTable.tBodies[0].appendChild(oRow.subRows[j]);
				add_subRows(oTable, oRow.subRows[j], sortRows);
				break;
			}
	}
}

function check_image(cell)
{
	var item = null;
	var child = cell.getElementsByTagName("SPAN");
	if (child.length == 0) return item;

	child = child[0].getElementsByTagName("IMG");
	if (child.length == 0) return item;

	item = child[0].src;
	return item;
}

function table_sort_image(a, b)
{
	aa = check_image(a.cells[m_SortColumnId]); if (!aa) aa = "";
	bb = check_image(b.cells[m_SortColumnId]); if (!bb) bb = "";

	if (aa == bb) return 0;
	if (aa < bb) return -1;
	return 1;
}

function table_sort_numeric(a, b) 
{ 
	var str = a.cells[m_SortColumnId].innerText;
	var aa = parseFloat(str.replace(",", "."));
	if (isNaN(aa)) aa = 0;

	str = b.cells[m_SortColumnId].innerText;
	var bb = parseFloat(str.replace(",", "."));
	if (isNaN(bb)) bb = 0;

	return aa - bb;
}

function table_textCompare(a, b)
{
	if (a == b) return 0;
	if (a < b) return -1;
	return 1;
}

function table_sort_caseinsensitive(a, b) 
{
	var aa = a.cells[m_SortColumnId].innerText.toLowerCase();
	var bb = b.cells[m_SortColumnId].innerText.toLowerCase();

	return table_textCompare(aa, bb);
}

function table_sort_default(a, b) 
{
	aa = a.cells[m_SortColumnId].innerText;
	bb = b.cells[m_SortColumnId].innerText;

	return table_textCompare(aa, bb);
}

// ------------------------------ FILTERING ------------------------------

function table_isSubRowsFiltered(oRow)
{
	var _filtered = true;
	for (var i = 0; i < oRow.subRows.length; i++)
	{
		var oSubRow = oRow.subRows[i];
		if (oSubRow.subRows)
			_filtered = table_isSubRowsFiltered(oSubRow);
		if (oSubRow.mustBeVisible) _filtered = false;
	}
	return _filtered;
}

function table_filterCompare(a, b, columnTypeName)
{
	var aa; var bb;
	if (columnTypeName == "aqds:float")
	{
		aa = parseFloat(a.replace(",", "."));
		bb = parseFloat(b.replace(",", "."));
	}
	else
	{
		aa = a.toLowerCase();
		bb = b.toLowerCase();
	}
	return table_textCompare(aa, bb);
}

function options_click()
{
	table_updateFilter(this.m_dataTable);
}

function filter_remove()
{
	var columns = this.element.table.columns;
	for (var i = 0; i < columns.length; i++)
	{
		var oc = columns[i];
		if (!oc.filtered) continue;

		for (var j = 0; j < oc.filterList.length; j++)
			oc.filterList[j].checked = true;

		oc.filtered = false;
		oc.m_caption.m_captionDiv.style.fontWeight = "";
	}
	table_updateFilter(this.element.rootDiv.tablePane.m_dataTable);
	caption_hideFilter(m_providercell.m_filteredColumn);
}

function table_showFilterOptions(element, show)
{
	if (element.rootDiv.filterOptionsDiv != null)
	{
		if (!show)
		{
			element.filter_showParents = null;
			element.filter_showChildren = null;
			element.rootDiv.removeChild(element.rootDiv.filterOptionsDiv);
			element.rootDiv.filterOptionsDiv = null;

			element.rootDiv.tablePane.style.height = element.rootDiv.tablePane.offsetHeight + 21;
		}
		return;
	}

	if (show)
	{
		var oTable = document.createElement("TABLE");
		element.rootDiv.appendChild(oTable);
		oTable.width = "100%";
		oTable.height = 20;
		oTable.cellPadding = 0;
		oTable.cellSpacing = 0;
		oTable.className = "singleFrame";
		oTable.style.borderTopWidth = 0;
		oTable.style.backgroundColor = "#EEEEEE";

		var oBody = document.createElement("TBODY");
		oTable.appendChild(oBody);
		var oTR = document.createElement("TR");
		oBody.appendChild(oTR);

		// close button
		var oTD = document.createElement("TD");
		oTR.appendChild(oTD);
		oTD.width = 20;
		oTD.height = 20;
		oTD.align = "right";
		var oBtn = document.createElement("INPUT");
		oBtn.type = "image";
		oBtn.src = "close.gif";
		oBtn.title = "Remove filter";
		oBtn.onmouseover = function () { this.src = 'close1.gif'; }
		oBtn.onmouseout = function () { this.src = 'close.gif'; }
		oBtn.element = element;
		oBtn.onclick = filter_remove;
		oTD.appendChild(oBtn);

		oTD = document.createElement("TD");
		oTD.style.textIndent = 5;
		oTD.innerHTML = "Filter is active";
		oTR.appendChild(oTD);

		if (element.isTree) // "show parents" and "show children" checkboxes
		{
			var oTD = document.createElement("TD");
			oTR.appendChild(oTD);
			oTD.width = 20;
			var oCB1 = document.createElement("INPUT");
			oCB1.type = "checkbox";
			oCB1.m_dataTable = element.rootDiv.tablePane.m_dataTable;
			oCB1.onclick = options_click;
			oTD.appendChild(oCB1);
			element.filter_showParents = oCB1;

			oTD = document.createElement("TD");
			oTD.width = 80;
			oTD.innerHTML = "show parents";
			oTR.appendChild(oTD);

			oTD = document.createElement("TD");
			oTR.appendChild(oTD);
			oTD.width = 20;
			var oCB2 = document.createElement("INPUT");
			oCB2.type = "checkbox";
			oCB2.m_dataTable = element.rootDiv.tablePane.m_dataTable;
			oCB2.onclick = options_click;
			oTD.appendChild(oCB2);
			element.filter_showChildren = oCB2;

			oTD = document.createElement("TD");
			oTD.width = 80;
			oTD.innerHTML = "show children";
			oTR.appendChild(oTD);
		}
		
		element.rootDiv.tablePane.style.height = element.rootDiv.tablePane.offsetHeight - 21;

		element.rootDiv.filterOptionsDiv = oTable;
	}
}

function table_updateFilter(oTable)
{
	var _table_filtered = false;

	var element = oTable.parentNode.tableElement;
	var showParents = element.filter_showParents != null && element.filter_showParents.checked;
	var showChildren = element.filter_showChildren != null && element.filter_showChildren.checked;

	// Filter data
	for (var i = 1; i < oTable.rows.length; i++)
	{
		var _visible = true;
		var oRow = oTable.rows[i];
		for (var j = 0; j < oRow.cells.length; j++)
		{
			var oCell = oRow.cells[j];
			if (!oCell.column.filtered) continue;

			// Checked value

			var _value = oCell.innerText;
			if (_value == "")
			{
				var _children = oCell.childNodes;
				for (var ch = 0; ch < _children.length; ch++)
					if (_children[ch].nodeName.toLowerCase() == "span")
					{
						_value = _children[ch].innerHTML;
						break;
					}
			}
			if (_value == "" || _value == " " || _value == _nbsp)
				_value = "&lt;Empty&gt;";

			// Searching for value in filter list

			var step = Math.round(oCell.column.filterList.length / 2);
			var k = step - 1;
			var zz = 2; var zz2 = 2; // Max iterations
			while (zz2 < oCell.column.filterList.length) { zz ++; zz2 *= 2; }

			while (true)
			{
				var _filter = oCell.column.filterList[k].value.trim();

				var _compare = table_filterCompare(_value, _filter, oCell.column.typeName);
				if (_compare == 0)
				{
					_visible = _visible && oCell.column.filterList[k].checked;
					break;
				}
				else
				{
					zz --; if (zz < 0) break;
					step = Math.round(step / 2);
					k += step * _compare;
					if (k < 0) k = 0;
					if (k >= oCell.column.filterList.length) k = oCell.column.filterList.length - 1;
				}
			}

			if (!_visible) break;
		}

		oRow.filtered = !_visible;
		oRow.mustBeVisible = _visible;
		oRow.style.display = _visible ? "" : "none";

		if (!_table_filtered) _table_filtered = oRow.filtered;
	}

	if (showParents)
		for (var i = 1; i < oTable.rows.length; i++)
		{
			var oRow = oTable.rows[i];
			if (oRow.subRows != null)
			{
				var subrows_filtered = table_isSubRowsFiltered(oRow);
				if (!subrows_filtered && oRow.filtered)
				{
					oRow.style.display = "";
					oRow.mustBeVisible = true;
				}
			}
		}

	if (showChildren)
		for (var i = 1; i < oTable.rows.length; i++)
		{
			var oRow = oTable.rows[i];
			var oParent = oRow.parentRow;
			while (oParent)
			{
				if (oParent && !oParent.filtered)
				{
					oRow.style.display = "";
					oRow.mustBeVisible = true;
					break;
				}
				oParent = oParent.parentRow;
			}
		}

	// Checking tree images & updating textIndent
	for (var i = 0; i < oTable.rows.length; i++)
	{
		var oRow = oTable.rows[i];
		if (!oRow.mustBeVisible) continue;

		if (oRow.subRows != null)
		{
			var subrows_filtered = table_isSubRowsFiltered(oRow);
			if (subrows_filtered)
				hideTreeImage(oRow.m_treeImage);
			else
			{
				if (oRow.filtered) { oRow.opened = true; oRow.m_treeImage.opened = true; }
				showTreeImage(oRow.m_treeImage);
			}
		}

		var _visibleLevels = 0;
		var oParentRow = oRow.parentRow;
		while (oParentRow != null)
		{
			if (oParentRow.mustBeVisible)
			{
				_visibleLevels++;
				if (!oParentRow.opened) oRow.style.display = "none";
			}
			oParentRow = oParentRow.parentRow;
		}
		oRow.childNodes[0].style.paddingLeft = 5 + _visibleLevels * 16;
	}

	// Checking if active row was filtered
	var aRow = oTable.parentNode.tableElement.m_activeRow;
	if (aRow == null || !aRow.mustBeVisible)
	{
		table_setActiveRow(oRow.tableElement, null, true);
		for (var j = 1; j < oTable.rows.length; j++)
		{
			if (!oTable.rows[j].filtered && oTable.rows[j].mustBeVisible)
			{
				table_setActiveRow(oRow.tableElement, oTable.rows[j], true);
				oTable.rows[j].click();
				break;
			}
		}
	}

	element.filtered = _table_filtered;
	table_showFilterOptions(element, _table_filtered);
	table_resizeCaptions(element);
	table_checkHeaderWidth(element.rootDiv.tablePane);
}

function table_filterStringSort(a, b)
{
	var aa = a.value.toLowerCase();
	var bb = b.value.toLowerCase();
	return table_textCompare(aa, bb);
}

function table_filterIntegerSort(a, b)
{
	var aa = parseFloat(a.value);
	var bb = parseFloat(b.value);
	return table_textCompare(aa, bb);
}

function table_updateFilterState(columns)
{
	// sorting columns filter lists & enabling filter if necessary
	for (var i = 0; i < columns.length; i++)
	{
		if (columns[i].filterList.length > 1)
		{
			if (columns[i].typeName == "aqds:int" || columns[i].typeName == "aqds:float")
				columns[i].filterList.sort(table_filterIntegerSort);
			else
				columns[i].filterList.sort(table_filterStringSort);

			caption_enableFilter(columns[i].m_caption);
		}
	}
}

var table_js = true;