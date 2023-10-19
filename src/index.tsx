// @ts-ignore
window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { isDisabled: true };

import "./index.css";
import "flowbite";
import * as React from "react";
import ReactDOM from "react-dom/client";
// import { RangeSlider } from "flowbite-react";
import {
  AndGatePerceptron,
  OrGatePerceptron,
  NotGatePerceptron,
} from "./Perceptron";

export default function Example() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            The Perceptron
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            To LLMs that can pass the bar exam, to renforcement learning
            alogrithms that can play video games, the foundational concept in
            all these are the perceptron, the powerhouse of netural networks.
            But how do they work?
          </p>
          <div className="mx-auto">
            <p className="mt-6 text-lg leading-8 text-gray-600">
              This is an AND gate perceptron
            </p>
            <AndGatePerceptron />
          </div>
          <div className="mx-auto">
            <p className="mt-6 text-lg leading-8 text-gray-600">
              This is an OR gate perceptron
            </p>
            <OrGatePerceptron />
          </div>
          <div className="mx-auto">
            <p className="mt-6 text-lg leading-8 text-gray-600">
              The is a NOT gate perceptron
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
