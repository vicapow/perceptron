// @ts-ignore
window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { isDisabled: true };

import "./index.css";
import "flowbite";
import * as React from "react";
import ReactDOM from "react-dom/client";
import { heaviside } from "./HeavisideActivation";
import ClassificationPlot from "./ClassificationPlot";
import { RangeSlider } from "flowbite-react";
import {
  PerceptronAlone,
  NetworkState,
  NOT_GATE_NETWORK,
  OR_GATE_NETWORK,
  OR_GATE_DATA,
  zeroWeights,
  networkOutput,
  modifyInputs,
  Input,
  ComputedWeights,
} from "./Perceptron";
import { IntroNeuron } from "./IntroNeuron";
import subscript from "./subscript";
import { InputPill, OutputPill, WeightPill, HOutPill } from "./Pill";

type ObjectKeys<T> = { [K in keyof T]: K };

type AppState = {
  notGateNetwork: NetworkState;
  orGateNetwork: NetworkState;
  showTease: boolean;
};

type NetworkName = keyof Omit<ObjectKeys<AppState>, "showTease">;

type AppStateAndNetwork = {
  appState: AppState;
  setAppState: (appState: AppState) => void;
  networkName: NetworkName;
};

function arraysEqual<T>(
  a: ReadonlyArray<T>,
  b: ReadonlyArray<T>,
  check: (x: T, y: T) => boolean = (x, y) => x === y,
) {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (!check(a[i]!, b[i]!)) {
      return false;
    }
  }
  return true;
}

function round(a: number) {
  return Math.round(a * 100) / 100;
}

function Output() {
  return <OutputPill>output</OutputPill>;
}

type InputOrWeightSliderProps = {
  appState: AppState;
  setAppState: (appState: AppState) => void;
  networkName: NetworkName;
};

function InputSlider(props: InputOrWeightSliderProps & { inputIndex: number }) {
  const { appState, setAppState, inputIndex } = props;
  return (
    <RangeSlider
      className={rangeSliderClassName}
      id={`x-input-slider-${inputIndex}`}
      min="0"
      max="1"
      step="0.01"
      value={appState[props.networkName].inputs[inputIndex]!.value}
      onChange={(e) => {
        const network = appState[props.networkName];
        const input: Input = network.inputs[inputIndex]!;
        let inputs: Array<Input> = [];
        for (let i = 0; i < network.inputs.length; i++) {
          if (i === inputIndex) {
            inputs.push({ ...input, value: Number(e.target.value) });
          } else {
            inputs.push(network.inputs[i]!);
          }
        }
        setAppState({
          ...appState,
          [props.networkName]: { ...network, inputs },
        });
      }}
    />
  );
}

function WeightSlider(
  props: InputOrWeightSliderProps & { weightIndex: number },
) {
  const { appState, setAppState, weightIndex } = props;
  return (
    <RangeSlider
      className="col-span-7"
      id={`x-weight-slider-${weightIndex}`}
      min="-2"
      max="2"
      step="0.01"
      value={appState[props.networkName].weights[weightIndex]!.value}
      onChange={(e) => {
        const network = appState[props.networkName];
        const weight: Input = network.weights[weightIndex]!;
        let weights: Array<Input> = [];
        for (let i = 0; i < network.weights.length; i++) {
          if (i === weightIndex) {
            weights.push({ ...weight, value: Number(e.target.value) });
          } else {
            weights.push(network.weights[i]!);
          }
        }
        setAppState({
          ...appState,
          [props.networkName]: { ...network, weights },
        });
      }}
    />
  );
}

function X1SliderAndPill(props: AppStateAndNetwork) {
  return <InputSliderAndPill {...props} inputIndex={0} />;
}
function X2SliderAndPill(props: AppStateAndNetwork) {
  return <InputSliderAndPill {...props} inputIndex={1} />;
}

function W1SliderAndPill(props: AppStateAndNetwork) {
  return <WeightSliderAndPill {...props} weightIndex={0} />;
}
function W2SliderAndPill(props: AppStateAndNetwork) {
  return <WeightSliderAndPill {...props} weightIndex={1} />;
}
function W3SliderAndPill(props: AppStateAndNetwork) {
  return <WeightSliderAndPill {...props} weightIndex={2} />;
}

const inputSliderContainerClassName = "grid grid-cols-7 grid-flow-col";
const inputSliderLabelClassName = "col-span-1 text-left";
const rangeSliderClassName = "col-span-6";

function InputSliderAndPill(
  props: AppStateAndNetwork & { inputIndex: number },
) {
  const { appState, setAppState, networkName, inputIndex } = props;
  return (
    <div className={inputSliderContainerClassName}>
      <div className={inputSliderLabelClassName}>
        <label
          htmlFor={`x-input-slider-${inputIndex}`}
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          <InputPill>X{subscript(inputIndex + 1)}</InputPill> ={" "}
          <span className="text-sky-500">
            {round(appState[networkName].inputs[inputIndex]!.value)}
          </span>
        </label>
      </div>
      <InputSlider
        appState={appState}
        setAppState={setAppState}
        networkName={networkName}
        inputIndex={inputIndex}
      />
    </div>
  );
}

function WeightSliderAndPill(
  props: AppStateAndNetwork & { weightIndex: number },
) {
  const { appState, setAppState, networkName, weightIndex } = props;
  return (
    <div className={inputSliderContainerClassName}>
      <div className={inputSliderLabelClassName}>
        <label
          htmlFor={`x-weight-slider-${weightIndex}`}
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          <WeightPill>W{subscript(weightIndex + 1)}</WeightPill> ={" "}
          <span className="text-amber-500">
            {round(appState[networkName].weights[weightIndex]!.value)}
          </span>
        </label>
      </div>
      <WeightSlider
        appState={appState}
        setAppState={setAppState}
        networkName={networkName}
        weightIndex={weightIndex}
      />
    </div>
  );
}

export default function Example() {
  const [appState, setAppState] = React.useState<AppState>({
    notGateNetwork: NOT_GATE_NETWORK,
    orGateNetwork: zeroWeights(OR_GATE_NETWORK),
    showTease: true,
  });
  const showTease = appState.showTease;
  const notGateHOut = heaviside(networkOutput(appState.notGateNetwork));
  return (
    <div className="bg-white mb-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <IntroNeuron />
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            The Perceptron
          </h2>
          <h3>
            <a
              className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
              href="https://twitter.com/vicapow"
            >
              By Victor Powell
            </a>
            <a
              className="twitter-share-button"
              href="https://twitter.com/intent/tweet"
            >
              Tweet
            </a>
          </h3>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            To LLMs that can pass the bar exam, to renforcement learning
            alogrithms that can play video games, the foundational concept in
            all these are the perceptron, the powerhouse of netural networks.
            But what are they?
          </p>
          <div className="mx-auto">
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Perceptrons are tiny netural networks. They're made up of{" "}
              <InputPill>inputs</InputPill>,{" "}
              <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-amber-200 text-amber-400 ring-2 ring-inset ring-amber-400">
                weights
              </span>
              , an{" "}
              <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-pink-500 text-pink-200 ring-2 ring-inset ring-pink-200">
                output
              </span>
              , and an activation function (H).
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Let's look at the NOT perceptron. It takes an input and flips it.
            </p>
          </div>
          <div className="mt-6">
            <X1SliderAndPill
              appState={appState}
              setAppState={setAppState}
              networkName="notGateNetwork"
            />
          </div>
          <div className="mt-6">
            <PerceptronAlone
              showTease={showTease}
              network={appState.notGateNetwork}
              onChangeNetwork={(network) => {
                setAppState({
                  ...appState,
                  notGateNetwork: network,
                  showTease: false,
                });
              }}
            />
            <p className="mt-6 text-lg leading-8 text-gray-600">
              <InputPill>
                {round(appState.notGateNetwork.inputs[0]!.value)}
              </InputPill>
              {" × "}
              <WeightPill>
                {round(appState.notGateNetwork.weights[0]!.value)}
              </WeightPill>
              {" + "}
              <InputPill>
                {round(appState.notGateNetwork.inputs[1]!.value)}
              </InputPill>
              {" × "}
              <WeightPill>
                {round(appState.notGateNetwork.weights[1]!.value)}
              </WeightPill>
              {" = "}
              <OutputPill>
                {round(networkOutput(appState.notGateNetwork))}
              </OutputPill>
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              To make sure the values are only 0 or 1, the activation function
              takes the <Output /> value and returns <HOutPill value={0} /> if
              the value is negative and <HOutPill value={1} /> if the value is
              positive.
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              H({" "}
              <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-pink-500 text-pink-200 ring-2 ring-inset ring-pink-200">
                {round(networkOutput(appState.notGateNetwork))}
              </span>
              ) = <HOutPill value={notGateHOut} />
            </p>
            <svg viewBox="0 0 300 130">
              <g transform="translate(100,10)">
                <ClassificationPlot
                  width={100}
                  height={100}
                  network={appState.notGateNetwork}
                />
              </g>
            </svg>
            <div className="mt-6">
              <X1SliderAndPill
                appState={appState}
                setAppState={setAppState}
                networkName="notGateNetwork"
              />
            </div>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              What's most interesting about perceptrons, and neural networks in
              general, is their ability to learn. In our simple NOT perceptron,
              we started with the correct <WeightPill>weights</WeightPill>.
              Typically, we'll 'learn' the <WeightPill>weights</WeightPill>{" "}
              through training.
            </p>
          </div>
          <div className="mx-auto">
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Can you set the <WeightPill>weights</WeightPill> to implement the
              OR perceptron? When either of the two{" "}
              <InputPill>inputs</InputPill> are a <InputPill>1</InputPill>, H(
              <Output />) should be <HOutPill value={1} />. Otherwise, H(
              <Output />) should be <HOutPill value={0} />.
            </p>
            <table className="w-full table-fixed">
              <thead className="">
                <tr>
                  <th>
                    <InputPill>X{subscript(1)}</InputPill>
                  </th>
                  <th>
                    <InputPill>X{subscript(2)}</InputPill>
                  </th>
                  <th>expected</th>
                  <th>actual</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [0, 0, 0],
                  [0, 1, 1],
                  [1, 0, 1],
                  [1, 1, 1],
                ]
                  .map((row) => {
                    const network = modifyInputs(
                      row.slice(0, 2),
                      appState.orGateNetwork,
                    );
                    const h = heaviside(networkOutput(network));
                    const expected = row[row.length - 1] as 0 | 1;
                    return [
                      ...row.slice(0, 2).map((a) => <InputPill>{a}</InputPill>),
                      <HOutPill value={expected} />,
                      <HOutPill value={h} />,
                    ];
                  })
                  .map((row, index) => {
                    return (
                      <tr key={index}>
                        {row.map((r, index) => (
                          <td key={index}>{r}</td>
                        ))}
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            <div className="mt-6">
              <X1SliderAndPill
                appState={appState}
                setAppState={setAppState}
                networkName="orGateNetwork"
              />
              <X2SliderAndPill
                appState={appState}
                setAppState={setAppState}
                networkName="orGateNetwork"
              />
              <W1SliderAndPill
                appState={appState}
                setAppState={setAppState}
                networkName="orGateNetwork"
              />
              <W2SliderAndPill
                appState={appState}
                setAppState={setAppState}
                networkName="orGateNetwork"
              />
              <W3SliderAndPill
                appState={appState}
                setAppState={setAppState}
                networkName="orGateNetwork"
              />
            </div>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              <InputPill>
                {round(appState.orGateNetwork.inputs[0]!.value)}
              </InputPill>
              {" × "}
              <WeightPill>
                {round(appState.orGateNetwork.weights[0]!.value)}
              </WeightPill>
              {" + "}
              <InputPill>
                {round(appState.orGateNetwork.inputs[1]!.value)}
              </InputPill>
              {" × "}
              <WeightPill>
                {round(appState.orGateNetwork.weights[1]!.value)}
              </WeightPill>
              {" + "}
              <InputPill>
                {round(appState.orGateNetwork.inputs[2]!.value)}
              </InputPill>
              {" × "}
              <WeightPill>
                {round(appState.orGateNetwork.weights[2]!.value)}
              </WeightPill>
              {" = "}
              <OutputPill>
                {round(networkOutput(appState.orGateNetwork))}
              </OutputPill>
            </p>
            <div className="mt-6">
              <PerceptronAlone
                showTease={showTease}
                network={appState.orGateNetwork}
                onChangeNetwork={(network) => {
                  setAppState({
                    ...appState,
                    orGateNetwork: network,
                    showTease: false,
                  });
                }}
              />
            </div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={arraysEqual(
                appState.orGateNetwork.weights,
                OR_GATE_NETWORK.weights,
                (a, b) => a.value === b.value,
              )}
              onClick={() => {
                setAppState({
                  ...appState,
                  orGateNetwork: {
                    ...appState.orGateNetwork,
                    weights: OR_GATE_NETWORK.weights,
                  },
                });
              }}
            >
              show correct weights
            </button>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              To get to the <WeightPill>weights</WeightPill> without having to
              guess them, we can instead train the perceptron using examples,
              aka, data.
            </p>
            <table className="w-full table-fixed">
              <thead>
                <tr>
                  <th>
                    <InputPill>X{subscript(1)}</InputPill>
                  </th>
                  <th>
                    <InputPill>X{subscript(2)}</InputPill>
                  </th>
                  <th>expected</th>
                </tr>
              </thead>
              <tbody>
                {OR_GATE_DATA.map((row) => {
                  return [
                    ...row.slice(0, 2).map((a) => <InputPill>{a}</InputPill>),
                    <HOutPill value={row[2] as 0 | 1} />,
                  ];
                }).map((row, index) => {
                  return (
                    <tr key={index}>
                      {row.map((r, index) => (
                        <td key={index}>{r}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              The steps for this involves going through every example and seeing
              by how much the perceptron was wrong. If for a given example it
              was correct, we don't have to do anything. If it was wrong, we
              wiggle the weight a bit in the correct direction.
            </p>
            <ComputedWeights
              network={appState.orGateNetwork}
              data={OR_GATE_DATA}
            />
          </div>
          {/* <div className="mx-auto">
            <AndGatePerceptron showTease={showTease} hideTease={hideTease} />
          </div> */}
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<Example />);
