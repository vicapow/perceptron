import React from "react";
import { Group } from "@visx/group";
import { LinePath } from "@visx/shape";
import { scaleLinear } from "@visx/scale";
import { AxisLeft, AxisBottom } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { Point } from "./bezier";

export const background = "#f3f3f3";

function heaviside(d: number) {
  if (d < 0) {
    return 0;
  }
  if (d > 0) {
    return 1;
  }
  return 0.5;
}

const data: Array<Point> = [];

let start = -2;
let end = 2;
let samples = 100;
for (let i = 0; i < samples; i++) {
  let step = (end - start) / (samples - 1);
  let input = start + step * i;
  data.push([input, heaviside(input)]);
}

// accessors
const x = (d: Point) => Number(d[0]);
const y = (d: Point) => Number(d[1]);

// scales
const xScale = scaleLinear<number>({
  domain: [-2, 2],
});
const yScale = scaleLinear<number>({ domain: [-0.5, 1.5], nice: true });

const defaultMargin = { top: 40, right: 30, bottom: 50, left: 40 };

export type ThresholdProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
};

export default function Theshold({
  width,
  height,
  margin = defaultMargin,
}: ThresholdProps) {
  if (width < 10) return null;

  // bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  xScale.range([0, xMax]);
  yScale.range([yMax, 0]);

  return (
    <g>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="transparent"
        rx={14}
      />
      <Group left={margin.left} top={margin.top}>
        <GridRows scale={yScale} width={xMax} height={yMax} stroke="#f0f0f0" />
        <GridColumns
          scale={xScale}
          width={xMax}
          height={yMax}
          stroke="#f0f0f0"
        />
        <line x1={xMax} x2={xMax} y1={0} y2={yMax} stroke="#e0e0e0" />
        <AxisBottom top={yMax} scale={xScale} numTicks={width > 520 ? 10 : 5} />
        <AxisLeft scale={yScale} />
        <text x="-70" y="15" transform="rotate(-90)" fontSize={10}>
          Y Axis
        </text>
        <LinePath
          className="stroke-sky-500"
          data={
            [
              [-2, 0],
              [0, 0],
            ] as Array<Point>
          }
          x={(d) => xScale(x(d)) ?? 0}
          y={(d) => yScale(y(d)) ?? 0}
          strokeWidth={1.5}
        />
        <LinePath
          className="stroke-sky-500"
          data={
            [
              [0, 1],
              [2, 1],
            ] as Array<Point>
          }
          x={(d) => xScale(x(d)) ?? 0}
          y={(d) => yScale(y(d)) ?? 0}
          strokeWidth={1.5}
        />
        <circle
          className="stroke-sky-500"
          cx={xScale(0)}
          cy={yScale(0)}
          r="4"
          fill="white"
        />
        <circle
          className="stroke-sky-500"
          cx={xScale(0)}
          cy={yScale(1)}
          r="4"
          fill="white"
        />
        <circle
          className="stroke-sky-500 fill-sky-200"
          cx={xScale(0)}
          cy={yScale(0.5)}
          r="4"
        />
      </Group>
    </g>
  );
}
