// app/api/events/invites/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:8000/api";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Call Laravel's getInvites route
    const res = await fetch(`${API_URL}/events/invites`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Laravel error:", text);
      return NextResponse.json({ error: "Laravel request failed" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data); // expects { data: [...] }
  } catch (err) {
    console.error("Next API error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
