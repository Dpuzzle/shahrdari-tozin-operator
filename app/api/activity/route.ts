import { NextRequest, NextResponse } from "next/server";
import { enqueue, flushQueue } from "@/lib/server/activityQueue";
import axios from "axios";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization");
    const headers: Record<string, string> = {};
    if (authorization) headers["Authorization"] = authorization;

    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_URL}activity/`,
      { headers, validateStatus: () => true }
    );

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: any) {
    globalThis.console.error("Backend connection error:", error);
    return NextResponse.json(
      { error: "Client is offline", offline: true },
      { status: 502 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const authorization = req.headers.get("authorization");

    // 1. cache each request on disk as a JSON file
    await enqueue(payload);

    // 2. after caching, send all not-yet-sent (pending) data to the Django server
    const result = await flushQueue(authorization);

    return NextResponse.json(
      { detail: "Activity cached", ...result },
      { status: 200 }
    );
  } catch (error: any) {
    globalThis.console.error("Backend connection error:", error);
    return NextResponse.json(
      { error: "Client is offline", offline: true },
      { status: 502 }
    );
  }
}
