import { NextRequest, NextResponse } from "next/server";
import { enqueue, flushQueue } from "@/lib/server/activityQueue";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const authorization = req.headers.get("authorization");

    console.log("[API] get the request for save and send");

    // 1. cache each request on disk as a JSON file
    await enqueue(payload);

    // 2. after caching, send all not-yet-sent (pending) data to the Django server
    const result = await flushQueue(authorization);

    return NextResponse.json(
      { detail: "Activity cached", ...result },
      { status: 200 },
    );
  } catch (error: any) {
    globalThis.console.error("Backend connection error:", error);
    return NextResponse.json(
      { error: "Client is offline", offline: true },
      { status: 502 },
    );
  }
}
