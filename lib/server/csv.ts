import { promises as fs } from "fs";
import path from "path";

const QUEUE_DIR = path.join(process.cwd(), ".queue");
const LOGS_DIR = path.join(QUEUE_DIR, "logs");

export function getDailyCsvPath(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return path.join(LOGS_DIR, `activity_${y}-${m}-${d}.csv`);
}

export function parseCsv(content: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (inQuotes) {
      if (char === '"') {
        if (content[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char === "\r") {
      // ignore carriage returns
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const nonEmpty = rows.filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ""));
  if (nonEmpty.length === 0) return [];

  const [header, ...dataRows] = nonEmpty;

  return dataRows
    .filter((r) => r.some((c) => c.trim() !== ""))
    .map((r) => {
      const record: Record<string, string> = {};
      header.forEach((key, idx) => {
        record[key] = r[idx] ?? "";
      });
      return record;
    }).reverse();
}

export async function readDailyCsv(
  date = new Date()
): Promise<Record<string, string>[]> {
  const csvPath = getDailyCsvPath(date);
  try {
    const content = await fs.readFile(csvPath, "utf-8");
    return parseCsv(content);
  } catch {
    return [];
  }
}

export async function listAvailableCsvDates(): Promise<string[]> {
  try {
    const files = await fs.readdir(LOGS_DIR);
    return files
      .filter((f) => f.startsWith("activity_") && f.endsWith(".csv"))
      .map((f) => f.replace("activity_", "").replace(".csv", ""))
      .sort();
  } catch {
    return [];
  }
}
