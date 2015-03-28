function _do_select_nodes(node, xPath, list)
{
	var isComplex = true;
	var isParam = false;
	var attrName = null;
	var attrValue = null;

	var p0 = xPath.indexOf("/");
	if (p0 < 0)
	{
		isComplex = false;
		p0 = xPath.length;
	}
	else if (p0 == 0)
	{
		_do_select_nodes(node.parentNode, xPath.substring(1), list);
		return;
	}
	var name = xPath.substring(0, p0);

	var p = xPath.indexOf("[@");
	if (p > 0 && p < p0)
	{
		isParam = true;
		var p2 = p + 2;  var p3 = xPath.indexOf("=\"");
		attrName = xPath.substring(p2, p3);
		attrValue = xPath.substring(p3 + 2, xPath.indexOf("\"]"));
		name = name.substring(0, p);
	}

	var children = node.childNodes;
	var length = children.length;
	for (var i = 0; i < length; i++)
	{
		var child = children[i];
		if (child.nodeName != name)
			continue;

		var found = true;
		if (isParam)
		{
			found = false;
			if (child.getAttribute(attrName)) 
				if (attrValue == "*" || child.getAttribute(attrName) == attrValue)
					found = true;
		}
		if (!found) continue;

		if (isComplex)
			_do_select_nodes(child, xPath.substring(p0+1), list);
		else
			list.push(child);
	}
}

function _select_Nodes(node, xPath)
{
	if (isIE)
		return node.selectNodes(xPath);

	var list = new Array();
	_do_select_nodes(node, xPath, list);
	return list;
}

function LogRootObject(uri)
{
	var oXml = _load_XML(uri);
	if (oXml == null || oXml.documentElement == null)
	{
		alert("xml load error");
		return;
	}

	fillLogNodeData(this, oXml.documentElement);
}

function LogDataObject(node)
{
	fillLogNodeData(this, node);
}

function ProviderObject(name, href, schemaType, status)
{
	this.name = name;
	this.href = href;
	this.schemaType = schemaType;
	this.status = status;
	this.children = new Array();
	this.empty = true;
}

function fillLogNodeData(obj, node)
{
	obj.name = (node.getAttribute("name") != null) ? node.getAttribute("name"): "";
	obj.status = (node.getAttribute("status") != null) ? parseInt(node.getAttribute("status")): 0;
	obj.href = "";
	obj.schemaType = "aqds:none";
	obj.children = new Array();

	var items = _select_Nodes(node, "Provider");
	if (items != null && items.length > 0)
	{
		if (items.length == 1) 
		{
			obj.schemaType = (items[0].getAttribute("schemaType") != null) ? items[0].getAttribute("schemaType"): "";
			obj.href = (items[0].getAttribute("href") != null) ? items[0].getAttribute("href"): "";
		}
		else
		{
			for(var i = 0; i < items.length; i++)
			{
				obj.children.push(new ProviderObject(
				  (items[i].getAttribute("name") != null) ? items[i].getAttribute("name"): "", 
				  (items[i].getAttribute("href") != null) ? items[i].getAttribute("href"): "", 
				  (items[i].getAttribute("schemaType") != null) ? items[i].getAttribute("schemaType"): "",
				  obj.status));
			}
		}
	}

	var items = _select_Nodes(node, "LogData");
	if (items != null && items.length > 0)
	{
		for (var i = 0; i < items.length; i++)
		{
			obj.children.push(new LogDataObject(items[i]));
		}
	}

	obj.empty = obj.children.length == 0;
}

var logdata_js = true;