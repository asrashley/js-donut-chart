export interface DonutChartItem {
	label?: string;
	className?: string;
	value: number;
}

export interface DonutChartSpec {
	r: number;
	stroke: number;
	rotate?: boolean;
	mirror?: boolean;
	partial?: boolean;
	height?: number;
	width?: number;
	items: DonutChartItem[];
}

export type DonutChartOptions = Partial<DonutChartSpec>;

type SvgElementDescription = [
	tagName: string,
	attributes: Record<string, string | number>,
	children?: SvgElementDescription[],
];

type SvgPathDescription = {
	d: string;
	class: string;
	fill: string;
	"stroke-width": number;
};

export class DonutChart {
	static ROTATE_AND_MIRROR = "matrix(0 -1 -1 0 0 0)";

	static defaultSpec: DonutChartSpec = {
		r: 60,
		stroke: 16,
		rotate: true,
		mirror: true,
		partial: false,
		height: undefined,
		width: undefined,
		items: [],
	};

	private parent: Element | null;
	private spec: DonutChartSpec;
	private element?: Element;

	constructor(parent: Element, spec: DonutChartOptions = {}) {
		this.parent = parent;
		this.spec = {
			...DonutChart.defaultSpec,
			...spec,
		};
		this.update({});
	}

	get parentElement(): Element | null {
		return this.parent;
	}

	cleanup() {
		if (this.element && this.parent) {
			this.parent.removeChild(this.element);
			this.element = undefined;
		}
	}

	dispose() {
		this.cleanup();
		this.parent = null;
	}

	private __polar2xy(a: number, radius: number): { x: number; y: number } {
		return {
			x: Math.cos(a * 2 * Math.PI) * radius,
			y: -Math.sin(a * 2 * Math.PI) * radius,
		};
	}

	private __gen_arc_path(
		cx: number,
		cy: number,
		radius: number,
		start: number,
		offset: number,
	): string {
		const startXy = this.__polar2xy(start, radius);
		const endXy = this.__polar2xy(start + offset, radius);
		return [
			"M", cx + startXy.x, cy + startXy.y,
			"A", radius, radius, 0, +(offset > .5), 0, cx + endXy.x, cy + endXy.y,
		].join(" ");
	}

	private __gen_chart_item(
		out: SvgElementDescription[],
		c: number,
		r: number,
		prev: number,
		cur: number,
		className: string,
		stroke: number,
	): void {
		out.push(["path", {
			d: this.__gen_arc_path(c, c, r, prev, cur),
			class: className,
			fill: "transparent",
			"stroke-width": stroke,
		}]);
	}

	private __gen_chart(chart: DonutChartSpec): SvgElementDescription[] {
		let prev = 0;
		const out: SvgElementDescription[] = [];
		// FIXME get radius and stroke-width from CSS
		const c = chart.r, r = chart.r - chart.stroke / 2;
		for (const [index, item] of chart.items.entries()) {
			const className = item.className ?? `chart-item-${index}`;
			this.__gen_chart_item(out, c, r, prev, item.value, className, chart.stroke);
			prev += item.value;
		}
		if (prev < 1 && !chart.partial) {
			this.__gen_chart_item(out, c, r, prev, 1 - prev, "chart-item-bg", chart.stroke);
		}
		return out;
	}

	private __create_tag_tree(elem: SvgElementDescription): Element {
		const root = document.createElementNS("http://www.w3.org/2000/svg", elem[0]);
		const attributes = elem[1];
		for (const name in attributes) {
			root.setAttribute(name, String(attributes[name]));
		}
		if (elem.length > 2) {
			const children = elem[2] ?? [];
			for (const child of children) {
				root.appendChild(this.__create_tag_tree(child));
			}
		}
		return root;
	}

	generateSvgElement(spec: DonutChartSpec): SVGSVGElement {
		const attributes: Record<string, string | number> = {
			class: "chart-donut",
			width: spec.width ?? spec.r * 2,
			height: spec.height ?? spec.r * 2,
		};
		if (spec.rotate && spec.mirror) {
			attributes.transform = DonutChart.ROTATE_AND_MIRROR;
		} else if (spec.mirror) {
			attributes.transform = "scale(-1 1)";
		} else if (spec.rotate) {
			attributes.transform = "rotate(-90)";
		}
		return this.__create_tag_tree([
			"svg", attributes,
			this.__gen_chart(spec),
		]) as SVGSVGElement;
	}

	update(spec: DonutChartOptions): void {
		const before = this.spec.items?.length ?? 0;
		this.spec = {
			...this.spec,
			...spec,
		};

		if (!this.parent) {
			throw new Error("chart has been disposed");
		}

		if (this.element) {
			const paths = this.__gen_chart(this.spec);
			const existingPaths = this.element.querySelectorAll("path");
			if (
				this.spec.items.length === before &&
				existingPaths.length === paths.length &&
				!["r", "width", "height", "rotate", "mirror"].some(key => key in spec)
			) {
				existingPaths.forEach((path, index) => {
					const desc = paths[index]?.[1] as SvgPathDescription | undefined;
					if (!desc) {
						return;
					}
					path.setAttribute("d", desc.d);
					if (path.getAttribute("class") !== desc.class) {
						path.setAttribute("class", desc.class);
					}
					if (path.getAttribute("fill") !== desc.fill) {
						path.setAttribute("fill", desc.fill);
					}
					if (path.getAttribute("stroke-width") !== String(desc["stroke-width"])) {
						path.setAttribute("stroke-width", String(desc["stroke-width"]));
					}
				});
				return;
			}
		}

		if (this.element != undefined) {
			this.element.remove();
			this.element = undefined;
		}

		if (!this.spec.items) {
			return;
		}

		const code = this.generateSvgElement(this.spec);
		this.element = this.parent.appendChild(code);
	}
}
