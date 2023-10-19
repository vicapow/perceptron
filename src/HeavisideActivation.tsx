import React from "react";
import { Group } from "@visx/group";
import { LinePath } from "@visx/shape";
import { scaleLinear } from "@visx/scale";
import { AxisLeft, AxisBottom } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { CityTemperature } from "@visx/mock-data/lib/mocks/cityTemperature";

export const background = "#f3f3f3";

const cityTemperature: Array<CityTemperature> = [
  {
    date: "1",
    "New York": "63.4",
    "San Francisco": "62.7",
    Austin: "72.2",
  },
  {
    date: "2",
    "New York": "58.0",
    "San Francisco": "59.9",
    Austin: "67.7",
  },
  {
    date: "3",
    "New York": "53.3",
    "San Francisco": "59.1",
    Austin: "69.4",
  },
];

// accessors
const date = (d: CityTemperature) => Number(d.date);
const ny = (d: CityTemperature) => Number(d["New York"]);
const sf = (d: CityTemperature) => Number(d["San Francisco"]);

// scales
const xScale = scaleLinear<number>({
  domain: [
    Math.min(...cityTemperature.map(date)),
    Math.max(...cityTemperature.map(date)),
  ],
});
const yScale = scaleLinear<number>({
  domain: [
    Math.min(...cityTemperature.map((d) => Math.min(ny(d), sf(d)))),
    Math.max(...cityTemperature.map((d) => Math.max(ny(d), sf(d)))),
  ],
  nice: true,
});

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
        <GridRows scale={yScale} width={xMax} height={yMax} stroke="#e0e0e0" />
        <GridColumns
          scale={xScale}
          width={xMax}
          height={yMax}
          stroke="#e0e0e0"
        />
        <line x1={xMax} x2={xMax} y1={0} y2={yMax} stroke="#e0e0e0" />
        <AxisBottom top={yMax} scale={xScale} numTicks={width > 520 ? 10 : 5} />
        <AxisLeft scale={yScale} />
        <text x="-70" y="15" transform="rotate(-90)" fontSize={10}>
          Y Axis
        </text>
        <LinePath
          data={cityTemperature}
          x={(d) => xScale(date(d)) ?? 0}
          y={(d) => yScale(ny(d)) ?? 0}
          stroke="#222"
          strokeWidth={1.5}
        />
      </Group>
    </g>
  );
}
