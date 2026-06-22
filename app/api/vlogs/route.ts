import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const GET = async () => {
  try {
    const res = await fetch(`${API_URL}/vlogs`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { success: false, message: `Backend error: ${text}` },
        { status: res.status },
      );
    }

    const backendData = await res.json();
    const vlogs = backendData?.data || [];

    const updatedVlogs = vlogs.map((vlog: any) => ({
      ...vlog,
      video: vlog.video ? `/vlogs/videos/${vlog.video.split("/").pop()}` : null,
    }));

    return NextResponse.json(
      { success: true, data: updatedVlogs },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("API /vlogs error:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Something went wrong",
      },
      { status: 500 },
    );
  }
};
