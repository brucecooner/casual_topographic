var SVGeeNS = {
	// util class to hold a data-representation of an svg (generic drawing really), which can then be
	// generated on-demand
	SVGee:function(log_fn)
	{
		// ----- consts -----
		this.indent_base = "  ";

		// ----- variables -----
		this.log = log_fn ? log_fn : () => {};

		this.root = null;

		this.default_style =
		{
			stroke: "rgb(255,0,0)", 
			stroke_width: "1",
			fill: "none",
		};

		// holds last generated svg
		this.svg = null;

		// ----------------------------------------------------------------------
		this.new = function(width, height)
		{
			if (this.root)
			{
				console.warn("WARNING: SVGee.new(): cleared existing root");
				this.root = null;
			}

			const root_attribs = {
				"width": width,
				"height": height,
				"viewBox": `0 0 ${width} ${height}`,
				"xmlns" : "http://www.w3.org/2000/svg",
				"id" : "default_svg_id",
			};

			this.root = this.newNode(tag = "svg", attributes = root_attribs);
		}

		// ----------------------------------------------------------------------
		// appends to root
		this.appendNode = function(node)
		{
			this.validateNode(node);

			this.root.children.push(node);
		}

		// ----------------------------------------------------------------------
		this.setDefaultStyle = function(new_default_style)
		{
			Object.assign(this.default_style, new_default_style);
		}

		// ----------------------------------------------------------------------------
		// gets style_in values as style, if given, otherwise the defaults
		// note that style_in can contain a subset of style value, with defaults
		// replacing those that are not given
		this.getStyle = function(style_in = null)
		{
			var return_style = this.default_style;

			if (style_in)
			{
				Object.assign(return_style, style_in);
			}

			return return_style;
		};

		// ----------------------------------------------------------------------
		// node_tag: a type of tag in an svg (including the root) so svg, line, circle, etc.
		// attributes: simple name:value pairs (value expected to be a string)
		this.newNode = function(node_tag = "", node_attribs = null)
		{
			return {	tag:node_tag,
						attributes: node_attribs,
						children: [] };
		}

		// ----------------------------------------------------------------------
		this.nodeInvalid = function(node)
		{
			let error = false;

			// must have node tag
			if (!node)
			{
				error = "node has no value";
			}
			else if (!node.tag)
			{
				error = "node.tag: " + node.tag;
			}
			else if (typeof node.tag !== "string")
			{
				error = "node.tag is not a string: " + typeof node.tag;
			}
			else if (node.tag == "")
			{
				error = "node.tag is empty string";
			}
			else if (node.attributes && typeof node.attributes !== "object")
			{
				error = "node.attributes not object type: " + typeof node.attributes;
			}
			else if (!node.children)
			{
				// must have children member (can be empty)
				error = "node.children? : " + node.children;
			}
			else if (!Array.isArray(node.children))
			{
				error = "node.children is not array: " + typeof node.children;
			}

			return error;
		}


		// ----------------------------------------------------------------------
		// MIGHT THROW ERROR!
		this.generateNodeText = function(node, indent)
		{
			// always validate (for now)
			let err = this.nodeInvalid(node);
			if (err)
			{
				throw new Error("SVGee: invalid node: " + err);
			}

			let node_text = "";

			node_text += indent + "<" + node.tag;
			if (node.attributes)
			{
				node_text += "\n";
				const attrib_keys = Object.keys(node.attributes);
				attrib_keys.forEach(cur_key =>
				{
					node_text += indent + cur_key + "=" + '"' + node.attributes[cur_key] + '"' + "\n";
				});
			}
			// close opening tag
			node_text += ">"

			if (node.children && node.children.length)
			{
				// close opening tag
				// node_text += ">";
				node.children.forEach(cur_child_node => {
					cur_node_text = this.generateNodeText(cur_child_node, indent + this.indent_base);
					node_text += "\n";
					node_text += cur_node_text;
				});
				// add closing tag (of entry node)
				// node_text += indent + "</" + node.tag + ">"
			}
			// else
			// {
			// }
			// closing tag
			node_text += "</" + node.tag + ">";

			return node_text;
		}

		// ----------------------------------------------------------------------
		this.line = function(x1, y1, x2, y2, style_in = null)
		{
			this.log(`line() ${x1},${y1} to ${x2},${y2}`);

			const _style = this.getStyle(style_in);

			const line_attribs = {
				"x1": x1, "y1": y1,
				"x2": x2, "y2": y2,
				"stroke": _style.stroke,
				"stroke-width": _style.stroke_width,
			};

			const new_node = this.newNode("line", line_attribs);

			// return `<line	x1="${x1}"
			// 					y1="${y1}"
			// 					x2="${x2}"
			// 					y2="${y2}"
			// 					stroke="${_style.stroke}"
			// 					stroke-width="${_style.stroke_width}" />`;
			return new_node;
		}

		// ----------------------------------------------------------------------
		// MIGHT THROW ERROR
		this.validateNode = function(node, node_count)
		{
			const err = this.nodeInvalid(node);

			if (err)
			{
				const msg = `SVGee.validateNode() ERROR: ${err} (node_count:${node_count})`;
				throw new Error(msg);
			}

			// validate children too...
			nodes_validated = 0;
			if (node.children)
			{
				nodes_validated += 1;
				node.children.forEach(cur_child_node => {
					nodes_validated += this.validateNode(cur_child_node, node_count + nodes_validated);
				});
			}

			return nodes_validated;
		}

		// ----------------------------------------------------------------------
		// MIGHT THROW ERROR
		this.validate = function()
		{
		if (!this.root)
			{
				throw new Error("SVGee.validate(): no root node");
			}

			let root_invalid = this.nodeInvalid(this.root);
			if (root_invalid)
			{
				throw new Error("SVGee.validate(): root node invalid" + root_invalid);
			}

			let node_count = 1;
			if (this.root.children)
			{
				this.root.children.forEach(cur_root_child =>
				{
					this.validateNode(cur_root_child, 1);
				});
			}
		}

		// ----------------------------------------------------------------------
		this.generateSVG = function()
		{
			this.validate();

			// var width = this.width;
			// var height = this.height;
			// var x = -width / 2;
			// var y = -height / 2;
			// const x = 0;
			// const y = 0;

			// let svg_elem = `<svg width="100%" height="100%" id="mySVG" viewbox="${x} ${y} ${this.width} ${this.height}">`;
			let svg_text = "";

			this.svg = this.generateNodeText(this.root, "");

			return this.svg;
		}

		// ----------------------------------------------------------------------

		this.log("SVGee constructed");
		return this;
	}	// end constructor
} // end MapLinessNS
