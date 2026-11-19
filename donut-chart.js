export class DonutChart {
	constructor(parent, spec) {
		this.parent = parent
		this.spec = spec
		this.update({})
	}

	__polar2xy(a, r) {
		return {
			x: Math.cos(a * 2 * Math.PI) * r,
			y: -Math.sin(a * 2 * Math.PI) * r,
		}
	}

	__gen_arc_path(cx, cy, r, start, offset) {
		var end = this.__polar2xy(start + offset, r)
		start = this.__polar2xy(start, r)
		return [
			"M", cx + start.x, cy + start.y,
			"A", r, r, 0, +(offset > .5), 0, cx + end.x, cy + end.y,
		].join(" ")
	}

	__gen_chart_item(out, c, r, prev, cur, i, stroke) {
		out.push(["path", {
			d: this.__gen_arc_path(c, c, r, prev, cur),
			class: "chart-item-" + i,
			fill: "transparent",
			"stroke-width": stroke,
		}])
	}

	__gen_chart(chart) {
		var prev = 0, out = []
		// FIXME get radius and stroke-width from CSS
		var c = chart.r, r = chart.r - chart.stroke / 2
		for (var i in chart.items) {
			var cur = chart.items[i]
			this.__gen_chart_item(out, c, r, prev, cur.value, i, chart.stroke)
			prev += cur.value
		}
		if (prev < 1) {
			this.__gen_chart_item(out, c, r, prev, 1 - prev, "bg", chart.stroke)
		}
		return out
	}

	__create_tag_tree(elem) {
		var root = document.createElementNS("http://www.w3.org/2000/svg", elem[0])
		var attr = elem[1]
		// Set attributes
		for (var i in attr) {
			var a = document.createAttribute(i)
			a.value = attr[i]
			root.setAttributeNode(a)
		}
		// Create children nodes
		if (elem.length > 2) {
			var children = elem[2]
			for (var i in children) {
				var c = this.__create_tag_tree(children[i])
				root.appendChild(c)
			}
		}
		return root
	}

	/* Transformation matrix (rotate and mirror) to correct orientation:
	 * \[
	 *   \left[
	 *   \begin{array}{ccc}
	 *      0 & -1 & 0 \\
	 *     -1 &  0 & 0 \\
	 *      0 &  0 & 1
	 *   \end{array}
	 *   \right]
	 * \]
	 */
	__gen_code(spec) {
		var correct_orientation = "matrix(0 -1 -1 0 0 0)"
		return this.__create_tag_tree(
			["svg", {
				transform: correct_orientation,
				class: "chart-donut",
				width: spec.r * 2,
				height: spec.r * 2,
			}, this.__gen_chart(spec)])
	}

	__is_dict(v) {
		return v && typeof v === "object" && !(v instanceof Array)
	}

	update(spec) {
		// Merge the new spec
		for (var i in spec) {
			this.spec[i] = spec[i]
		}

		var code = this.__gen_code(this.spec)
		// TODO can we switch the elements in place?
		if (this.element != undefined) {
			this.element.remove()
		}
		this.element = this.parent.appendChild(code)
	}
}
