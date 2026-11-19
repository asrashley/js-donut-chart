# Lightweight Doughnut Chart Library for JavaScript

This is a very simple library without bells and whistles, it has no
dependencies.

It generates a SVG figure for the browser to render, and that's all it does.

## Build

The TypeScript source is in `src/donut-chart.ts`. Install the development
dependencies and run `npm run build` to generate ESM and UMD builds,
along with TypeScript declarations, in `dist/`.

```sh
nvm use  # optional - if not using nvm, install node.js
npm ci
npm run build
```

The ESM build is available as `dist/donut-chart.js`. The UMD build is available as `dist/donut-chart.umd.cjs`. In a browser,
it exposes `DonutChart` as `DonutChartLibrary.DonutChart`.

## Usage

If using ESM modules:

```javascript
import { DonutChart } from './dist/donut-chart.js';
```

Is using `<script>` imports:

```html
<script type="text/javascript" src="./dist/donut-chart.umd.cjs"></script>
<script>const { DonutChart } = DonutChartLibrary;</script>
```

The API is very simple. First you need to find an element to insert the graph on, e.g.:

```javascript
const chart_div = document.getElementById("mychart")
```

Then you instantiate the class:

```javascript
const mychart = new DonutChart(chart_div, {
    r: 60,
    stroke: 16,
    items: [
        { label: "A", value: .2 },
        { label: "B", value: .1 },
        { label: "C", value: .5 },
    ]
 });
```
The following option are supported:

|property |  type   |description
|---------|---------|-----------
| r       | number  | radius (in pixels)
| stroke  | number  | width of arc (in pixels)
| height  | number  | (optional) SVG height (in pixels)
| width   | number  | (optional) SVG width (in pixels)
| rotate  | boolean | (optional) if true, diagram starts at top, otherwise left horizontal axis
| mirror  | boolean | (optional) mirror about the vertical axis
| partial | boolean | (optional) if true and sum(values) < 1, an extra arc is added
| items  | array  | data for the graph.

The sum of all values in `items` must be less than or equal to 1. If the sum is less than one, `DonutChart` will automatically add an extra arc that completes the circle. If the `partial` property is present and set to `false`, this additional arc will not be generated.

If you need to, you can update the values:

```javascript
mychart.update({
    items: [
        { label: "J", value: .4 },
        { label: "Q", value: .3 },
    ]
});
```

## Examples

See [test.html](./test.html) for examples of creating complete and partial doughnut graphs.

Have fun!
