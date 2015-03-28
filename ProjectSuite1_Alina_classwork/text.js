function text_load(element)
{
	element.schemas = new Array("aqds:text", "aqds:xml");

	element.m_rootdiv = null;

	element.m_rootTable = window.document.createElement("TABLE");
	if (element.detailsHead == null)
		element.m_rootTable.className = "singleFrame";
	element.m_rootTable.cellSpacing = 0;
	element.m_rootTable.cellPadding = 0;
	element.m_rootTable.border = 0;

	element.m_rootTable.style.width = "100%";
	element.m_rootTable.style.height = "100%";

	element.appendChild(element.m_rootTable);
	
	var oBody = window.document.createElement("TBODY");
	element.m_rootTable.appendChild(oBody);
	
	var oTR = window.document.createElement("TR");
	oBody.appendChild(oTR);
	
	element.m_rootTD = window.document.createElement("TD");
	element.m_rootTD.vAlign = "top";
	oTR.appendChild(element.m_rootTD);

	element.doResize = function(_Width, _Height)
	{
		if (element.detailsHead == null) { _Width -= 2; _Height -= 2; }
		if (element.location == null) { /*_Width -= 2; _Height -= 2;*/ }
		else { element.m_rootTD.firstChild.height = _Height - 2; }

		if (element.popupDiv != null)
		{
			var left = (getScreenX(element) - (isIE ? 2 : 1)) + "px";
			element.popupDiv.style.left = left;
			element.popupDiv.style.width = _Width + 2;
			if (element.popupIFrame != null)
			{
				element.popupIFrame.style.left = left;
				element.popupIFrame.style.width = _Width + 2;
			}
		}

		if (this.m_rootdiv)
		{
			this.m_rootdiv.style.width = _Width;
			this.m_rootdiv.style.height = _Height;
		}
		this.m_rootTable.style.width = _Width;
		this.m_rootTable.style.height = _Height;

		this.style.width = _Width;
		this.style.height = _Height;
	}

	var _Width = element.offsetWidth;
	var _Height = element.offsetHeight;

	text_Load(element);

	element.doResize(_Width, _Height);
}

function text_createRootDiv(element)
{
	if (element.m_rootdiv == null)
	{	
		element.m_rootdiv = window.document.createElement("DIV");
		element.m_rootdiv.style.padding = 3;
		element.m_rootdiv.style.overflow = "scroll";
		element.m_rootTD.appendChild(element.m_rootdiv);
	}
}

function text_Load(element)
{
	if (element.src != null || element.location != null) 
	{
		element.value = null;

		var m_Xml = _load_XML(element.src || element.location);
		if (m_Xml) element.value = _get_Text(m_Xml.documentElement);
	}

	if (element.value != null) 
	{
		text_createRootDiv(element);
		element.m_rootdiv.innerHTML = "";

		var textFormat = 0;
		if (element.textObject != null)
			textFormat = element.textObject.textFormat;

		if (textFormat == 0 || textFormat == 3)
			element.m_rootdiv.innerText = element.value;
		else
		{
			var p = element.location.lastIndexOf("\\");
			if (p > 0) element.value = element.location.substring(0, p + 1) + element.value;
			var url = element.value;
			var loc = "";
			try { loc = window.document.location.href; } catch (e) { }
			var MHT_XML = (url.indexOf(".xml") == url.length - 4) && (loc.indexOf(".mht") == loc.length - 4);
			if (MHT_XML)
			{
				element.m_rootdiv.cellValue = url;
				element.m_rootdiv.topControl = element;
				table_showLinkPopup(element.m_rootdiv, MHT_XML, 0);
			}
			else
				element.m_rootTD.innerHTML = "<iframe width='100%' height='100%' frameborder='0' src='" + url + "'/>";
		}
	}
}

var text_js = true;