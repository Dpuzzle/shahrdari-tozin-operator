import { promises as fs } from "fs";
import path from "path";
import axios from "axios";

const QUEUE_DIR = path.join(process.cwd(), ".queue");
const QUEUE_FILE = path.join(QUEUE_DIR, "activity_queue.json");
const LOGS_DIR = path.join(QUEUE_DIR, "logs");

const CSV_COLUMNS = [
  "tozin_id",
  "id",
  "vehicle_id",
  "vehicle_plate",
  "vehicle_driver",
  "weighing_type_id",
  "weighing_type_name",
  "work_type_id",
  "Empty",
  "Full",
  "address",
  "Field_Data",
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
  return path.join(LOGS_DIR, `activity_${y}-${m}-${d}.csv`);
}

function toCsvRow(activity: any, sentAt: string): string {
  return [
    activity?.tozin_id,
    activity?.id,
    activity?.vehicle_id ?? activity?.Car?.pk,
    activity?.Car?.license_plate,
    activity?.Car?.driver?.name ?? activity?.Car?.driver,
    activity?.weighing_type_id ?? activity?.Action?.pk,
    activity?.Action?.name,
    activity?.work_type_id,
    activity?.Empty,
    activity?.Full,
    activity?.address,
    activity?.Field_Data,
    sentAt,
  ]
    .map(csvEscape)
    .join(",");
}

async function appendToDailyCsv(payload: unknown): Promise<void> {
  const activities = Array.isArray(payload) ? payload : [payload];
  if (activities.length === 0) return;

  await fs.mkdir(LOGS_DIR, { recursive: true });

  const csvPath = getDailyCsvPath();
  const sentAt = new Date().toISOString();
  const rows = activities.map((a) => toCsvRow(a, sentAt)).join("\n");
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
  const exiests_tozin_id = items.map((i) => (i.payload as any).tozin_id);

  (payload as any).forEach(async (p: any) => {
    let i = {
      id: generateId(),
      payload: p,
      status: "pending" as any,
      attempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!exiests_tozin_id.includes(p.tozin_id)) {
      items.push(i);
      await appendToDailyCsv(p);
    }
  });

  await writeQueue(items);
  // return item;
}

const MAX_RETRIES = 1;
const BASE_DELAY_MS = 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const DJANGO_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}activity/`;

export interface FlushResult {
  sent: number;
  failed: number;
  response?: any;
}

export async function flushQueue(
  authorization?: string | null,
): Promise<FlushResult> {
  const items = await ensureQueue();

  let sent = 0;
  let failed = 0;
  const combinedWeighing: any[] = [];

  for (const item of items) {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (authorization) headers["Authorization"] = authorization;

      const res = await axios.post(DJANGO_URL, [item.payload], {
        headers,
        validateStatus: () => true,
      });

      item.attempts += 1;
      item.updatedAt = new Date().toISOString();

      if (res.status >= 200 && res.status < 300) {
        item.status = "sent";
        sent += 1;
        if (Array.isArray(res.data?.Weighing)) {
          combinedWeighing.push(...res.data.Weighing);
        } else if (res.data) {
          combinedWeighing.push(res.data);
        }
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

  return {
    sent,
    failed,
    response: combinedWeighing.length
      ? { Weighing: combinedWeighing }
      : undefined,
  };
}
