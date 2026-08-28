import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.search;
    const backendUrl = `${process.env.NEXT_PUBLIC_MID_URL}${search}`;

    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const res = await axios.get(backendUrl, {
      headers,
      validateStatus: () => true,
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: any) {
    globalThis.console.error("Mid backend connection error:", error);
    return NextResponse.json(
      { error: "Client is offline", offline: true },
      { status: 502 }
    );
  }
}
