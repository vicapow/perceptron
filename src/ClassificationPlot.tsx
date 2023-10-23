import * as React from "react";
import { Group } from "@visx/group";
import { LinePath } from "@visx/shape";
import { scaleLinear } from "@visx/scale";
import { AxisLeft, AxisBottom } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { NetworkState, networkOutput } from "./Perceptron";
import { heaviside } from "./HeavisideActivation";
import { Point } from "./bezier";

const xScale = scaleLinear<number>({ domain: [0, 1] });
const yScale = scaleLinear<number>({ domain: [0, 1] });

type Props = {
  network: NetworkState;
  width: number;
  height: number;
};

export default class ClassiciationPlot extends React.PureComponent<Props> {
  override render() {
    return <ClassificationPlotInternal {...this.props} />;
  }
}

function ClassificationPlotInternal(props: Props) {
  const xMax = props.width;
  const yMax = props.height;

  xScale.range([0, xMax]);
  yScale.range([yMax, 0]);

  const data = [];
  const resolution = 10;
  const inputA = { ...props.network.inputs[0]! };
  const inputB = { ...props.network.inputs[1]! };
  const network: NetworkState = {
    ...props.network,
    inputs: [inputA, inputB, ...props.network.inputs.slice(2)],
  };
  const numInputs = network.inputs.length - 1;
  for (let i = 0; i <= resolution; i++) {
    if (numInputs <= 1) {
      const a = i / resolution;
      const b = 0.5;
      inputA.value = a;
      const output = heaviside(networkOutput(network));
      data.push([a, b, output]);
    } else {
      for (let j = 0; j <= resolution; j++) {
        const a = i / resolution;
        const b = j / resolution;
        inputA.value = a;
        inputB.value = b;
        const output = heaviside(networkOutput(network));
        data.push([a, b, output]);
      }
    }
  }

  return (
    <Group>
      <GridRows scale={yScale} width={xMax} height={yMax} stroke="#f0f0f0" />
      <GridColumns scale={xScale} width={xMax} height={yMax} stroke="#f0f0f0" />
      {numInputs > 1 ? (
        <AxisLeft
          label={inputB.label || ""}
          labelOffset={0}
          labelProps={{
            fontSize: 8,
            textAnchor: "middle",
            transform: "translate(34, 55), rotate(0)",
            className: "fill-sky-500",
          }}
          scale={yScale}
          tickLength={2}
          numTicks={2}
          tickLabelProps={{ fontSize: 5, dx: -2, dy: 1.7 }}
        />
      ) : null}
      <AxisBottom
        label={inputA.label || ""}
        labelOffset={-5}
        labelProps={{
          fontSize: 8,
          textAnchor: "middle",
          className: "fill-sky-500",
        }}
        top={yMax}
        tickLength={2}
        scale={xScale}
        numTicks={2}
        tickLabelProps={{ fontSize: 5, dy: -4 }}
      />
      {data.map((datum, index) => {
        return (
          <circle
            key={index}
            cx={xScale(datum[0]!)}
            cy={yScale(datum[1]!)}
            r={2}
            className={datum[2] === 1 ? "fill-lime-400" : "fill-orange-400"}
          />
        );
      })}
      <LinePath
        className="stroke-sky-500"
        data={
          [
            [props.network.inputs[0]!.value, 0],
            [props.network.inputs[0]!.value, 1],
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
            [0, numInputs === 1 ? 0.5 : props.network.inputs[1]!.value],
            [1, numInputs === 1 ? 0.5 : props.network.inputs[1]!.value],
          ] as Array<Point>
        }
        x={(d) => xScale(d[0])}
        y={(d) => yScale(d[1])}
        strokeWidth={1}
        strokeDasharray={"1,2"}
      />
      <circle
        className="stroke-sky-500"
        cx={xScale(props.network.inputs[0]!.value)}
        cy={
          numInputs === 1 ? yScale(0.5) : yScale(props.network.inputs[1]!.value)
        }
        r={2}
        fill="transparent"
      />
    </Group>
  );
}
