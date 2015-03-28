function picture_load(element)
{
	element.schemas = new Array("aqds:image", "aqds:picture");

	if (element.m_rootdiv == null)
	{
		
		var oTable = window.document.createElement("TABLE");
		element.appendChild(oTable);

		if (element.detailsHead == null)
			oTable.className = "singleFrame";
		oTable.cellSpacing = 0;
		oTable.cellPadding = 0;
		oTable.border = 0;

		element.m_rootTable = oTable;

		oTable.style.width = "100%";
		oTable.style.height = "100%";
//		oTable.height = element.parentNode.offsetHeight - c_InnerPadding * 2 - 2;
		
		var oBody = window.document.createElement("TBODY");
		oTable.appendChild(oBody);
		
		var oTR = window.document.createElement("TR");
		oBody.appendChild(oTR);
		
		var oTD = window.document.createElement("TD");
		oTD.vAlign = "top";
		oTR.appendChild(oTD);
		
		element.m_rootdiv = window.document.createElement("DIV");
		element.m_rootdiv.style.padding = 3;
		element.m_rootdiv.style.overflow = "auto";

		oTD.appendChild(element.m_rootdiv);
	}

	element.doResize = function(_Width, _Height)
	{
		if (element.detailsHead == null) { _Width -= 2; _Height -= 2; }

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

	element.doResize(element.offsetWidth, element.offsetHeight);

	element.m_rootdiv.innerHTML = "<i>Loading...</i>";

	if (element.src != null)
	{
		var m_Xml = _load_XML(element.src);
		if (m_Xml != null)
		{
			element.m_rootdiv.innerHTML = "";

			var oSpan = window.document.createElement("SPAN");
			element.m_rootdiv.appendChild(oSpan);

			if (m_Xml.documentElement != null)
			{
				oSpan.innerHTML = "<img src=\"" + correctLocation(element.src, m_Xml.documentElement.text) + "\" border=\"0\">";
			}
		}
	}
	else if (element.value != null) 
	{
		element.m_rootdiv.innerHTML = "";

		var oSpan = window.document.createElement("SPAN");
	     	oSpan.innerHTML = "<img src=\"" + element.value + "\" border=\"0\">";
		element.m_rootdiv.appendChild(oSpan);
	}
	
}

var picture_js = true;