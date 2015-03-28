var m_objProviderXml = null;
var m_objProviderSchema = null;

function ProviderLoad(element, flag)
{
	if (element.m_rootElement != null)
	{
	if (!flag && isIE5) { window.setTimeout("ProviderLoad(m_provider, true)", 100); return; }
		element.removeChild(element.m_rootElement);
		element.m_rootElement = null;
	}

	element.m_rootElement = window.document.createElement("TABLE");
	element.m_rootElement.className = "singleFrame";
	element.m_rootElement.cellSpacing = 0;
	element.m_rootElement.cellPadding = 0;
	element.m_rootElement.border = 0;
	element.m_rootElement.style.width = element.style.width;
	element.m_rootElement.style.height = element.style.height;
	
	var oBody = window.document.createElement("TBODY");
	element.m_rootElement.appendChild(oBody);
	
	var oTR = window.document.createElement("TR");
	oBody.appendChild(oTR);
	
	var oTD = window.document.createElement("TD");
	oTD.vAlign = "top";
	oTR.appendChild(oTD);
	
	var oDiv = window.document.createElement("DIV");
	oDiv.style.padding = 3;
	oTD.appendChild(oDiv);
	
	var oI = window.document.createElement("I");
	oI.innerText = "Loading...";
	oDiv.appendChild(oI);

	element.appendChild(element.m_rootElement);

	m_objProviderXml = _load_XML(element.src);
	if (m_objProviderXml != null)
	{
		var xmlns = changeFileExt(element.src, "xsd");
		m_objProviderSchema = _load_XML(xmlns);

		if (m_objProviderSchema != null)
			ProviderSchemaLoaded(element);
	}

	if (element.realSchemaType == "aqds:text")
		element.schemas = new Array("aqds:text");
	else
		element.schemas = new Array("aqds:tree", "aqds:table");
}

function provider_GetInnerObjectClass(element, obj)
{
	if (element.realSchemaType == "aqds:table" || element.realSchemaType == "aqds:tree") 
	{
		obj.showCaption = true;
		table_setActive(obj);
		return "aqds_table";
	} 
	else if (element.realSchemaType == "aqds:graph") 
	{
		obj.showCaption = false;
		graph_setActive(obj);
		return "aqds_graph";
	} 
	else if (element.realSchemaType == "aqds:diagram") 
	{
		obj.showCaption = false;
		diagram_setActive(obj);
		return "aqds_diagram";
	} 
	else if (element.realSchemaType == "aqds:text") 
	{
		text_load(obj);
		return "aqds_text";
	} 
	else 
	{
		return "";
	}
}

function ProviderSchemaLoaded(element)
{
	if (element.m_rootElement != null)
	{
		element.removeChild(element.m_rootElement);
		element.m_rootElement = null;
	}

	if (m_objProviderSchema.documentElement == null) 
		return;

	var rootElements = _select_Nodes(m_objProviderSchema.documentElement, "xs:element");
	if (rootElements.length > 0)
	{
		var objRoot = rootElements[0];
		var oTable = window.document.createElement("DIV");
		oTable.location = element.src;
		oTable.id = "provider_div2";

		oTable.style.width = element.style.width;
		oTable.style.height = element.style.height;

		element.appendChild(oTable);

		if (element.realSchemaType == "aqds:text")
		{
			var oRootText = new TextObject(m_objProviderXml, null, objRoot);
			oTable.textObject = oRootText;
		}
		else
		{
			var oRootTable = new TableObject(m_objProviderXml, null, objRoot);
			oTable.table = oRootTable;
		}

		provider_GetInnerObjectClass(element, oTable);

		element.m_rootElement = oTable;

	}
}

var provider_js = true;