import fs from "fs";
import path from "path";
import type { UsageSummary, TokenUsage } from "@/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const USAGE_FILE = path.join(DATA_DIR, "usage.json");

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function defaultUsage(): UsageSummary {
  return {
    experiments: [],
    allTimeInputTokens: 0,
    allTimeOutputTokens: 0,
    allTimeCostUsd: 0,
  };
}

export function loadUsage(): UsageSummary {
  try {
    ensureDataDir();
    if (!fs.existsSync(USAGE_FILE)) return defaultUsage();
    const raw = fs.readFileSync(USAGE_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return defaultUsage();
  }
}

export function recordUsage(experimentId: string, usage: TokenUsage): UsageSummary {
  const data = loadUsage();
  let expUsage = data.experiments.find((e) => e.experimentId === experimentId);
  if (!expUsage) {
    expUsage = {
      experimentId,
      calls: [],
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCostUsd: 0,
    };
    data.experiments.push(expUsage);
  }
  expUsage.calls.push(usage);
  expUsage.totalInputTokens += usage.inputTokens;
  expUsage.totalOutputTokens += usage.outputTokens;
  expUsage.totalCostUsd += usage.estimatedCostUsd;

  data.allTimeInputTokens += usage.inputTokens;
  data.allTimeOutputTokens += usage.outputTokens;
  data.allTimeCostUsd += usage.estimatedCostUsd;

  ensureDataDir();
  fs.writeFileSync(USAGE_FILE, JSON.stringify(data, null, 2), "utf-8");
  return data;
}

export function deleteExperimentUsage(experimentId: string): void {
  const data = loadUsage();
  const expUsage = data.experiments.find((e) => e.experimentId === experimentId);
  if (expUsage) {
    data.allTimeInputTokens -= expUsage.totalInputTokens;
    data.allTimeOutputTokens -= expUsage.totalOutputTokens;
    data.allTimeCostUsd -= expUsage.totalCostUsd;
    data.experiments = data.experiments.filter((e) => e.experimentId !== experimentId);
    ensureDataDir();
    fs.writeFileSync(USAGE_FILE, JSON.stringify(data, null, 2), "utf-8");
  }
}
