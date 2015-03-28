// setCapture for Mozilla & Opera
if (window.HTMLElement)
{
	var element = HTMLElement.prototype;

	var capture = ["click", "mousedown", "mouseup", "mousemove", "mouseover", "mouseout"];

	element.setCapture = function()
	{
		var self = this;
		var flag = false;
		this._capture = function(e)
		{
			if (flag) return;
			flag = true;

			var event = document.createEvent("MouseEvents");
			event.initMouseEvent(e.type, e.bubbles, e.cancelable, e.view, e.detail,
				e.screenX, e.screenY, e.clientX, e.clientY, e.ctrlKey, e.altKey,
				e.shiftKey, e.metaKey, e.button, e.relatedTarget);
			self.dispatchEvent(event);
			flag = false;
		};
		for (var i = 0; i < capture.length; i++)
			window.addEventListener(capture[i], this._capture, true);
	};

	element.releaseCapture = function()
	{
		for (var i = 0; i < capture.length; i++) 
			window.removeEventListener(capture[i], this._capture, true);
		this._capture = null;
	};

	element.click = function()
	{
		var event = document.createEvent("MouseEvents");
		event.initMouseEvent("click", false, true, document.defaultView, 
			1, 0, 0, 0, 0, false, false, false, false, 0, this);
		this.dispatchEvent(event);
	}

	if (isFF && element.__defineGetter__)
	{
		element.__defineGetter__("uniqueID", function()
		{
			if (!arguments.callee.count) arguments.callee.count = 0;
			var _uniqueID = "moz_id" + arguments.callee.count++;
			window[_uniqueID] = this;
			this.__defineGetter__("uniqueID", function() { return _uniqueID } );
			return _uniqueID;
		} );

		element.__defineGetter__("innerText", function() { return this.textContent; } );
		element.__defineSetter__("innerText", function(value) { this.textContent = value; } );
	}
}

// For IE 5 & IE 5.5
m_PointerCursor = "pointer";

if (isIE5 || isIE55)
{
	m_PointerCursor = "hand";
	if (isIE5)
		Array.prototype.push = function(value) { this[this.length] = value; }
}

String.prototype.trim = function() 
{
	return this.replace(/(^\s*)|(\s*$)/g, "");
}

function _load_XML(url)
{
	var oXml;

	if (window.ActiveXObject) {
		oXml = new ActiveXObject("Microsoft.XMLDOM");
		oXml.async = false;
		oXml.load(url);
	}
	else if (window.XMLHttpRequest)
	{
		var loader = new XMLHttpRequest();
		try
		{
			loader.open("GET", url, false);
		}
		catch(e)
		{
		        try { netscape.security.PrivilegeManager.enablePrivilege ("UniversalBrowserRead")} catch (e) {}
			loader.open("GET", url, false);
		}
		if (url.substring(url.length - 3) == "xsd" && typeof(loader.overrideMimeType) != 'undefined')
			loader.overrideMimeType("text/xml");
		loader.send(null);
		oXml = loader.responseXML;
	}

	if (oXml == null || oXml.documentElement == null)
		return null;

	return oXml;
}

function _get_Text(node) 
{
	if (typeof node.text != "undefined") {
		return node.text;
	}
	else if (typeof node.textContent != "undefined") {
		return node.textContent;
	}
	else if (!isOpera8 && typeof node.innerText != "undefined") {
		return node.innerText;
	}
	else {
		switch (node.nodeType) {
			case 3:
			case 4:
				return node.nodeValue;
				break;
			case 1:
			case 11:
				var _innerText = "";
				for (var i = 0; i < node.childNodes.length; i++) {
					_innerText += _get_Text(node.childNodes[i]);
				}
				return _innerText;
				break;
			default:
				return "";
		}
	}
	return "";
}

function getScreenX(obj)
{
    if (isIE)
    {
	if (obj != null)
	{
		var offset = obj.offsetLeft;
		var offsetParent = obj.offsetParent;
		var priorParent = null;
		while (offsetParent != null)
		{
			offset += offsetParent.offsetLeft;
			priorParent = offsetParent;
			offsetParent = offsetParent.offsetParent;
		}
		if (priorParent != null)
		{
			offset += priorParent.clientLeft;
		}

		return offset;
	} else {

		return 0;
	}
    }
    else
    {
	var left = 0;
	if (obj) do
	{
		if (isSafari && obj.nodeName == "TABLE") left ++;
		left += obj.offsetLeft;
		if (!obj.offsetParent) break;
		obj = obj.offsetParent;
	} while (true);
	if (isSafari) left--;
	return left;
    }
}

function getScreenY(obj)
{
    if (isIE)
    {
	if (obj != null)
	{
		var offset = obj.offsetTop;
		var offsetParent = obj.offsetParent;
		var priorParent = null;
		while (offsetParent != null)
		{
			offset += offsetParent.offsetTop;
			priorParent = offsetParent;
			offsetParent = offsetParent.offsetParent;
		}
		if (priorParent != null)
		{
			offset += priorParent.clientTop;
		}

		return offset;
	} else {
	
		return 0;
	}
    }
    else
    {
	var top = 0;
	if (obj) do
	{
		if (isSafari && obj.nodeName == "TABLE") top ++;
		top += obj.offsetTop;
		if (!obj.offsetParent) break;
		obj = obj.offsetParent;
	} while (true);
	if (isSafari) top--;
	return top;
    }
}


function getIsComplexType(typeName)
{
	return (typeName == null || typeName == "aqds:table" || typeName == "aqds:graph" || typeName == "aqds:diagram");
}

function TableObject(xmlData, parent, element)
{
	this.parent = parent;
	this.element = element;
	this.xmlData = xmlData;
	this.getPath = TableObjectGetPath;
	this.topRecord = "-1";
	this.nestedDataCount = 0;

	this.caption = this.element.getAttribute("caption");
	this.name = this.element.getAttribute("name");
	this.typeName = (this.element.getAttribute("type") == null) ? "aqds:table": this.element.getAttribute("type");

	var recordElements = _select_Nodes(this.element, "xs:complexType/xs:sequence/xs:element");
	if (recordElements.length > 0)
	{
		var oRecordElement = recordElements[0];
		this.recordName = oRecordElement.getAttribute("name");

		var columnElements = _select_Nodes(oRecordElement, "xs:complexType/xs:sequence/xs:element");
		this.columns = new Array(columnElements.length);

		for (var i = 0; i < columnElements.length; i++)
		{
			var oColumnElement = columnElements[i];
			var typeName = oColumnElement.getAttribute("type");
			if (getIsComplexType(typeName))
			{
				// Complex type
				var obj = this; while (obj) { obj.nestedDataCount ++; obj = obj.parent; }

				this.columns[i] = new TableObject(xmlData, this, oColumnElement);
			} else {

				// Simple type
				this.columns[i] = new ColumnObject(this, oColumnElement);
			}
			this.columns[i].filterList = new Array();
			this.columns[i].filtered = false;
		}
	}
}

function ColumnObject(parent, element)
{
	this.parent = parent;
	this.element = element;

	this.caption = this.element.getAttribute("caption");
	this.name = this.element.getAttribute("name");
	this.typeName = this.element.getAttribute("type");
	this.absciss = this.element.getAttribute("absciss") == "True";
	this.informational = this.element.getAttribute("informational") == "True";
	this.sort = this.element.getAttribute("sort") == "True";
	this.combinations = this.element.getAttribute("combinations");
	this.cmbDiagram = this.element.getAttribute("cmbDiagram");
	this.defaultOrdinate = this.element.getAttribute("defaultOrdinate") == "True";
	this.defaultAbsciss = this.element.getAttribute("defaultAbsciss") == "True";
	this.defaultValue = this.element.getAttribute("defaultValue") == "True";
	this.defaultInfo = this.element.getAttribute("defaultInfo") == "True";
}

function TableObjectGetPath()
{
	return getTablePath(this);
}

function getTablePath(table)
{
	if (table == null)
	{
		return "";
	}
	else
	{
		var parentTable = table.parent;
		if (parentTable != null)
			return getTablePath(parentTable) + "[@id=\"" + table.topRecord + "\"]/" + table.name + "/" + table.recordName
		else
			return "/" + table.name + "/" + table.recordName;
	}
}

function doWindowResize()
{
	var oLogRoot = document.getElementById("logroot");
	if (oLogRoot && oLogRoot.doResize) oLogRoot.doResize();
}

function correctLocation(basePath, name)
{
	for (var i = basePath.length - 1; i >= 0; i--)
	{
		var _char = basePath.charAt(i);
		if ((_char == "\\") || (_char == "/"))
		{
			return basePath.substring(0, i + 1) + name;
		}
	}
	return name;
}

function changeFileExt(fileName, newExt)
{
	for (var i = fileName.length - 1; i >= 0; i--)
	{
		var _char = fileName.charAt(i);
		if (_char == ".") 
		{
			return fileName.substring(0, i + 1) + newExt;
		}
	}
	return fileName;
}


function createTreeImage(opened)
{
	var oImage = document.createElement("img");
	oImage.src = opened ? "minus.gif": "plus.gif";
	oImage.width = 9;
	oImage.height = 9;
	oImage.border = 0;
	oImage.style.marginRight = 3;
	oImage.style.marginLeft = 5; 
	oImage.style.marginBottom = 2; //1
	oImage.style.cursor = m_PointerCursor;
	oImage.opened = opened;
	oImage.active = true;
	return oImage;
}

function createTreeImageDummy()
{
	var oImage = document.createElement("img");
	oImage.src = "null.gif";
	oImage.width = 9;
	oImage.height = 9;
	oImage.border = 0;
	oImage.style.marginRight = 3;
	oImage.style.marginLeft = 5;
	oImage.style.marginBottom = 1;
	oImage.opened = false;
	oImage.active = false;
	return oImage;
}

function roloverTreeImage(img)
{
	img.opened = !img.opened;
	if (img.active == true)
		showTreeImage(img);
}

function hideTreeImage(img)
{
	img.active = false;
	img.src = "null.gif";
}

function showTreeImage(img)
{
	img.active = true;
	img.src = img.opened ? "minus.gif" : "plus.gif";
}

function hideTreeImageComplete(img)
{
	img.active = false;
	img.width = 0;
	img.height = 0;
	img.src = "null.gif";
}

function createTreeStateImage(state)
{
	var oImage = document.createElement("img");
	if (state == 1) {
		oImage.src = "warn.gif";
	} else if (state == 2) {
		oImage.src = "error.gif";
	} else {
		oImage.src = "ok.gif";
	}
	oImage.width = 16;
	oImage.height = 16;
	oImage.border = 0;
	oImage.style.position = "relative";
	oImage.style.top = 2;
	return oImage;
}

function getObjectWidth(obj)
{
	return (obj == null) ? 0: obj.offsetWidth;
}

function getColumnTypeIsSuppressed(typeName)
{
	return false;
}

function getHasNestedData(element)
{
	if (element.table != null)
	{
		for (var i = 0; i < element.table.columns.length; i++)
		{
			var oColumn = element.table.columns[i];
			if (getColumnTypeIsSuppressed(oColumn.typeName)) 
			  continue;
			  
			if ((oColumn.typeName == "aqds:table") || (oColumn.typeName == "aqds:picture") || (oColumn.typeName == "aqds:text")
			  || (oColumn.typeName == "aqds:graph")|| (oColumn.typeName == "aqds:diagram"))
				return true;
		}
	}
	return false;
}

function getNestedDataIsPlain(element)
{
	if (element.table != null)
	{
		for (var i = 0; i < element.table.columns.length; i++)
		{
			var oColumn = element.table.columns[i];
			if (getColumnTypeIsSuppressed(oColumn.typeName)) 
			  continue;
			  
			if ((oColumn.typeName == "aqds:table") || (oColumn.typeName == "aqds:graph")|| (oColumn.typeName == "aqds:diagram"))
				return false;
		}
	}
	return true;
}

FusionCharts = function(swf, id, w, h)
{
	if (!document.getElementById) return;
	
	this.params = new Object();
	this.variables = new Object();
	this.attributes = new Array();
	
	if (swf)
	{
		var loc = window.document.location.href;
		if (loc.indexOf(".mht") == loc.length - 4)
			swf = "http://localhost/" +  swf;
		this.setAttribute("swf", swf);
	}
	if (id) this.setAttribute("id", id);
	if (w) this.setAttribute("width", w);
	if (h) this.setAttribute("height", h);
	
	this.addParam("quality", "high");
	
	this.addVariable("chartWidth", w);
	this.addVariable("chartHeight", h);
}

FusionCharts.prototype = {
	setAttribute: function(name, value) {
		this.attributes[name] = value;
	},
	getAttribute: function(name) {
		return this.attributes[name];
	},
	addParam: function(name, value) {
		this.params[name] = value;
	},
	getParams: function() {
		return this.params;
	},
	addVariable: function(name, value) {
		this.variables[name] = value;
	},
	getVariable: function(name) {
		return this.variables[name];
	},
	getVariables: function() {
		return this.variables;
	},
	getVariablePairs: function() {
		var variablePairs = new Array();
		var key;
		var variables = this.getVariables();
		for (key in variables)
			variablePairs.push(key +"="+ variables[key]);
		return variablePairs;
	},
	getSWFHTML: function() {
		var swfNode = "";
		if (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length) { 
			// netscape plugin architecture
			swfNode = '<embed type="application/x-shockwave-flash" src="'+ this.getAttribute('swf') +'" width="'+ this.getAttribute('width') +'" height="'+ this.getAttribute('height') +'"  ';
			swfNode += ' id="'+ this.getAttribute('id') +'" name="'+ this.getAttribute('id') +'" ';
			var params = this.getParams();
			 for(var key in params){ swfNode += [key] +'="'+ params[key] +'" '; }
			var pairs = this.getVariablePairs().join("&");
			 if (pairs.length > 0){ swfNode += 'flashvars="'+ pairs +'"'; }
			swfNode += '/>';
		} else { // PC IE
			swfNode = '<object id="'+ this.getAttribute('id') +'" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="'+ this.getAttribute('width') +'" height="'+ this.getAttribute('height') +'">';
			swfNode += '<param name="movie" value="'+ this.getAttribute('swf') +'" />';
			var params = this.getParams();
			for(var key in params) {
			 swfNode += '<param name="'+ key +'" value="'+ params[key] +'" />';
			}
			var pairs = this.getVariablePairs().join("&");
			if(pairs.length > 0) {swfNode += '<param name="flashvars" value="'+ pairs +'" />';}
			swfNode += "</object>";
		}
		return swfNode;
	},
	setDataXML: function(strDataXML) {
		var chartObj = getChartFromId(this.getAttribute("id"));
		chartObj.SetVariable("_root.isNewData", "1");
		chartObj.SetVariable("_root.newData", strDataXML);
		chartObj.TGotoLabel("/", "JavaScriptHandler");
	},
	render: function(elementId) {
		var n = (typeof elementId == "string") ? document.getElementById(elementId) : elementId;
		n.innerHTML = this.getSWFHTML();
		return true;
	}
}

function getChartFromId(id)
{
	if (window.document[id]) {
		return window.document[id];
	}
	if (!isIE) {
		if (document.embeds && document.embeds[id])
			return document.embeds[id];
	} else {
		return document.getElementById(id);
	}
}

function TextObject(xmlData, parent, element)
{
	this.parent = parent;
	this.element = element;
	this.xmlData = xmlData;
	this.nestedDataCount = 0;

	this.caption = this.element.getAttribute("caption");
	this.name = this.element.getAttribute("name");
	this.typeName = (this.element.getAttribute("type") == null) ? "aqds:text": this.element.getAttribute("type");

	var recordElements = _select_Nodes(this.element, "xs:complexType");
	if (recordElements.length > 0)
	{
		var oRecordElement = recordElements[0];
		this.textFormat = oRecordElement.getAttribute("textformat");
		this.recordType = oRecordElement.getAttribute("type");
	}
}

var aqds_js = true;