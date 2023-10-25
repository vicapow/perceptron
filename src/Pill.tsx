import * as React from "react";

export function InputPill(props: React.PropsWithChildren) {
  return (
    <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-sky-100 text-sky-300 ring-2 ring-inset ring-sky-500">
      {props.children}
    </span>
  );
}

export function WeightPill(props: React.PropsWithChildren) {
  return (
    <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-amber-200 text-amber-400 ring-2 ring-inset ring-amber-400">
      {props.children}
    </span>
  );
}

export function OutputPill(props: React.PropsWithChildren) {
  return (
    <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-pink-500 text-pink-200 ring-2 ring-inset ring-pink-200">
      {props.children}
    </span>
  );
}
export function HOutPill(props: React.PropsWithChildren & { value: 0 | 1 }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-white ring-2 ring-inset ${
        props.value === 1
          ? "ring-lime-200 bg-lime-400"
          : "ring-orange-200 bg-orange-400"
      }`}
    >
      {props.value}
    </span>
  );
}
