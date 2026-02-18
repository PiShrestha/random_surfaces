export interface Step {
  top: string;
  bot: string;
  gap: number;
}

export interface GapPoint {
  step: number;
  gap: number;
}

export type SimStatus = "idle" | "running" | "paused" | "coupled";
export type Metric = "area" | "hamming";

export interface InitResponse {
  top: string;
  bot: string;
  gap: number;
  n: number;
  m: number;
}

export interface BatchResponse {
  history: Step[];
  coupled: boolean;
  steps_run: number;
}
