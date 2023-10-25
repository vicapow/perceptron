import React from "react";
import { Group } from "@visx/group";
import { LinePath } from "@visx/shape";
import { scaleLinear } from "@visx/scale";
import { AxisLeft, AxisBottom } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { Point } from "./bezier";

export const background = "#f3f3f3";

export function heaviside(d: number): 0 | 1 {
  if (d < 0) {
    return 0;
  }
  return 1;
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
  domain: [-3, 3],
});
const yScale = scaleLinear<number>({ domain: [-0.3, 1.3], nice: true });

export type HeavisideProps = {
  width: number;
  height: number;
  input: number;
  showHInputLine: boolean;
};

export default function Theshold({
  width,
  height,
  input,
  showHInputLine,
}: HeavisideProps) {
  if (width < 10) return null;

  const margin = { top: 20, right: 15, bottom: 25, left: 20 };

  // bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  xScale.range([0, xMax]);
  yScale.range([yMax, 0]);

  const pInOffsetX = -43;

  const output = heaviside(input);

  const ip1 = [pInOffsetX, 17].join(" ");
  const ip2 = [pInOffsetX + 30, 17].join(" ");
  const ip3 = [xScale(input) - 10, 100].join(" ");
  const ip4 = [xScale(input), 30].join(" ");

  const pOutOffsetX = 43;

  const op1 = [xScale(3), yScale(output)].join(" ");
  const op2 = [yScale(3) + 100, yScale(output)].join(" ");
  const op3 = [pOutOffsetX, 17].join(" ");
  const op4 = [pOutOffsetX + 30, 17].join(" ");

  return (
    <Group left={margin.left} top={margin.top}>
      {showHInputLine ? (
        <path
          d={`M ${ip1} C ${ip2}, ${ip3}, ${ip4}`}
          className="stroke-sky-500"
          fill="transparent"
        />
      ) : null}
      <path
        d={`M ${op1} C ${op2}, ${op3}, ${op4}`}
        className="stroke-sky-500"
        fill="transparent"
      />
      <GridRows scale={yScale} width={xMax} height={yMax} stroke="#f0f0f0" />
      <GridColumns scale={xScale} width={xMax} height={yMax} stroke="#f0f0f0" />
      <line x1={xMax} x2={xMax} y1={0} y2={yMax} stroke="#e0e0e0" />
      <AxisBottom
        top={yMax}
        tickLength={2}
        scale={xScale}
        numTicks={2}
        tickLabelProps={{ fontSize: 5, dy: -4 }}
      />
      <AxisLeft
        scale={yScale}
        tickLength={2}
        numTicks={4}
        tickLabelProps={{ fontSize: 5, dx: -2, dy: 1.7 }}
      />
      <LinePath
        className="stroke-sky-500"
        data={
          [
            [-3, 0],
            [0, 0],
          ] as Array<Point>
        }
        x={(d) => xScale(x(d)) ?? 0}
        y={(d) => yScale(y(d)) ?? 0}
        strokeWidth={1}
      />
      {showHInputLine && (
        <LinePath
          className="stroke-sky-500"
          data={
            [
              [input, -0.4],
              [input, 1.4],
            ] as Array<Point>
          }
          x={(d) => xScale(d[0])}
          y={(d) => yScale(d[1])}
          strokeWidth={1}
          strokeDasharray={"1,2"}
        />
      )}
      <LinePath
        className="stroke-sky-500"
        data={
          [
            [-2.5, output],
            [2.5, output],
          ] as Array<Point>
        }
        x={(d) => xScale(d[0])}
        y={(d) => yScale(d[1])}
        strokeWidth={1}
        strokeDasharray={"1,2"}
      />
      <LinePath
        className="stroke-sky-500"
        data={
          [
            [0, 1],
            [3, 1],
          ] as Array<Point>
        }
        x={(d) => xScale(x(d)) ?? 0}
        y={(d) => yScale(y(d)) ?? 0}
        strokeWidth={1}
      />
      <circle
        className="stroke-sky-500"
        cx={xScale(0)}
        cy={yScale(0)}
        r="2"
        fill="white"
      />
      <circle
        className="stroke-sky-500 fill-sky-200"
        cx={xScale(0)}
        cy={yScale(1)}
        r="2"
      />
      {showHInputLine && (
        <circle
          className="stroke-sky-200 fill-sky-500"
          cx={xScale(input)}
          cy={yScale(output)}
          r="2"
        />
      )}
      <text fontSize="10" textAnchor="middle" x={xScale(0)} y={-5}>
        H
      </text>
    </Group>
  );
}
