export class DonutChart {
	static defaultSpec = {
		r: 60,
		stroke: 16,
		rotate: true,
		mirror: true,
		partial: false,
		items: [],
	};

	constructor(parent, spec = {}) {
		this.parent = parent;
		this.spec = {
			...DonutChart.defaultSpec,
			...spec
		};
		this.update({});
	}

	__polar2xy(a, radius) {
		return {
			x: Math.cos(a * 2 * Math.PI) * radius,
			y: -Math.sin(a * 2 * Math.PI) * radius,
		}
	}

	__gen_arc_path(cx, cy, radius, start, offset) {
		const startXy = this.__polar2xy(start, radius);
		const endXy = this.__polar2xy(start + offset, radius);
		return [
			"M", cx + startXy.x, cy + startXy.y,
			"A", radius, radius, 0, +(offset > .5), 0, cx + endXy.x, cy + endXy.y,
		].join(" ");
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
		let prev = 0;
		const out = [];
		// FIXME get radius and stroke-width from CSS
		const c = chart.r, r = chart.r - chart.stroke / 2;
		for (const i in chart.items) {
			const cur = chart.items[i]
			this.__gen_chart_item(out, c, r, prev, cur.value, i, chart.stroke)
			prev += cur.value
		}
		if (prev < 1 && !chart.partial) {
			this.__gen_chart_item(out, c, r, prev, 1 - prev, "bg", chart.stroke)
		}
		return out
	}

	__create_tag_tree(elem) {
		var root = document.createElementNS("http://www.w3.org/2000/svg", elem[0])
		var attr = elem[1]
		// Set attributes
		for (var i in attr) {
			const a = document.createAttribute(i)
			a.value = attr[i]
			root.setAttributeNode(a)
		}
		// Create children nodes
		if (elem.length > 2) {
			const children = elem[2]
			for (const i in children) {
				const c = this.__create_tag_tree(children[i])
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
		const correct_orientation = "matrix(0 -1 -1 0 0 0)";
		const attributes = {
				class: "chart-donut",
				width: spec.r * 2,
				height: spec.r * 2,
			};
		if (this.spec.rotate && this.spec.mirror) {
			attributes.transform = correct_orientation;
		}
		else if (this.spec.mirror) {
			attributes.transform = "scale(-1 1)";
		}
		return this.__create_tag_tree(
			["svg", attributes, this.__gen_chart(spec)])
	}

	__is_dict(v) {
		return v && typeof v === "object" && !(Array.isArray(v))
	}

	update(spec) {
		// Merge the new spec
		this.spec = {
			...this.spec,
			...spec,
		}

		const code = this.__gen_code(this.spec)
		// TODO can we switch the elements in place?
		if (this.element != undefined) {
			this.element.remove()
		}
		this.element = this.parent.appendChild(code)
	}
}
