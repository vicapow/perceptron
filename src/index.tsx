// @ts-ignore
window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { isDisabled: true };

import "./index.css";
import "flowbite";
import * as React from "react";
import ReactDOM from "react-dom/client";
// import { RangeSlider } from "flowbite-react";
import { interpolateBezier, Point } from "./bezier";
import { EditableNode } from "./EditableNode";

type NetworkState = {
  inputs: Array<{ value: number; editable: boolean }>;
  weights: Array<{ value: number; editable: boolean }>;
  outputs: Array<{ editable: boolean }>;
};

function networkOutput(network: NetworkState) {
  let outputValue = 0;
  for (let i = 0; i < network.inputs.length; i++) {
    const input = network.inputs[i]!.value;
    outputValue = outputValue + input * network.weights[i]!.value;
  }
  return outputValue;
}

function Perceptron({
  network,
  onChangeNetwork,
}: {
  network: NetworkState;
  onChangeNetwork: (network: NetworkState) => void;
}) {
  const [width, height] = [400, 200];
  const rInputs = Math.min(
    (height / (network.inputs.length + 1) / 2) * 0.5,
    20,
  );
  const rOutputs = Math.min(
    (height / (network.outputs.length + 1) / 2) * 0.5,
    20,
  );

  const inputs = network.inputs.map((input, index) => ({
    x: 100,
    y: (height / (network.inputs.length + 1)) * (index + 1),
    r: rInputs,
    value: input.value,
    editable: input.editable,
  }));

  const outputs = network.outputs.map((_, index) => ({
    x: width - 100,
    y: (height / (network.outputs.length + 1)) * (index + 1),
    r: rOutputs,
  }));

  const pCO = 100;

  const pathControls: Array<{ p1: Point; p2: Point; p3: Point; p4: Point }> =
    inputs.map((input) => {
      return {
        p1: [input.x, input.y],
        p2: [input.x + pCO, input.y],
        p3: [outputs[0]!.x - pCO, outputs[0]!.y],
        p4: [outputs[0]!.x, outputs[0]!.y],
      };
    });

  const weights = network.weights.map((weight, index) => {
    const path = pathControls[index]!;
    const point = interpolateBezier(path.p1, path.p2, path.p3, path.p4, 0.3);
    return { loc: point, value: weight.value, editable: weight.editable };
  });

  let outputValue = networkOutput(network);

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${width} ${height}`}>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="rgba(0, 0, 0, 0.02)"
      />
      {pathControls.map((path, index) => {
        const p1 = path.p1.join(" ");
        const p2 = path.p2.join(" ");
        const p3 = path.p3.join(" ");
        const p4 = path.p4.join(" ");
        return (
          <path
            key={index}
            d={`M ${p1} C ${p2}, ${p3}, ${p4}`}
            className="stroke-sky-500"
            fill="transparent"
          />
        );
      })}
      {inputs.map(({ x, y, r, value, editable }, index) => (
        <EditableNode
          editable={editable}
          cx={x}
          cy={y}
          r={r}
          minValue={0}
          maxValue={1}
          fontSize={r * 0.9}
          className="fill-sky-100 stroke-sky-500"
          textClassName="fill-sky-300"
          key={index}
          value={value}
          onChange={({ value }) => {
            const inputs = [...network.inputs];
            inputs[index] = { ...inputs[index]!, value: value };
            onChangeNetwork({ ...network, inputs });
          }}
        />
      ))}
      {weights.map(({ loc, value, editable }, index) => {
        return (
          <EditableNode
            editable={editable}
            cx={loc[0]}
            cy={loc[1]}
            r={rInputs}
            minValue={-100}
            maxValue={100}
            fontSize={rInputs * 0.9}
            className="fill-amber-200 stroke-amber-400"
            textClassName="fill-amber-400"
            key={index}
            value={value}
            onChange={({ value }) => {
              const weights = [...network.weights];
              weights[index] = { ...weights[index]!, value };
              onChangeNetwork({ ...network, weights });
            }}
          />
        );
      })}
      {outputs.map(({ x, y, r }, index) => {
        let fontSize = 15;
        return (
          <g transform={`translate(${x},${y})`}>
            <circle
              key={index}
              r={r}
              className="fill-pink-500 stroke-pink-200"
            />
            <text
              y={fontSize * 0.4}
              fontSize={15}
              className="fill-pink-200"
              style={{ pointerEvents: "none", userSelect: "none" }}
              textAnchor="middle"
            >
              {Math.round(outputValue * 100) / 100}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function AndGatePerceptron() {
  const [network, setNetwork] = React.useState<NetworkState>({
    inputs: [
      { value: 0, editable: true },
      { value: 0, editable: true },
      { value: 1, editable: false },
    ],
    weights: [
      { value: 1, editable: false },
      { value: 1, editable: false },
      { value: -1, editable: false },
    ],
    outputs: [{ editable: false }],
  });
  return <Perceptron network={network} onChangeNetwork={setNetwork} />;
}

function OrGatePerceptron() {
  const [network, setNetwork] = React.useState<NetworkState>({
    inputs: [
      { value: 0, editable: true },
      { value: 0, editable: true },
      { value: 1, editable: false },
    ],
    weights: [
      { value: 2, editable: false },
      { value: 2, editable: false },
      { value: -1, editable: false },
    ],
    outputs: [{ editable: false }],
  });
  return <Perceptron network={network} onChangeNetwork={setNetwork} />;
}

function NotGatePerceptron() {
  const [network, setNetwork] = React.useState<NetworkState>({
    inputs: [
      { value: 0, editable: true },
      { value: 1, editable: false },
    ],
    weights: [
      { value: -1, editable: false },
      { value: 1, editable: false },
    ],
    outputs: [{ editable: false }],
  });
  return <Perceptron network={network} onChangeNetwork={setNetwork} />;
}

export default function Example() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            The Perceptron
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            To LLMs that can pass the bar exam, to Reenforcement Learning
            alogrithms that can play video games, the foundational concept in
            all these are the perceptron.
          </p>
          <div className="mx-auto">
            <p className="mt-6 text-lg leading-8 text-gray-600">
              This is an AND gate perceptron.
            </p>
            <AndGatePerceptron />
          </div>
          <div className="mx-auto">
            <p className="mt-6 text-lg leading-8 text-gray-600">
              This is an OR gate perceptron.
            </p>
            <OrGatePerceptron />
          </div>
          <div className="mx-auto">
            <p className="mt-6 text-lg leading-8 text-gray-600">
              The is a NOT gate perceptron.
            </p>
            <NotGatePerceptron />
          </div>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<Example />);
