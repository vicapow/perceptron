import { NetworkState } from "./Perceptron";

export type AppState = {
  notGateNetwork: NetworkState;
  orGateNetwork: NetworkState;
  irisNetwork: NetworkState;
  showTease: boolean;
};

type ObjectKeys<T> = { [K in keyof T]: K };

export type NetworkName = keyof Omit<ObjectKeys<AppState>, "showTease">;
