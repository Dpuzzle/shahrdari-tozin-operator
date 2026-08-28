import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export const dynamic = "force-dynamic";

async function proxy(req: NextRequest): Promise<NextResponse> {
  try {
    const pathname = req.nextUrl.pathname;
    const search = req.nextUrl.search;
    const backendPath = pathname.replace(/^\/api/, "") || "/";
    const backendUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}${backendPath}${search}`;

    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });

    let data: string | undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      data = await req.text();
    }

    const res = await axios.request({
      url: backendUrl,
      method: req.method,
      headers,
      data,
      validateStatus: () => true,
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "unknown error" },
      { status: 500 }
    );
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as DELETE, proxy as PATCH };
