import { describe, expect, it } from "vitest";
import { DonutChart } from "./donut-chart.ts";

describe("DonutChart", () => {
	it("creates an SVG with sized arcs and a background arc", () => {
		const parent = document.createElement("div");
		new DonutChart(parent, {
			r: 40,
			stroke: 8,
			width: 100,
			height: 90,
			items: [{ value: 0.25 }, { value: 0.25 }],
		});

		const svg = parent.querySelector("svg");
		expect(svg?.getAttribute("class")).toBe("chart-donut");
		expect(svg?.getAttribute("width")).toBe("100");
		expect(svg?.getAttribute("height")).toBe("90");
		expect(svg?.getAttribute("transform")).toBe(DonutChart.ROTATE_AND_MIRROR);

		const paths = parent.querySelectorAll("path");
		expect(paths).toHaveLength(3);
		expect(paths[0].getAttribute("class")).toBe("chart-item-0");
		expect(paths[0].getAttribute("stroke-width")).toBe("8");
		expect(paths[2].getAttribute("class")).toBe("chart-item-bg");
	});

	it("updates paths in place when the item count stays the same", () => {
		const parent = document.createElement("div");
		const chart = new DonutChart(parent, {
			r: 50,
			stroke: 10,
			items: [{ value: 0.25 }, { value: 0.25 }],
		});
		const svg = parent.querySelector("svg");
		const firstPath = svg?.querySelector("path");
		const originalPath = firstPath?.getAttribute("d");

		chart.update({
			stroke: 12,
			items: [{ value: 0.5 }, { value: 0.25 }],
		});

		expect(parent.querySelector("svg")).toBe(svg);
		expect(svg?.querySelector("path")).toBe(firstPath);
		expect(firstPath?.getAttribute("d")).not.toBe(originalPath);
		expect(firstPath?.getAttribute("stroke-width")).toBe("12");
	});

	it("recreates the SVG when the item count changes", () => {
		const parent = document.createElement("div");
		const chart = new DonutChart(parent, {
			items: [{ value: 0.5 }],
		});
		const originalSvg = parent.querySelector("svg");

		chart.update({
			items: [{ value: 0.5 }, { value: 0.5 }],
		});

		const updatedSvg = parent.querySelector("svg");
		expect(updatedSvg).not.toBe(originalSvg);
		expect(updatedSvg?.querySelectorAll("path")).toHaveLength(2);
	});

	it("recreates the SVG when toggling the background arc off", () => {
		const parent = document.createElement("div");
		const chart = new DonutChart(parent, {
			items: [{ value: 0.5 }],
		});
		const originalSvg = parent.querySelector("svg");

		chart.update({ partial: true });

		const updatedSvg = parent.querySelector("svg");
		expect(updatedSvg).not.toBe(originalSvg);
		expect(updatedSvg?.querySelectorAll("path")).toHaveLength(1);
	});
});
