import { promises as fs } from "fs";
import path from "path";
import axios from "axios";

const QUEUE_DIR = path.join(process.cwd(), ".queue");
const QUEUE_FILE = path.join(QUEUE_DIR, "car_requests_queue.json");
const LOGS_DIR = path.join(QUEUE_DIR, "logs");

const CSV_COLUMNS = [
  "id",
  "license_plate",
  "driver_name",
  "vehicle_type_name",
  "company_name",
  "created_at",
  "sent_at",
];

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = typeof value === "object" ? JSON.stringify(value) : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

function getDailyCsvPath(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return path.join(LOGS_DIR, `car_requests_${y}-${m}-${d}.csv`);
}

function toCsvRow(request: any, sentAt: string): string {
  return [
    request?.id,
    request?.payload?.license_plate,
    request?.payload?.driver_name,
    request?.payload?.vehicle_type_name,
    request?.payload?.company_name,
    request?.createdAt,
    sentAt,
  ]
    .map(csvEscape)
    .join(",");
}

async function appendToDailyCsv(payload: unknown): Promise<void> {
  const requests = Array.isArray(payload) ? payload : [payload];
  if (requests.length === 0) return;

  await fs.mkdir(LOGS_DIR, { recursive: true });

  const csvPath = getDailyCsvPath();
  const sentAt = new Date().toISOString();
  const rows = requests.map((r) => toCsvRow(r, sentAt)).join("\n");
  const header = CSV_COLUMNS.map(csvEscape).join(",");

  let existing = "";
  try {
    existing = await fs.readFile(csvPath, "utf-8");
  } catch {
    existing = "";
  }

  const content = existing.trim().length
    ? `${existing.trimEnd()}\n${rows}\n`
    : `${header}\n${rows}\n`;

  await fs.writeFile(csvPath, content, "utf-8");
}

export interface QueueItem {
  id: string;
  payload: unknown;
  status: "pending" | "sent" | "failed";
  attempts: number;
  createdAt: string;
  updatedAt: string;
  lastError?: string;
}

async function ensureQueue(): Promise<QueueItem[]> {
  try {
    await fs.access(QUEUE_DIR);
  } catch {
    await fs.mkdir(QUEUE_DIR, { recursive: true });
  }

  try {
    const raw = await fs.readFile(QUEUE_FILE, "utf-8");
    return JSON.parse(raw) as QueueItem[];
  } catch {
    return [];
  }
}

async function writeQueue(items: QueueItem[]): Promise<void> {
  await fs.writeFile(QUEUE_FILE, JSON.stringify(items, null, 2), "utf-8");
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function enqueue(payload: unknown) {
  const items = await ensureQueue();
  const requests = Array.isArray(payload) ? payload : [payload];

  for (const p of requests) {
    const i: QueueItem = {
      id: generateId(),
      payload: p,
      status: "pending",
      attempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    items.push(i);
    await appendToDailyCsv(p);
  }

  await writeQueue(items);
}

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const DJANGO_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}car/create/`;

export interface FlushResult {
  sent: number;
  failed: number;
}

export async function flushQueue(
  authorization?: string | null,
): Promise<FlushResult> {
  const items = await ensureQueue();

  let sent = 0;
  let failed = 0;

  for (const item of items) {
    if (item.status === "sent") {
      sent += 1;
      continue;
    }

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (authorization) headers["Authorization"] = authorization;

      const res = await axios.post(DJANGO_URL, item.payload, {
        headers,
        validateStatus: () => true,
      });

      item.attempts += 1;
      item.updatedAt = new Date().toISOString();

      if (res.status >= 200 && res.status < 300) {
        item.status = "sent";
        sent += 1;
      } else if (item.attempts >= MAX_RETRIES) {
        item.status = "failed";
        item.lastError = `status ${res.status}: ${JSON.stringify(res.data)}`;
        failed += 1;
      } else {
        item.status = "pending";
        const delay = BASE_DELAY_MS * Math.pow(2, item.attempts - 1);
        await sleep(delay);
      }
    } catch (err: any) {
      globalThis.console.error("Backend connection error in flushQueue:", err);
      item.attempts += 1;
      item.updatedAt = new Date().toISOString();

      if (item.attempts >= MAX_RETRIES) {
        item.status = "failed";
        item.lastError = err?.message ?? String(err);
        failed += 1;
      } else {
        item.status = "pending";
        const delay = BASE_DELAY_MS * Math.pow(2, item.attempts - 1);
        await sleep(delay);
      }
    }
  }

  const remaining = items.filter((i) => i.status !== "sent");
  await writeQueue(remaining);

  return { sent, failed };
}
