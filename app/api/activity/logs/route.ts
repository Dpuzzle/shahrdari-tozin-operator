import { NextRequest, NextResponse } from "next/server";
import { readDailyCsv, listAvailableCsvDates, parseCsv } from "@/lib/server/csv";

export const dynamic = "force-dynamic";


export async function GET() {
  try {
    const data = await readDailyCsv(new Date());
    const availableDates = await listAvailableCsvDates();

    return NextResponse.json(
      {
        date:  new Date().toISOString().slice(0, 10),
        count: data.length,
        data,
        availableDates,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "unknown error" },
      { status: 500 }
    );
  }
}
