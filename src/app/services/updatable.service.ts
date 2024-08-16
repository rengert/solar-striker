import {Ticker} from "pixi.js";

export abstract class UpdatableService {
  abstract update(ticker: Ticker, level?: number): void;
}
