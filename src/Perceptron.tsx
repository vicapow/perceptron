import * as React from "react";
import { interpolateBezier, Point } from "./bezier";
import { EditableNode } from "./EditableNode";
import HeavisideActivation, { heaviside } from "./HeavisideActivation";
import ClassificationPlot from "./ClassificationPlot";
import subscript from "./subscript";
import { InputPill, HOutPill, WeightPill } from "./Pill";
import { RangeSlider } from "flowbite-react";

export type Input = {
  readonly value: number;
  readonly editable: boolean;
  readonly label?: string;
};
export type Weight = Input;

export type NetworkState = {
  readonly inputs: ReadonlyArray<Input>;
  readonly weights: ReadonlyArray<Weight>;
  readonly outputs: ReadonlyArray<{ editable: boolean }>;
};

export const NOT_GATE_NETWORK = {
  inputs: [
    { value: 0, editable: true, label: "X₁" },
    { value: 1, editable: false, label: "1" },
  ],
  weights: [
    { value: -1, editable: false },
    { value: 0.5, editable: false },
  ],
  outputs: [{ editable: false }],
};

export const OR_GATE_NETWORK = {
  inputs: [
    { value: 0, editable: true, label: "X₁" },
    { value: 0, editable: true, label: "X₂" },
    { value: 1, editable: false, label: "1" },
  ],
  weights: [
    { value: 2, editable: true },
    { value: 2, editable: true },
    { value: -1, editable: true },
  ],
  outputs: [{ editable: false }],
};

export const OR_GATE_DATA = [
  [0, 0, 0],
  [0, 1, 1],
  [1, 0, 1],
  [1, 1, 1],
];

function round(a: number) {
  return Math.round(a * 100) / 100;
}

function setWeights(network: NetworkState, value: number): NetworkState {
  let weights: Array<Weight> = [];
  for (let i = 0; i < network.weights.length; i++) {
    weights.push({
      ...network.weights[i]!,
      value,
    });
  }
  return {
    ...network,
    weights,
  };
}

export function zeroWeights(network: NetworkState): NetworkState {
  return setWeights(network, 0);
}

export function networkOutput(network: NetworkState) {
  let outputValue = 0;
  for (let i = 0; i < network.inputs.length; i++) {
    const input = network.inputs[i]!.value;
    const weight = network.weights[i]!.value;
    outputValue += input * weight;
  }
  return outputValue;
}

export function modifyInputs(
  inputVals: ReadonlyArray<number>,
  network: NetworkState,
): NetworkState {
  const inputs: Array<Input> = [];
  for (let i = 0; i < network.inputs.length; i++) {
    const input = network.inputs[i]!;
    let value = input.value;
    if (i < inputVals.length) {
      value = inputVals[i]!;
    }
    inputs.push({ ...input, value });
  }
  return { ...network, inputs };
}

export function PerceptronWithExtraContent(props: {
  network: NetworkState;
  onChangeNetwork: (network: NetworkState) => void;
  content?: (width: number, height: number) => React.ReactNode;
  showTease: boolean;
  hideTease: () => void;
}) {
  const [containerWidth, containerHeight] = [400, 260];
  const [width, height] = [400, 200];
  return (
    <svg viewBox={`0 0 ${containerWidth} ${containerHeight}`}>
      <rect
        x={0}
        y={0}
        width={containerWidth}
        height={containerHeight}
        fill="rgba(0, 0, 0, 0.02)"
      />
      <g transform={`translate(0, ${containerHeight - height})`}>
        <Perceptron {...{ ...props, width, height }} />
      </g>
      {props.content ? props.content(width, height) : null}
    </svg>
  );
}

type PerceptronAloneProps = {
  network: NetworkState;
  onChangeNetwork: (network: NetworkState) => void;
  content?: (width: number, height: number) => React.ReactNode;
  showTease: boolean;
};

export class PerceptronAlone extends React.PureComponent<PerceptronAloneProps> {
  override render() {
    return <PerceptronAloneInternal {...this.props} />;
  }
}

function PerceptronAloneInternal(props: PerceptronAloneProps) {
  const [wC, hC] = [400, 160];
  const [width, height] = [400, 200];
  return (
    <svg viewBox={`0 0 ${wC} ${hC}`}>
      <rect x={0} y={0} width={wC} height={hC} fill="rgba(0, 0, 0, 0.02)" />
      <g transform={`translate(0, ${hC / 2 - height / 2})`}>
        <Perceptron {...{ ...props, width, height }} />
      </g>
    </svg>
  );
}

export function Perceptron({
  network,
  onChangeNetwork,
  showTease,
  width,
  height,
}: {
  network: NetworkState;
  onChangeNetwork: (network: NetworkState) => void;
  showTease: boolean;
  width: number;
  height: number;
}) {
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
    label: input.label,
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
    <g>
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
      {inputs.map(({ x, y, r, value, label, editable }, index) => (
        <EditableNode
          editable={editable}
          showTease={showTease}
          cx={x}
          cy={y}
          r={r}
          minValue={0}
          maxValue={1}
          fontSize={r * 0.9}
          className="fill-sky-100 stroke-sky-500"
          textClassName="fill-sky-300"
          key={index}
          label={label || ""}
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
            showTease={showTease}
          />
        );
      })}
      {weights.map((_, index) => {
        const path = pathControls[index]!;
        const point = interpolateBezier(
          path.p1,
          path.p2,
          path.p3,
          path.p4,
          0.15,
        );
        return (
          <text
            key={index}
            x={point[0]}
            y={point[1] - 3}
            textAnchor="middle"
            fontSize={8}
            className="fill-gray-400"
          >
            ×
          </text>
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
              {round(outputValue)}
            </text>
          </g>
        );
      })}
      <g transform="translate(250, 63)">
        <HeavisideActivation width={75} height={75} input={outputValue} />
      </g>
      <g transform={`translate(360,${height / 2})`}>
        <circle
          r={rOutputs * 0.8}
          className={
            heaviside(outputValue) >= 1 ? "fill-lime-400" : "fill-orange-400"
          }
        />
        <text
          y={15 * 0.4}
          fontSize={15}
          fill="white"
          style={{ pointerEvents: "none", userSelect: "none" }}
          textAnchor="middle"
        >
          {heaviside(outputValue)}
        </text>
      </g>
    </g>
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

export function AndGatePerceptron(props: {
  showTease: boolean;
  hideTease: () => void;
}) {
  const [network, setNetwork] = React.useState<NetworkState>({
    inputs: [
      { value: 0, editable: true, label: "X₁" },
      { value: 0, editable: true, label: "X₂" },
      { value: 1, editable: false, label: "1" },
    ],
    weights: [
      { value: 1, editable: false, label: "W₁" },
      { value: 1, editable: false, label: "W₂" },
      { value: -1.5, editable: false, label: "b" },
    ],
    outputs: [{ editable: false }],
  });
  let outputValue = heaviside(networkOutput(network));
  return (
    <PerceptronWithExtraContent
      showTease={props.showTease}
      hideTease={props.hideTease}
      network={network}
      onChangeNetwork={setNetwork}
      content={(width) => {
        return (
          <>
            <g transform={`translate(${width - 180}, ${20})`}>
              <AndGate
                size={30}
                input1={network.inputs[0]!.value}
                input2={network.inputs[1]!.value}
                output={outputValue}
              />
            </g>
            <g transform="translate(25, 10)">
              <ClassificationPlot width={50} height={50} network={network} />
            </g>
          </>
        );
      }}
    />
  );
}

export function OrGatePerceptron(props: {
  showTease: boolean;
  hideTease: () => void;
}) {
  const [network, setNetwork] = React.useState<NetworkState>(OR_GATE_NETWORK);
  return (
    <PerceptronWithExtraContent
      network={network}
      showTease={props.showTease}
      hideTease={props.hideTease}
      onChangeNetwork={setNetwork}
      content={() => {
        return (
          <g transform="translate(25, 10)">
            <ClassificationPlot width={50} height={50} network={network} />
          </g>
        );
      }}
    />
  );
}

export function NetworkWithClassificationPlot(props: {
  showTease: boolean;
  hideTease: () => void;
  network: NetworkState;
  setNetwork: (network: NetworkState) => void;
}) {
  return (
    <PerceptronWithExtraContent
      showTease={props.showTease}
      hideTease={props.hideTease}
      network={props.network}
      onChangeNetwork={props.setNetwork}
      content={() => {
        return (
          <g transform="translate(25, 10)">
            <ClassificationPlot
              width={50}
              height={50}
              network={props.network}
            />
          </g>
        );
      }}
    />
  );
}

type Step = {
  row: ReadonlyArray<number>;
  dj: number;
  yj: number;
  ej: number;
  deltas: Array<number>;
};

type Epoch = {
  steps: Array<Step>;
};

function trainingHistory(
  network: NetworkState,
  data: ReadonlyArray<ReadonlyArray<number>>,
  r: number,
) {
  let network1 = {
    ...network,
    weights: network.weights.map((w) => ({ ...w, value: 0 })),
  };
  let error = 1;
  let threshold = 1;
  const MAX_ITERATIONS = 10;
  let iteration = 0;
  const weights: Array<number> = [];
  for (let i = 0; i < network1.weights.length; i++) {
    weights.push(0);
  }
  const history: Array<{
    iteration: number;
    epoch: Epoch;
    network: NetworkState;
  }> = [];
  while (error >= threshold && iteration < MAX_ITERATIONS) {
    const epoch: Epoch = { steps: [] };
    error = 0;
    for (let i = 0; i < network1.weights.length; i++) {
      weights[i] = 0;
    }
    for (const row of data) {
      const step: Step = { dj: 0, yj: 0, ej: 0, deltas: [], row: [] };
      const dj = row[row.length - 1] as 0 | 1;
      const network2 = modifyInputs(row.slice(0, -1), network1);
      const yj = heaviside(networkOutput(network2));
      const ej = dj - yj;
      error += Math.abs(ej);
      for (let i = 0; i < network1.weights.length; i++) {
        const xji = network2.inputs[i]!;
        const delta = r * ej * xji.value;
        weights[i] += delta;
        step.deltas.push(delta);
      }
      step.row = row;
      step.dj = dj;
      step.yj = yj;
      step.ej = ej;
      epoch.steps.push(step);
    }
    history.push({
      iteration,
      epoch,
      network: network1,
    });
    // update network with new weights
    network1 = {
      ...network1,
      weights: network1.weights.map((w, index) => ({
        ...w,
        value: w.value + weights[index]!,
      })),
    };
    iteration++;
  }
  return history;
}

type ComputedWeightsProps = {
  network: NetworkState;
  data: ReadonlyArray<ReadonlyArray<number>>;
};

export class ComputedWeights extends React.PureComponent<
  ComputedWeightsProps,
  { historyIndex: number; r: number }
> {
  constructor(props: ComputedWeightsProps) {
    super(props);
    this.state = {
      historyIndex: 0,
      r: 0.1,
    };
  }
  override render() {
    const histories = trainingHistory(
      this.props.network,
      this.props.data,
      this.state.r,
    );
    let historyIndex = this?.state?.historyIndex || 0;
    if (historyIndex + 1 > histories.length) {
      historyIndex = histories.length - 1;
    }
    const history = histories[historyIndex];
    const nextHistory = histories[historyIndex + 1];
    return (
      <div>
        <h4 className="text-lg text-left mt-10">
          Epoch {historyIndex + 1} (aka, one time updating the weights by going
          through all the data).
        </h4>
        <RangeSlider
          id={`epoch-slider`}
          min={0}
          max={histories.length - 1}
          step="1"
          value={historyIndex}
          onChange={(e) => {
            this.setState({ historyIndex: Number(e.target.value) });
          }}
        />
        <div>
          The current weight values{" "}
          {history &&
            history.network.weights.map((w, i) => {
              return (
                <React.Fragment key={i}>
                  <WeightPill>W{subscript(i + 1)}</WeightPill> ={" "}
                  {round(w.value)}{" "}
                </React.Fragment>
              );
            })}
        </div>
        <table className="mx-auto w-full">
          <tbody>
            <tr>
              <td>
                <InputPill>X{subscript(1)}</InputPill>
              </td>
              <td>
                <InputPill>X{subscript(2)}</InputPill>
              </td>
              <td>
                <b>Target (T)</b>
              </td>
              <td>
                <b>Predicted (P)</b>
              </td>
              <td>
                <b>Error (T - P)</b>
              </td>
              <td>
                <WeightPill>W{subscript(1)}Δ</WeightPill>
              </td>
              <td>
                <WeightPill>W{subscript(2)}Δ</WeightPill>
              </td>
              <td>
                <WeightPill>W{subscript(3)}Δ</WeightPill>
              </td>
            </tr>
            {history &&
              history.epoch.steps.map((step, index) => {
                return (
                  <tr key={index}>
                    {step.row.map((data, index) => (
                      <td key={index}>
                        {index + 1 < step.row.length ? (
                          <InputPill>{data}</InputPill>
                        ) : (
                          <HOutPill value={data as 0 | 1} />
                        )}
                      </td>
                    ))}
                    <td>{<HOutPill value={step.yj as 0 | 1} />}</td>
                    <td>{step.ej}</td>
                    {step.deltas.map((data, index) => (
                      <td key={index}>{data}</td>
                    ))}
                  </tr>
                );
              })}
          </tbody>
        </table>
        <div>
          {nextHistory ? (
            <>
              <p>
                After this epoch, the new weight values will be{" "}
                {nextHistory.network.weights.map((w, i) => {
                  return (
                    <React.Fragment key={i}>
                      <WeightPill>W{subscript(i + 1)}</WeightPill> ={" "}
                      {round(w.value)}{" "}
                    </React.Fragment>
                  );
                })}
              </p>
            </>
          ) : (
            <p>No weights were changed. We're done!</p>
          )}
        </div>
        <p className="text-left">Learning rate: {this.state.r}</p>
        <RangeSlider
          id={`learning-rate`}
          min={0.1}
          max={0.9}
          step="0.1"
          value={this.state.r}
          onChange={(e) => {
            this.setState({ r: Number(e.target.value) });
          }}
        />
        {history && (
          <svg viewBox="0 0 300 130">
            <g transform="translate(100,10)">
              <ClassificationPlot
                width={100}
                height={100}
                network={history.network}
              />
            </g>
          </svg>
        )}
      </div>
    );
  }
}
