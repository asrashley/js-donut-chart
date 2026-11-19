import esbuild from "rollup-plugin-esbuild";

export default {
	input: "src/donut-chart.ts",
	plugins: [esbuild({ target: "es2022" })],
	output: [
		{ file: "dist/donut-chart.js", format: "es" },
		{
			file: "dist/donut-chart.umd.cjs",
			format: "umd",
			name: "DonutChartLibrary",
		},
	],
};
