import fs from "fs";
import path from "path";
import type { Experiment } from "@/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const EXPERIMENTS_FILE = path.join(DATA_DIR, "experiments.json");

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadExperiments(): Experiment[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(EXPERIMENTS_FILE)) return [];
    const raw = fs.readFileSync(EXPERIMENTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveExperiment(experiment: Experiment): void {
  ensureDataDir();
  const experiments = loadExperiments();
  // 같은 ID가 있으면 업데이트, 없으면 맨 앞에 추가
  const idx = experiments.findIndex((e) => e.id === experiment.id);
  if (idx >= 0) {
    experiments[idx] = experiment;
  } else {
    experiments.unshift(experiment);
  }
  // 최대 50개 유지
  const trimmed = experiments.slice(0, 50);
  fs.writeFileSync(EXPERIMENTS_FILE, JSON.stringify(trimmed, null, 2), "utf-8");
}

export function deleteExperiment(id: string): boolean {
  const experiments = loadExperiments();
  const filtered = experiments.filter((e) => e.id !== id);
  if (filtered.length === experiments.length) return false;
  ensureDataDir();
  fs.writeFileSync(EXPERIMENTS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}
