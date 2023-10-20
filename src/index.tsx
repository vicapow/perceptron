// @ts-ignore
window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { isDisabled: true };

import "./index.css";
import "flowbite";
import * as React from "react";
import ReactDOM from "react-dom/client";
import { heaviside } from "./HeavisideActivation";
import ClassificationPlot from "./ClassificationPlot";
// import { RangeSlider } from "flowbite-react";
import {
  AndGatePerceptron,
  OrGatePerceptron,
  PerceptronAlone,
  NetworkState,
  NOT_GATE_NETWORK,
  networkOutput,
} from "./Perceptron";
import { IntroNeuron } from "./IntroNeuron";

type AppState = {
  notGateNetwork: NetworkState;
  showTease: boolean;
};

function round(a: number) {
  return Math.round(a * 100) / 100;
}

export default function Example() {
  const [appState, setAppState] = React.useState<AppState>({
    notGateNetwork: NOT_GATE_NETWORK,
    showTease: true,
  });
  function hideTease() {
    setAppState({
      ...appState,
      showTease: false,
    });
  }
  const showTease = appState.showTease;
  const notGateHOut = heaviside(networkOutput(appState.notGateNetwork));
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <IntroNeuron />
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            The Perceptron
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            To LLMs that can pass the bar exam, to renforcement learning
            alogrithms that can play video games, the foundational concept in
            all these are the perceptron, the powerhouse of netural networks.
            But what are they?
          </p>
          <div className="mx-auto">
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Perceptrons are tiny netural networks. They're made up of{" "}
              <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-sky-100 text-sky-300 ring-2 ring-inset ring-sky-500">
                inputs
              </span>
              ,{" "}
              <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-amber-200 text-amber-400 ring-2 ring-inset ring-amber-400">
                weights
              </span>
              , an{" "}
              <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-pink-500 text-pink-200 ring-2 ring-inset ring-pink-200">
                output
              </span>
              , and an activation function.
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Let's look at the NOT perceptron. It takes an input and flips it.
            </p>
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
              <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-sky-100 text-sky-300 ring-2 ring-inset ring-sky-500">
                {round(appState.notGateNetwork.inputs[0]!.value)}
              </span>
              {" × "}
              <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-amber-200 text-amber-400 ring-2 ring-inset ring-amber-400">
                {round(appState.notGateNetwork.weights[0]!.value)}
              </span>
              {" + "}
              <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-sky-100 text-sky-300 ring-2 ring-inset ring-sky-500">
                {round(appState.notGateNetwork.inputs[1]!.value)}
              </span>
              {" × "}
              <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-amber-200 text-amber-400 ring-2 ring-inset ring-amber-400">
                {round(appState.notGateNetwork.weights[1]!.value)}
              </span>
              {" = "}
              <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-pink-500 text-pink-200 ring-2 ring-inset ring-pink-200">
                {round(networkOutput(appState.notGateNetwork))}
              </span>
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              To make sure the values are only 0 or 1, we use the heaviside
              activation function.
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              H({" "}
              <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-pink-500 text-pink-200 ring-2 ring-inset ring-pink-200">
                {round(networkOutput(appState.notGateNetwork))}
              </span>
              ) ={" "}
              <span
                className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-white ring-2 ring-inset ${
                  notGateHOut === 1
                    ? "ring-lime-200 bg-lime-400"
                    : "ring-orange-200 bg-orange-400"
                }`}
              >
                {notGateHOut}
              </span>
            </p>
            <g transform="translate(25, 10)">
              <svg viewBox="0 0 300 130">
                <g transform="translate(100,10)">
                  <ClassificationPlot
                    width={100}
                    height={100}
                    network={appState.notGateNetwork}
                  />
                </g>
              </svg>
            </g>
          </div>
          <div className="mx-auto">
            <p className="mt-6 text-lg leading-8 text-gray-600">
              This is an OR gate perceptron
            </p>
            <OrGatePerceptron showTease={showTease} hideTease={hideTease} />
          </div>
          <div className="mx-auto">
            <AndGatePerceptron showTease={showTease} hideTease={hideTease} />
          </div>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<Example />);
