var m_provider = null;
var m_treecell = null;
var m_providercell = null;
var m_RootLogData = null;
var m_rootnode = null;
var m_treediv = null;
var m_activenode = null;
var m_selectednode = null;
var m_treehead = null;
var m_treehead2 = null;
var m_treehidden = false;
var treeHeadHeight = 20;
var treeHeadWidth = 21;

function logtree_loadComponent(element, src)
{
	var cWidth = document.body.clientWidth - c_InnerPadding * 2;
	var cHeight = document.body.clientHeight - c_InnerPadding * 2;

	element.type = "container";

	element.style.width = cWidth;
	element.style.height = cHeight;

	var oTable = document.createElement("TABLE");
	element.appendChild(oTable);
	element.rootTable = oTable;

	oTable.cellPadding = 0;
	oTable.cellSpacing = 0;
	oTable.border = 0;
	oTable.style.width = cWidth;
	oTable.style.height = cHeight;

	var oBody = document.createElement("TBODY");
	oTable.appendChild(oBody);
	
	var oTR = document.createElement("TR");
	oBody.appendChild(oTR);

	m_treecell = document.createElement("TD");
	m_treecell.style.width = Math.round(cWidth * 0.25) - 1;
	m_treecell.vAlign = "top";
	m_treecell.noWrap = true;
	oTR.appendChild(m_treecell);
	
	m_treehead = document.createElement("DIV");
	m_treehead.className = "singleFrame";
	m_treehead.style.width = Math.round(cWidth * 0.25) - 1;
	m_treehead.style.height = (treeHeadHeight + (isIE ? -2 : 0)) + "px";
	m_treehead.style.borderBottom = "0px";
	m_treehead.id = "treehead";
	m_treecell.appendChild(m_treehead);
	
	m_treehead.innerHTML = "<div class='cellCaption'><div style='float:left'>Log Tree</div>" +
	  "<img src='hide.gif' onmousemove='this.src=\"hide1.gif\"' onmouseout='this.src=\"hide.gif\"' " +
	  "style='float:right; margin:1px 3px 3px 1px; cursor:pointer;' " +
	  "onclick='treeHeadBtnClick()' alt='Hide'></div>";
	
	m_treehead2 = document.createElement("DIV");
	m_treehead2.className = "singleFrame";
	m_treehead2.style.display = "none";
	m_treehead2.style.width = treeHeadWidth;
	m_treehead2.style.height = element.offsetHeight;
	m_treehead2.id = "treehead2";
	m_treecell.appendChild(m_treehead2);
	
	m_treehead2.innerHTML = "<img src='show.gif' onmousemove='this.src=\"show1.gif\"' " +
	  "onmouseout='this.src=\"show.gif\"' style='margin:3px; cursor:pointer;' " +
	  "onclick='treeHeadBtnClick()' alt='Show'>" +
	  "<br><img src='logtree.gif' style='margin:3px;'>";
	
	m_treediv = document.createElement("DIV");
	m_treediv.className = "singleFrame";
	m_treediv.style.width = Math.round(cWidth * 0.25) - 1;
	m_treediv.style.height = element.offsetHeight - treeHeadHeight;
	m_treediv.style.borderTop = "0px";
	m_treediv.style.position = "absolute";
	m_treediv.style.left = "5px";
	m_treediv.style.top = "25px";
	m_treediv.id = "logtree";

	m_treediv.style.padding = 3;
	m_treediv.style.overflow = "auto";
	m_treecell.appendChild(m_treediv);

	var oTD = document.createElement("TD");
	oTD.style.width = 5;
	oTD.noWrap = true;
	oTR.appendChild(oTD);
	
	m_providercell = document.createElement("TD");
	m_providercell.vAlign = "top";
	m_providercell.style.width = cWidth - Math.round(cWidth * 0.25) - 5;
	oTR.appendChild(m_providercell);

	element.doResize = function()
	{
		var cWidth = document.body.clientWidth - c_InnerPadding * 2;
		var cHeight = document.body.clientHeight - c_InnerPadding * 2;

		if (cHeight < 300) cHeight = 300;
		if (cWidth < 500) cWidth = 500;

		var tree_Width = m_treehidden ? treeHeadWidth : (Math.round(cWidth * 0.25) - 1);
		var prov_Width = cWidth - tree_Width - 5;

		if (m_provider.m_rootElement.doResize)
			m_provider.m_rootElement.doResize(prov_Width, cHeight);

		m_providercell.style.width = prov_Width;

		m_treecell.style.width = tree_Width;

		if (!m_treehidden)
		{
			m_treehead.style.width = tree_Width;
			m_treediv.style.width = tree_Width;
			m_treediv.style.height = cHeight - treeHeadHeight;
		}
		else
			m_treehead2.style.height = cHeight;

		this.style.width = cWidth;
		this.style.height = cHeight;

		this.rootTable.style.width = cWidth;
		this.rootTable.style.height = cHeight;

		var _obj = m_provider.m_rootElement;
		while (_obj != null)
		{
			if (_obj.m_dataTable) // Graph
				_obj = _obj.m_dataTable;

			if (_obj.rootDiv)
				table_UpdateColumnsPosition(_obj);

			_obj = _obj.m_NestedObject;
		}

	}

	logtree_TreeLoad(src);

	if (isIE5 || isFF) // For IE5 & Firefox: resize to ensure correct log view
	{
		var pointer = element;
		window.setTimeout(function () { pointer.doResize(); }, 100);
	}
}

function treeHeadBtnClick()
{
	m_treehidden = !m_treehidden;
	m_treehead.style.display = m_treehidden ? "none" : "";
	m_treediv.style.display = m_treehidden ? "none" : "";
	m_treehead2.style.display = m_treehidden ? "" : "none";
	document.getElementById("logroot").doResize();
}

function logtree_TreeLoad(src)
{
	m_RootLogData = new LogRootObject(src);
	m_rootnode = logtree_createLogDataNode(m_treediv, m_RootLogData);
	logtree_setActiveNode(m_rootnode);
	logtree_expandNode(m_rootnode, true);
}

function logtree_setSelectedNode(node)
{
	if (m_selectednode != null)
	{
		m_selectednode.caption.style.backgroundColor = "";
		m_selectednode.caption.style.borderColor = "white";
	}
	
	m_selectednode = node;
	if (m_selectednode != null)
	{
		m_selectednode.caption.style.backgroundColor = "";
		m_selectednode.caption.style.borderColor = "#999999";
	}
	
	if (m_activenode != null)
	{
		m_activenode.caption.style.borderColor = "#CCCCCC";
	}
	
}

function logtree_setActiveNode(node)
{
	if (m_activenode != null)
	{
		m_activenode.caption.style.backgroundColor = "";
		m_activenode.caption.style.borderColor = "white";
	}
	
	if (m_selectednode != null)
	{
		m_selectednode.caption.style.backgroundColor = "";
		m_selectednode.caption.style.borderColor = "white";
	}
	m_selectednode = null;
	
	m_activenode = node;
	if (m_activenode != null)
	{
		m_activenode.caption.style.backgroundColor = "#CCCCCC";
		m_activenode.caption.style.borderColor = "#999999";
		
		m_activenode.doActivate();
	}
}

function logtree_expandNode(oDiv, recursive)
{
	if (!oDiv.expanded)
	{
		roloverTreeImage(oDiv.image);
		if (oDiv.childDiv == null)
		{
			var oChildDiv = document.createElement("DIV");
			oChildDiv.style.marginLeft = getScreenX(oDiv.caption) - getScreenX(oDiv.statusImage);
			oChildDiv.style.display = "none";
			oDiv.appendChild(oChildDiv);
			oDiv.childDiv = oChildDiv;
		}

		if (!oDiv.logData.empty) 
		{
			oDiv.childDiv.style.display = "";
//			oDiv.childDiv.style.width = "100%";
		}

		if (oDiv.childrenPrepared == false)
		{
			if (!oDiv.logData.empty)
			{
				logtree_createLogDataTree(oDiv.childDiv, oDiv.logData, true);
			} else {
			
				hideTreeImage(oDiv.image);
				oDiv.image.onclick = null;
			}
			oDiv.childrenPrepared = true;
		}

		oDiv.expanded = !oDiv.expanded;
	}
}

function logtree_expandLogDataNode()
{
	var oDiv = this.ownerDiv; // this - node expand image
	
	roloverTreeImage(oDiv.image);
	if (oDiv.childDiv == null)
	{
		var oChildDiv = document.createElement("DIV");
		oChildDiv.style.marginLeft = getScreenX(oDiv.caption) - getScreenX(oDiv.statusImage);
		oChildDiv.style.display = "none";
		oDiv.appendChild(oChildDiv);
		oDiv.childDiv = oChildDiv;
	}

	if (oDiv.expanded == false)
	{
		if (!oDiv.logData.empty) 
		{
			oDiv.childDiv.style.display = "";
			oDiv.childDiv.style.width = "100%";
		}

		if (oDiv.childrenPrepared == false)
		{
			if (!oDiv.logData.empty)
			{
				logtree_createLogDataTree(oDiv.childDiv, oDiv.logData, false);
			} else {
			
				hideTreeImage(oDiv.image);
				oDiv.image.onclick = null;
			}
			oDiv.childrenPrepared = true;
		}

	} else 
	{
		oDiv.childDiv.style.display = "none";
	}
	oDiv.expanded = !oDiv.expanded;
}

function logtree_activateLogDataNode()
{
	var oDiv = this.ownerDiv; // this - node caption span
	logtree_setActiveNode(oDiv);
}

function logtree_createLogDataNode(parent, logData)
{
	var oDiv = document.createElement("DIV");
	parent.appendChild(oDiv);

	oDiv.childDiv = null;
	oDiv.logData = logData;
	oDiv.expanded = false;
	oDiv.childrenPrepared = false;

	var oNoBr = document.createElement("NOBR");
	oDiv.appendChild(oNoBr);

	var oCaption = document.createElement("SPAN");
	oCaption.className = "treeNodeCaption";
	oCaption.innerText = logData.name;
	oCaption.ownerDiv = oDiv;
	oDiv.caption = oCaption;
	oDiv.caption.onclick = logtree_activateLogDataNode;
	
	oNoBr.appendChild(oCaption);

	oCaption.style.width = oCaption.offsetWidth;

	if (!logData.empty)
	{
		oDiv.image = createTreeImage(false);
		oDiv.image.onclick = logtree_expandLogDataNode;
	} else {
		oDiv.image = createTreeImageDummy();
	}
	oDiv.image.ownerDiv = oDiv;
	oNoBr.insertBefore(oDiv.image, oDiv.caption);

	oDiv.statusImage = createTreeStateImage(logData.status);
	oNoBr.insertBefore(oDiv.statusImage, oDiv.caption);

	oDiv.doActivate = logtree_m_LogDataNode_Activate;
	
	return oDiv;
}

function logtree_m_LogDataNode_Activate()
{
	window.status = "Loading...";
	var logData = this.logData; // this - node div
	if (logData != null)
	{
		if (logData.schemaType == null || logData.schemaType == "" || logData.schemaType == "aqds:none")
		{
			logtree_expandNode(this, false);
			if (logData.children.length > 0) 
			{
				var nextDiv = logData.children[0].treeNode;
				if (nextDiv != null)
				{
					nextDiv.caption.click();
					logtree_setSelectedNode(this);
					return;
				}
			}
			
		}
		logtree_activateProvider(logData);
	}
	window.status = "Done";
}

function logtree_createLogDataTree(parentDiv, logData, createExpanded)
{
	for (var i = 0; i < logData.children.length; i++)
	{
		var oChildDiv = logtree_createLogDataNode(parentDiv, logData.children[i]);
		logData.children[i].treeNode = oChildDiv;
		
		if (createExpanded)
		{
			logtree_expandNode(oChildDiv, createExpanded);
		}
	}

}   

function logtree_loadProvider(node, update)
{
	m_provider.realSchemaType = node.schemaType;
	m_provider.src = node.href;

	if (node.schemaType == "aqds:table" || node.schemaType == "aqds:tree"
	  || node.schemaType == "aqds:graph" || node.schemaType == "aqds:diagram"
	  || node.schemaType == "aqds:text")
	{
		m_provider.className = "aqds_provider";
		ProviderLoad(m_provider);
	}
	else if (node.schemaType == "aqds:picture")
	{
		m_provider.className = "aqds_picture";
	}
	else {
		m_provider.className = "aqds_text";
                if (update)
			text_Load(m_provider);
		else
			text_load(m_provider);
	}
}

function logtree_activateProvider(node)
{
	if (m_provider != null)
	{
		for (var i = 0; i < m_provider.schemas.length; i++)
		{
			if (node.schemaType == m_provider.schemas[i])
			{
				logtree_loadProvider(node, true);
				return;
			}
		}

		m_providercell.removeChild(m_provider);
	}

	m_provider = document.createElement("DIV");
	m_provider.id = "provider_div";

	m_provider.style.width = "100%";
	m_provider.style.height = "100%";

	m_providercell.appendChild(m_provider);

	logtree_loadProvider(node, false);
}

function onDocumentClick(e)
{
	if (e == null) e = window.event;

	var column = m_providercell.m_filteredColumn;
	if (column != null)
	{
		var target = e.target;
		if (target == null)
			target = e.srcElement;

		if (target == column.filterImage) return;

		var filter = column.realTD.m_dataTable.parentNode.m_filterDiv;
		var parent = target;
		while (parent != null)
		{
			if (parent == filter)
				return;
			parent = parent.offsetParent;
		}
		caption_hideFilter(column);
	}
}

if (document.addEventListener)
	document.addEventListener("click", onDocumentClick, true);
else
	document.attachEvent("onclick", onDocumentClick);

function showLog()
{
	var clientWidth = document.body.clientWidth;
	if (clientWidth > 0 && typeof(aqds_js) != 'undefined' && typeof(caption_js) != 'undefined' && typeof(graph_js) != 'undefined' && typeof(logdata_js) != 'undefined' &&
	  typeof(picture_js) != 'undefined' && typeof(provider_js) != 'undefined' && typeof(table_js) != 'undefined' && typeof(text_js) != 'undefined')
		logtree_loadComponent(document.getElementById("logroot"), "root.xml");
	else
		window.setTimeout(showLog, 50);
}

if (isSupported)
	window.setTimeout(showLog, 100);
