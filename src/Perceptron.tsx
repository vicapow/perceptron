import * as React from "react";
import { interpolateBezier, Point } from "./bezier";
import { EditableNode } from "./EditableNode";
import HeavisideActivation, { heaviside } from "./HeavisideActivation";

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

export function Perceptron({
  network,
  onChangeNetwork,
  content,
}: {
  network: NetworkState;
  onChangeNetwork: (network: NetworkState) => void;
  content?: (width: number, height: number) => React.ReactNode;
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
    x: 50,
    y: (height / (network.inputs.length + 1)) * (index + 1),
    r: rInputs,
    value: input.value,
    editable: input.editable,
  }));

  const outputs = network.outputs.map((_, index) => ({
    x: width - 190,
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
    const point = interpolateBezier(path.p1, path.p2, path.p3, path.p4, 0.4);
    return { loc: point, value: weight.value, editable: weight.editable };
  });

  let outputValue = networkOutput(network);

  return (
    <svg viewBox={`0 0 ${width} ${height}`}>
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
        let fontSize = 12;
        return (
          <g transform={`translate(${x},${y})`} key={index}>
            <circle
              key={index}
              r={r * 0.8}
              className="fill-pink-500 stroke-pink-200"
            />
            <text
              y={fontSize * 0.4}
              fontSize={fontSize}
              className="fill-pink-200"
              style={{ pointerEvents: "none", userSelect: "none" }}
              textAnchor="middle"
            >
              {Math.round(outputValue * 100) / 100}
            </text>
          </g>
        );
      })}
      <g transform="translate(250, 63)">
        <HeavisideActivation width={75} height={75} input={outputValue} />
      </g>
      <g transform={`translate(360,${height / 2})`}>
        <circle r={rOutputs * 0.8} className="fill-pink-500 stroke-pink-200" />
        <text
          y={15 * 0.4}
          fontSize={15}
          className="fill-pink-200"
          style={{ pointerEvents: "none", userSelect: "none" }}
          textAnchor="middle"
        >
          {Math.round(heaviside(outputValue) * 100) / 100}
        </text>
      </g>
      {content ? content(width, height) : null}
    </svg>
  );
}

function AndGate(props: {
  size: number;
  input1: number;
  input2: number;
  output: number;
}) {
  const { size, input1, input2, output } = props;
  return (
    <g>
      <path
        d={`M 0 -${size / 2}, l ${size / 2} 0 c ${size * 0.75} 0, ${
          size * 0.75
        } ${size}, 0 ${size} l -${size / 2} 0 l 0 -${size}`}
        className="stroke-gray-500 fill-gray-200"
      />
      <path
        d={`M 0 ${size / 4}, l -${size / 2} 0`}
        className="stroke-gray-500"
      />
      <path
        d={`M 0 -${size / 4}, l -${size / 2} 0`}
        className="stroke-gray-500"
      />
      <path
        d={`M ${size * 1.05} 0, l ${size / 2} 0`}
        className="stroke-gray-500"
      />
      <circle cx={-size / 2} cy={size * -0.25} r={(input1 / 1) * size * 0.2} />
      <circle cx={-size / 2} cy={size * 0.25} r={(input2 / 1) * size * 0.2} />
      <circle cx={size * 1.5} cy={0} r={(output / 1) * size * 0.2} />
    </g>
  );
}

export function AndGatePerceptron() {
  const [network, setNetwork] = React.useState<NetworkState>({
    inputs: [
      { value: 0, editable: true },
      { value: 0, editable: true },
      { value: 1, editable: false },
    ],
    weights: [
      { value: 0.5, editable: false },
      { value: 0.5, editable: false },
      { value: 0.8, editable: false },
    ],
    outputs: [{ editable: false }],
  });
  let outputValue = heaviside(networkOutput(network));
  return (
    <Perceptron
      network={network}
      onChangeNetwork={setNetwork}
      content={(width) => {
        return (
          <g transform={`translate(${width - 90}, ${20})`}>
            <AndGate
              size={30}
              input1={network.inputs[0]!.value}
              input2={network.inputs[1]!.value}
              output={outputValue}
            />
          </g>
        );
      }}
    />
  );
}

export function OrGatePerceptron() {
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

export function NotGatePerceptron() {
  const [network, setNetwork] = React.useState<NetworkState>({
    inputs: [
      { value: 0, editable: true },
      { value: 1, editable: false },
    ],
    weights: [
      { value: -1, editable: false },
      { value: 0.5, editable: false },
    ],
    outputs: [{ editable: false }],
  });
  return <Perceptron network={network} onChangeNetwork={setNetwork} />;
}
