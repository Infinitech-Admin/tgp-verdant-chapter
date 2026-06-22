import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  try {
    const res = await fetch(`${API}/galleries`, {
      credentials: "include",
    });

    const data = await res.json();

    // data from backend is already an array
    return NextResponse.json(
      {
        success: true,
        data: Array.isArray(data) ? data : (data.data ?? []),
      },
      { status: res.status },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        data: [],
        message: "Failed to fetch galleries",
      },
      { status: 500 },
    );
  }
}
